import { NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function POST(request) {
  try {
    const searchParams = await request.json();
    
    // Log the API URL for debugging

    console.log(`Attempting to fetch from: ${API_URL}/search`);
    
    
    // Make the request to your external API from the server
    const response = await fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });
    
    // Log the response status for debugging
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      // Return a more graceful error response instead of throwing
      return NextResponse.json(
        { error: `API responded with status: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in search-colleges API route:', error);
    // Return a more detailed error message
    return NextResponse.json(
      { error: `Failed to fetch data: ${error.message}` }, 
      { status: 500 }
    );
  }
} 