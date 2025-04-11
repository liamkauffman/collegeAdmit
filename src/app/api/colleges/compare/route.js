import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

/**
 * POST handler for college comparison
 * Takes a college_id and an optional limit parameter
 * Returns similar colleges from the backend API
 */
export async function POST(request) {
  console.log('Starting college comparison POST request');
  try {
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Parse the request body
    const body = await request.json();
    const { college_id, limit = 3 } = body;
    console.log('Request body:', { college_id, limit });
    
    if (!college_id) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: college_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the user's session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    } catch (sessionError) {
      console.error("Error getting session:", sessionError);
      session = null;
    }
    
    // Build the API URL
    const apiUrl = `${API_URL}/api/colleges/compare`;
    console.log(`Making request to backend API: ${apiUrl}`);
    
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
          error: errorData.detail || 'Failed to fetch similar colleges from backend' 
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
    console.log(`Received ${data.similar_colleges?.length || 0} similar colleges from backend`);
    
    // Return the similar colleges as JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in college comparison:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to compare colleges' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 