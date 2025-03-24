import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

// GET handler to fetch follow-up questions - keep for backward compatibility
export async function GET() {
  try {
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Get the user's session
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      // Continue without session
      session = null;
    }
    
    // Initialize the user context
    let userContext = null;
    
    // If user is authenticated, fetch their preferences
    if (session?.user?.email) {
      try {
        // Get the user from the database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { preferences: true }
        });
        
        // If user has preferences, include them in the context
        if (user?.preferences?.data) {
          userContext = user.preferences.data;
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        // Continue even if there's an error fetching preferences
      }
    }
    
    // Build the API URL - if we have user context, include it as a query parameter
    let apiUrl = `${API_URL}/api/colleges/follow-up-questions`;
    
    // Make a request to the FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(userContext && { 'X-User-Context': JSON.stringify(userContext) })
      },
    });
    
    if (!response.ok) {
      // If the backend returns an error, parse it and return it
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch follow-up questions from backend');
    }
    
    // Parse the response from the backend
    const data = await response.json();
    
    // Return the questions as JSON
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching follow-up questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch follow-up questions' },
      { status: 500 }
    );
  }
}

// POST handler to fetch follow-up questions with initial query and preferences
export async function POST(request) {
  try {
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Get request body - initial query and any existing user profile data
    const body = await request.json();
    const { initial_query, user_profile } = body;
    
    // Get the user's session
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      // Continue without session
      session = null;
    }
    
    // Initialize the user context
    let userContext = user_profile || {};
    
    // If user is authenticated, fetch their preferences from database
    if (session?.user?.email) {
      try {
        // Get the user from the database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { preferences: true }
        });
        
        // If user has preferences in the database, merge them with provided profile
        if (user?.preferences?.data) {
          try {
            // Parse stored preferences which are in string format
            const storedPreferences = JSON.parse(user.preferences.data);
            // Merge stored preferences with any provided profile data
            userContext = { ...storedPreferences, ...userContext };
          } catch (parseError) {
            console.error("Error parsing stored preferences:", parseError);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        // Continue even if there's an error fetching preferences
      }
    }
    
    // Build the API URL
    let apiUrl = `${API_URL}/api/colleges/follow-up-questions`;
    
    // Make a request to the FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        initial_query: initial_query,
        user_context: userContext
      })
    });
    
    if (!response.ok) {
      // If the backend returns an error, parse it and return it
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch follow-up questions from backend');
    }
    
    // Parse the response from the backend
    const data = await response.json();
    
    // Return the questions as JSON
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching follow-up questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch follow-up questions' },
      { status: 500 }
    );
  }
} 