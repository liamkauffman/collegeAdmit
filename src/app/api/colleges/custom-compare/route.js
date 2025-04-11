import axios from 'axios';

/**
 * Custom College Comparison API Route
 * This route handles comparing colleges with custom categories and weights
 * It makes a request to the backend API and returns the results
 */
export async function POST(request) {
  console.log('Starting custom college comparison POST request');
  try {
    // Get the API URL from environment variable or use a default
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Parse the request body
    const body = await request.json();
    const { college_ids, categories } = body;
    console.log('Request body:', { college_ids, categories });
    
    // Validate input
    if (!college_ids || !Array.isArray(college_ids) || college_ids.length < 2) {
      return new Response(JSON.stringify({ error: 'At least 2 college IDs are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one category is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Build the API URL
    const apiUrl = `${API_URL}/api/colleges/custom-compare`;
    console.log(`Making request to backend API: ${apiUrl}`);
    
    // Make a request to the FastAPI backend using axios
    const response = await axios.post(apiUrl, {
      college_ids: college_ids,
      categories: categories
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Response status:', response.status);
    
    // Return the response from the backend
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in custom college comparison:', error);
    
    // Format error for response
    let errorMessage = 'Failed to compare colleges';
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