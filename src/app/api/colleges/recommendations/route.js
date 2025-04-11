import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();
// POST handler to get college recommendations
export async function POST(request) {
  console.log('Starting college recommendations POST request');
  try {
    const body = await request.json();
    const { initial_query, follow_up_answers, user_profile } = body;
    console.log('Request body:', { initial_query, follow_up_answers });
    
    // Get the user's session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      session = null;
    }
    
    // Initialize the user context with any user_profile passed in the request
    let userProfile = user_profile || {};
    
    // If user is authenticated, fetch their preferences from database to merge with any passed profile
    if (session?.user?.email) {
      try {
        console.log('Fetching user preferences for:', session.user.email);
        // Get the user from the database - correct case is "User" not "user"
        const user = await prisma.User.findUnique({
          where: { email: session.user.email },
          include: { preferences: true }
        });
        
        // If user has preferences in the database, merge them with any provided profile
        if (user?.preferences?.data) {
          try {
            // Parse stored preferences which are in string format
            const storedPreferences = JSON.parse(user.preferences.data);
            // Merge stored preferences with any provided profile data
            userProfile = { ...storedPreferences, ...userProfile };
            console.log('User preferences loaded successfully');
          } catch (parseError) {
            console.error("Error parsing stored preferences:", parseError);
          }
        } else {
          console.log('No preferences found for user');
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    }

    // Get the API URL from environment variable or use a default
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').trim();
    console.log("Using API URL:", API_URL);
    
    // Prepare the payload for the backend request
    const payload = {
      initial_query,
      follow_up_answers,
      user_profile: userProfile
    };
    
    console.log("Sending payload to backend:", payload);
    
    // Make a request to the FastAPI backend
    const apiEndpoint = `${API_URL}/api/colleges/recommendations-from-top`;
    console.log('Making fetch request to:', apiEndpoint);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Starting to read response stream');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    
    console.log('Reading response stream chunks...');
    while(true) {
      const { done, value } = await reader.read();
      if(done) {
        console.log('Finished reading response stream');
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk of length:', chunk.length);
      result += chunk;
    }

    const responseText = result;
    console.log('Total response length:', responseText.length);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      // Check if the response is HTML (often an error page) rather than JSON
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (contentType && contentType.includes('text/html')) {
        // Handle HTML error responses
        const htmlText = await response.text();
        console.error('HTML error response received:', htmlText.substring(0, 500));
        return new Response(JSON.stringify({ 
          error: `Backend returned HTML instead of JSON. Status: ${response.status}` 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      try {
        // Try to parse JSON error
        const errorData = await response.json();
        console.error('Error data from backend:', errorData);
        return new Response(JSON.stringify({ 
          error: errorData.detail || 'Failed to generate college recommendations from backend' 
        }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        // If JSON parsing fails, return the raw response text (limited)
        const text = await response.text();
        console.error('Non-JSON error from backend:', text.substring(0, 500));
        return new Response(JSON.stringify({ 
          error: `Failed to parse backend response. Status: ${response.status}` 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Check content type before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Unexpected content type:', contentType);
      const text = await response.text();
      console.error('Unexpected content:', text.substring(0, 500));
      return new Response(JSON.stringify({ 
        error: `Backend returned unexpected content type: ${contentType}` 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Parse the response from the backend
    const data = await response.json();
    console.log(`Received ${data.recommendations?.length || 0} recommendations from backend`);
    
    // Save colleges to the database before returning them
    try {
      if (data.recommendations && Array.isArray(data.recommendations)) {
        console.log(`Saving ${data.recommendations.length} colleges to the database...`);
        
        // Process each college
        for (const college of data.recommendations) {
          // Ensure ID is a string
          const collegeId = String(college.id);
          
          // Check if college already exists in database
          const existingCollege = await prisma.College.findFirst({
            where: {
              OR: [
                { id: collegeId },
                { name: college.name }
              ]
            }
          });
          
          if (!existingCollege) {
            console.log(`Creating new college: ${college.name} with ID: ${collegeId}`);
            
            // Create new college entry
            const createdCollege = await prisma.College.create({
              data: {
                id: collegeId,
                name: college.name,
                state: college.state || null,
                city: college.city || null,
                type: college.type || null,
                tuition: college.cost ? 
                  (college.cost.amount ? parseInt(college.cost.amount) : null) : 
                  null,
                acceptanceRate: college.acceptance_rate ? parseFloat(college.acceptance_rate) : null,
                enrollmentSize: college.size ? 
                  (college.size.students ? parseInt(college.size.students) : null) : 
                  null,
                website: college.website || college.recruiting_info || null,
                description: college.ai_insight || null
              }
            });
            
            console.log(`Successfully created college with ID: ${createdCollege.id}`);
            
            // If the college has top majors, save them too
            if (college.top_majors && Array.isArray(college.top_majors)) {
              for (const majorData of college.top_majors) {
                // Find or create the major
                let major = await prisma.Major.findUnique({
                  where: { name: majorData.name }
                });
                
                if (!major) {
                  major = await prisma.Major.create({
                    data: {
                      name: majorData.name,
                      category: majorData.category || null
                    }
                  });
                }
                
                // Link the major to the college
                await prisma.CollegeMajor.create({
                  data: {
                    collegeId: createdCollege.id,
                    majorId: major.id
                  }
                });
              }
            }
          } else {
            console.log(`College "${college.name}" already exists in database with ID: ${existingCollege.id}`);
          }
        }
      }
    } catch (dbError) {
      console.error("Error saving colleges to database:", dbError);
      console.error(dbError.stack);
      // Continue even if there's an error saving to database
    }
    
    // Return the recommendations
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating college recommendations:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate college recommendations' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
} 