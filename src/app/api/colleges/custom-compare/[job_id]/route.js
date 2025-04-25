import axios from 'axios';

/**
 * Custom College Comparison Status Check API Route
 * This route handles checking the status of a college comparison job
 */
export async function GET(request, context) {
  console.log('Checking college comparison job status');
  try {
    // Get the job ID from the route params
    // Use the context parameter to access params safely
    const jobId = context.params.job_id;
    
    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Job ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Checking status for job ID: ${jobId}`);
    
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Build the API URL
    const apiUrl = `${API_URL}/api/colleges/custom-compare/${jobId}`;
    console.log(`Making request to backend API: ${apiUrl}`);
    
    // Implement retry logic for resilience
    let retries = 0;
    const maxRetries = 3;
    let response;
    
    while (retries <= maxRetries) {
      try {
        // Make a request to the FastAPI backend using axios
        response = await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000, // 30 second timeout
        });
        
        // If successful, break out of retry loop
        break;
      } catch (retryError) {
        retries++;
        console.log(`Attempt ${retries} failed with error:`, retryError.message);
        
        // If we've reached max retries, throw the error to be caught by outer catch
        if (retries > maxRetries) {
          throw retryError;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = retries * 1000; // 1s, 2s, 3s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log('Response status:', response.status);
    console.log('Job status:', response.data.status || 'unknown');
    
    // Return the response from the backend
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error checking job status:', error);
    
    // Format error for response
    let errorMessage = 'Failed to check job status';
    let statusCode = 500;
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      errorMessage = error.response.data.detail || error.response.data.error || errorMessage;
      statusCode = error.response.status;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from backend');
      errorMessage = 'No response received from backend';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: errorMessage, status: 'failed' }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 