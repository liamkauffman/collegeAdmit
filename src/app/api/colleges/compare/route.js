import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

/**
 * POST handler for college comparison
 * Takes a college_id and an optional limit parameter
 * Returns similar colleges from the backend API
 */
export async function POST(request) {
  try {
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Parse the request body
    const body = await request.json();
    const { college_id, limit = 3 } = body;
    
    if (!college_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: college_id' },
        { status: 400 }
      );
    }
    
    // Get the user's session
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      // Continue without session
      session = null;
    }
    
    // Build the API URL
    const apiUrl = `${API_URL}/api/colleges/compare`;
    
    console.log(`Making request to backend API: ${apiUrl}`);
    console.log(`Request payload: college_id=${college_id}, limit=${limit}`);
    
    // Make a request to the FastAPI backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        college_id: college_id,
        limit: limit
      })
    });
    
    if (!response.ok) {
      // If the backend returns an error, parse it and return it
      const errorData = await response.json();
      console.error(`Backend API error: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.detail || 'Failed to fetch similar colleges from backend');
    }
    
    // Parse the response from the backend
    const data = await response.json();
    
    // Return the similar colleges as JSON
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in college comparison:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compare colleges' },
      { status: 500 }
    );
  }
} 