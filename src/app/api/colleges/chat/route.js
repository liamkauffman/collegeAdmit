import axios from 'axios';
import { Readable } from 'stream';

export async function POST(request) {
  console.log('Starting chat API request');
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  try {
    const body = await request.json();
    const { college_name, message } = body;
    console.log(`Chat request for college: ${college_name}`);
    console.log(`Message: ${message}`);
    
    if (!college_name || !message) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'College name and message are required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // Get the API URL from environment variable or use a default
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').trim();
    console.log(`Using API URL: ${API_URL}`);
    
    // Make a request to the FastAPI backend using axios
    console.log('Making request to backend with axios');
    
    // Use axios with responseType 'stream' to get the stream data
    const axiosResponse = await axios.post(
      `${API_URL}/api/colleges/chat`,
      {
        college_name,
        message
      },
      {
        responseType: 'text',  // Use 'text' instead of 'stream' to get complete response
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    console.log(`Backend response status: ${axiosResponse.status}`);
    
    // Return the response as a simulated stream
    console.log('Returning response with streaming header');
    return new Response(axiosResponse.data, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error('Error in chat API route:', error);
    
    // Format axios error for better debugging
    let errorMessage = error.message || 'Failed to process chat request';
    let errorDetails = {};
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      errorMessage = `Backend error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorDetails = {
        request: 'Request was made but no response received'
      };
      errorMessage = 'No response received from backend';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 