import { ReadableStream, TransformStream } from 'web-streams-polyfill';

export async function POST(request) {
  try {
    const body = await request.json();
    const { college_name, message } = body;
    
    if (!college_name || !message) {
      return new Response(
        JSON.stringify({ error: 'College name and message are required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Get the API URL from environment variable or use a default
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').trim();
    
    // Make a request to the FastAPI backend
    const response = await fetch(`${API_URL}/api/colleges/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        college_name,
        message
      }),
    });
    
    if (!response.ok) {
      // If the backend returns an error
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to get chat response from backend' }),
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Handle streaming responses
    const reader = response.body.getReader();
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();
    
    // Start reading the stream
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            await writer.close();
            break;
          }
          
          // Forward the chunk to the client
          await writer.write(value);
        }
      } catch (error) {
        console.error('Error while pumping stream:', error);
        await writer.abort(error);
      }
    };
    
    // Start the pumping process without waiting for it
    pump();
    
    // Return the response with the transformed stream
    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
    
  } catch (error) {
    console.error('Error in chat API route:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat request' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 