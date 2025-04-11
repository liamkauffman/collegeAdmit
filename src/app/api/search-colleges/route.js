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
      return new Response(
        JSON.stringify({ error: `API responded with status: ${response.status}` }),
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Safely handle the response data
    try {
      const responseText = await response.text();
      const data = JSON.parse(responseText);
      
      return new Response(
        JSON.stringify(data),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (parseError) {
      console.error('Error parsing response data:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid data received from server' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Error in search-colleges API route:', error);
    // Return a more detailed error message
    return new Response(
      JSON.stringify({ error: `Failed to fetch data: ${error.message}` }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 