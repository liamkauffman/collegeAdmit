import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST handler to get college recommendations
export async function POST(request) {
  try {
    const body = await request.json();
    const { initial_query, follow_up_answers, user_profile } = body;
    
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
        // Get the user from the database
        const user = await prisma.user.findUnique({
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Prepare the payload for the backend request
    const payload = {
      initial_query,
      follow_up_answers,
      user_profile: userProfile
    };
    
    // Make a request to the FastAPI backend
    const response = await fetch(`${API_URL}/api/colleges/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      // If the backend returns an error, parse it and return it
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate college recommendations from backend');
    }
    
    // Parse the response from the backend
    const data = await response.json();
    
    // Return the recommendations
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error generating college recommendations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate college recommendations' },
      { status: 500 }
    );
  }
} 