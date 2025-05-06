import { API_URL } from '@/config';
import { mockCollegeDetails } from '@/lib/mock-college-details';
import axios from 'axios';

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
      // Use axios instead of fetch to avoid ReadableStream issues
      console.log('Initiating axios request to backend');

      // Axios directly returns the parsed JSON data in the response.data property
      const axiosResponse = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/json'
        },
        timeout: 60000
      });
      
      console.log(`Backend response status: ${axiosResponse.status}`);
      
      // With axios, we can directly access the data without text() conversion
      const collegeData = axiosResponse.data;
      console.log('Successfully received college data');
      
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
      
      // Handle axios errors - they have a different structure than fetch errors
      const status = fetchError.response?.status || 503;
      let errorMessage = 'Unable to connect to college data service';
      
      // Extract error details from axios error structure
      if (fetchError.response && fetchError.response.data) {
        try {
          const errorData = fetchError.response.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
      }
      
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
          error: errorMessage,
          details: fetchError.message
        }),
        { 
          status,
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