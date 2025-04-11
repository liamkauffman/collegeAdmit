import { API_URL } from '@/config';
import { mockCollegeDetails } from '@/lib/mock-college-details';

export async function GET(request, context) {
  console.log('Starting GET request for college details');
  try {
    // Properly await the params object before accessing properties
    const params = await context.params;
    const id = params.id;
    console.log(`Processing request for college ID: ${id}`);
    
    // Check if this is a test request
    const { searchParams } = new URL(request.url);
    const isTestMode = searchParams.get('test') === 'true';
    console.log(`Test mode: ${isTestMode}`);
    
    if (isTestMode) {
      console.log(`[TEST MODE] Fetching college ${id} directly from backend`);
    }
    
    // Forward to the backend API
    const apiUrl = `${API_URL}/api/colleges/${id}`;
    console.log(`Making request to backend URL: ${apiUrl}`);
    
    try {
      // Make the fetch request with explicit no-cache setting
      console.log('Initiating fetch request to backend');
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log(`Backend response status: ${response.status}`);
      
      if (!response.ok) {
        console.log(`Backend returned error status: ${response.status}`);
        // If the backend returns an error, we handle it
        let errorMessage;
        try {
          // Use text() instead of json() to avoid ReadableStream issues
          const errorText = await response.text();
          console.log(`Error response text: ${errorText}`);
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || 'Failed to fetch college details';
          } catch (jsonError) {
            console.log('Failed to parse error response as JSON:', jsonError);
            errorMessage = errorText || `Server error: ${response.status}`;
          }
        } catch (parseError) {
          console.log('Failed to read error response text:', parseError);
          // If we can't parse the error response
          errorMessage = `Server error: ${response.status}`;
        }
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { 
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
      
      // Safely handle the response data
      let collegeData;
      try {
        console.log('Reading response body');
        // Always use text() instead of json() to avoid ReadableStream issues
        const responseText = await response.text();
        
        // Validate that we have actual content before parsing
        if (!responseText || responseText.trim() === '') {
          console.log('Received empty response from server');
          throw new Error('Empty response from server');
        }
        
        // Parse the text response
        console.log('Parsing response JSON');
        collegeData = JSON.parse(responseText);
        console.log('Successfully parsed college data');
      } catch (parseError) {
        console.error('Error parsing college data:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid data received from server',
            details: parseError.message
          }),
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
      
      // Return the data safely
      console.log('Returning successful response with college data');
      return new Response(
        JSON.stringify(collegeData),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
    } catch (fetchError) {
      console.error('Error fetching from backend:', fetchError);
      
      // In development, fall back to mock data if backend is not available
      // BUT never use mock data in test mode
      if (process.env.NODE_ENV === 'development' && !isTestMode) {
        console.log('Using mock data for college details in development');
        const mockCollege = mockCollegeDetails[id];
        
        if (mockCollege) {
          console.log('Found matching mock data, returning mock college');
          return new Response(
            JSON.stringify(mockCollege),
            { 
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
        } else {
          console.log('No matching mock data found');
          return new Response(
            JSON.stringify({ error: 'College not found' }),
            { 
              status: 404,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
        }
      }
      
      // In production, return a proper error
      console.log('Returning service unavailable error');
      return new Response(
        JSON.stringify({ 
          error: 'Unable to connect to college data service',
          details: fetchError.message
        }),
        { 
          status: 503,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 