import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// POST handler to refine college recommendations
export async function POST(request) {
  try {
    const body = await request.json();
    const { initial_query, follow_up_answers, user_profile, conversation_history, current_recommendations, response_type, test_mode } = body;
    
    // Get the user's session
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      // Continue without session
      session = null;
    }
    
    // Initialize the user context with any user_profile passed in the request
    let userProfile = user_profile || {};
    
    // If user is authenticated, fetch their preferences from database to merge with any passed profile
    if (session?.user?.email) {
      try {
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
          } catch (parseError) {
            console.error("Error parsing stored preferences:", parseError);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        // Continue even if there's an error fetching preferences
      }
    }

    // Get the API URL from environment variable or use a default
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').trim();
    console.log("Using API URL:", API_URL);
    
    // Prepare the payload for the backend request
    const payload = {
      initial_query,
      follow_up_answers,
      user_profile: userProfile,
      conversation_history,
      current_recommendations
    };
    
    console.log("Sending refinement payload to backend:", {
      ...payload,
      current_recommendations: payload.current_recommendations ? 
        `${payload.current_recommendations.length} colleges` : "none"
    });
    
    // Make a request to the FastAPI backend
    const response = await fetch(`${API_URL}/api/colleges/refinements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    let data;
    
    try {
      // Check the content type to properly handle the response
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        // If it's JSON, parse it normally
        data = await response.json();
      } else {
        // If not JSON, try to get the text and format it
        const text = await response.text();
        console.log("Received non-JSON response:", text.substring(0, 200) + "...");
        
        if (!response.ok) {
          throw new Error(`Server returned non-JSON response with status ${response.status}: ${text.substring(0, 100)}...`);
        }
        
        // Try to convert the response to a valid JSON structure
        try {
          // First, see if maybe it's just JSON with wrong content-type
          data = JSON.parse(text);
        } catch (jsonError) {
          // If not parse-able as JSON, create a simple response with the text as search_summary
          console.log("Converting text response to JSON structure");
          data = {
            recommendations: [],
            search_summary: text
          };
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      throw new Error(`Failed to parse response: ${parseError.message}`);
    }
    
    if (!response.ok && !data) {
      // If we haven't handled the error yet and the response isn't OK
      throw new Error(`Failed to refine college recommendations from backend: ${response.status} ${response.statusText}`);
    }
    
    console.log(`Received ${data.recommendations?.length || 0} recommendations from refinement`, data);
    
    // Save colleges to the database before returning them (only for new colleges)
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
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error refining college recommendations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refine college recommendations' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

