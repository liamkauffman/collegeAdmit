import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST handler to fetch a single follow-up question with conversation context
export async function POST(request) {
  console.log('Starting single follow-up question POST request');
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
      user_profile: userProfile,
      conversation_history: body.conversation_history || []
    };
    
    console.log('Sending payload to backend:', payload);
    
    // Make the request to the backend
    try {
      const apiEndpoint = `${API_URL}/api/colleges/follow-up-question`;
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
          return new Response(JSON.stringify({ error: errorData.detail || 'Failed to fetch follow-up question' }), {
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
      console.log('Successfully received follow-up question:', data);
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in follow-up question route:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch follow-up question' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 