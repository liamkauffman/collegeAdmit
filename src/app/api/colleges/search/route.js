import axios from 'axios';

/**
 * College Search API Route
 * This route handles searching for colleges by name and other criteria
 * It makes a request to the backend API and returns the results
 */
export async function POST(request) {
  console.log('Starting college search POST request');
  try {
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Parse the request body
    const body = await request.json();
    const { name, sat_scores, type, tuition_range, limit = 10 } = body;
    console.log('Request body:', { name, sat_scores, type, tuition_range, limit });
    
    // Build the search params
    const searchParams = {};
    if (name) searchParams.name = name;
    if (sat_scores) searchParams.sat_scores = sat_scores;
    if (type) searchParams.type = type;
    if (tuition_range) searchParams.tuition_range = tuition_range;
    if (limit) searchParams.limit = limit;
    
    // Build the API URL
    const apiUrl = `${API_URL}/api/colleges/search`;
    console.log(`Making request to backend API: ${apiUrl}`);
    
    // Make a request to the FastAPI backend using axios
    const response = await axios.post(apiUrl, searchParams, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('Response status:', response.status);
    
    // Check the structure of the response data and normalize it
    let colleges = [];
    if (response.data && Array.isArray(response.data.colleges)) {
      // Response format: { colleges: [...] }
      colleges = response.data.colleges;
      console.log(`Received ${colleges.length} college results from structured response`);
    } else if (response.data && Array.isArray(response.data)) {
      // Response format: [...]
      colleges = response.data;
      console.log(`Received ${colleges.length} college results from array response`);
    } else {
      console.warn('Unexpected response format:', response.data);
    }
    
    // Return a consistent response structure
    return new Response(JSON.stringify(colleges), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in college search:', error);
    
    // Format error for response
    let errorMessage = 'Failed to search colleges';
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
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 