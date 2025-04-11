import { API_URL } from '@/config';
import { mockCollegeDetails } from '@/lib/mock-college-details';

export async function GET(request, context) {
  try {
    // Properly await the params object before accessing properties
    const params = await context.params;
    const id = params.id;
    
    // Check if this is a test request
    const { searchParams } = new URL(request.url);
    const isTestMode = searchParams.get('test') === 'true';
    
    if (isTestMode) {
      console.log(`[TEST MODE] Fetching college ${id} directly from backend`);
    }
    
    // Forward to the backend API
    const apiUrl = `${API_URL}/api/colleges/${id}`;
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        // If the backend returns an error, we handle it
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Failed to fetch college details';
        } catch (parseError) {
          // If we can't parse the error response as JSON
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
        const responseText = await response.text(); // Get raw text first
        collegeData = JSON.parse(responseText);     // Then parse it
      } catch (parseError) {
        console.error('Error parsing college data:', parseError);
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
      
      // Return the data safely
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
      return new Response(
        JSON.stringify({ error: 'Unable to connect to college data service' }),
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
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 