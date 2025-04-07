import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET handler to fetch follow-up questions - keep for backward compatibility
export async function GET() {
  console.log('Starting follow-up questions GET request');
  try {
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('Using API URL:', API_URL);
    
    // Get the user's session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      session = null;
    }
    
    // Initialize the user context
    let userContext = null;
    
    // If user is authenticated, fetch their preferences
    if (session?.user?.email) {
      try {
        console.log('Fetching user preferences for:', session.user.email);
        // Get the user from the database
        const user = await prisma.User.findUnique({
          where: { email: session.user.email },
          include: { preferences: true }
        });
        
        // If user has preferences, include them in the context
        if (user?.preferences?.data) {
          userContext = user.preferences.data;
          console.log('User preferences loaded successfully');
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    }
    
    // Build the API URL - if we have user context, include it as a query parameter
    let apiUrl = `${API_URL}/api/colleges/follow-up-questions`;
    console.log('Making request to:', apiUrl);
    
    // Make a request to the FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(userContext && { 'X-User-Context': JSON.stringify(userContext) })
      },
    });
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      // If the backend returns an error, parse it and return it
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      return new Response(JSON.stringify({ error: errorData.detail || 'Failed to fetch follow-up questions from backend' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Parse the response from the backend
    const data = await response.json();
    console.log('Successfully received follow-up questions:', data);
    
    // Return the questions as JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in follow-up questions route:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch follow-up questions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST handler to fetch follow-up questions with initial query and preferences
export async function POST(request) {
  console.log('Starting follow-up questions POST request');
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // Get user session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      session = null;
    }
    
    // Initialize the user context
    let userProfile = {};
    
    // If user is authenticated, fetch their preferences
    if (session?.user?.email) {
      try {
        console.log('Fetching user preferences for:', session.user.email);
        const user = await prisma.User.findUnique({
          where: { email: session.user.email },
          include: { preferences: true }
        });
        
        if (user?.preferences?.data) {
          try {
            const storedPreferences = JSON.parse(user.preferences.data);
            userProfile = { ...storedPreferences };
            console.log('User preferences loaded successfully');
          } catch (parseError) {
            console.error('Error parsing stored preferences:', parseError);
          }
        } else {
          console.log('No preferences found for user');
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    }
    
    // Merge in any user profile data from the request
    if (body.user_profile) {
      userProfile = { ...userProfile, ...body.user_profile };
    }
    
    // Get API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();
    console.log('Using API URL:', API_URL);
    
    // Prepare the payload
    const payload = {
      initial_query: body.initial_query,
      user_profile: userProfile
    };
    
    console.log('Sending payload to backend:', payload);
    
    // Make the request to the backend
    try {
      const apiEndpoint = `${API_URL}/api/colleges/follow-up-questions`;
      console.log('Making fetch request to:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        console.log('Response content type:', contentType);
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error('Error from backend (JSON):', errorData);
          return new Response(JSON.stringify({ error: errorData.detail || 'Failed to fetch follow-up questions' }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          // Handle non-JSON response
          const text = await response.text();
          console.error('Non-JSON error from backend:', text.substring(0, 500) + (text.length > 500 ? "..." : ""));
          return new Response(JSON.stringify({ error: `Server returned non-JSON response with status ${response.status}` }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      
      const data = await response.json();
      console.log('Successfully received follow-up questions:', data);
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in follow-up questions route:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch follow-up questions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 