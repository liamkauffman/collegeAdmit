import axios from 'axios';

/**
 * Geocode API Route
 * This route handles geocoding addresses to latitude and longitude coordinates
 * using the Google Maps Geocoding API
 */
export async function GET(request) {
  try {
    // Get the API key from environment variables
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Missing GOOGLE_MAPS_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing API key' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get the address parameter from the request
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address parameter is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Geocoding address: ${address}`);
    
    // Make the request to Google Maps Geocoding API
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(geocodingUrl);
    
    if (response.data.status !== 'OK') {
      console.error('Geocoding error:', response.data.status, response.data.error_message);
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
    
    // Get the first result
    const location = response.data.results[0]?.geometry?.location;
    
    if (!location) {
      throw new Error('No geocoding results found');
    }
    
    // Return the coordinates and formatted address
    return new Response(
      JSON.stringify({
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        formattedAddress: response.data.results[0].formatted_address
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error in geocoding API route:', error);
    
    // Format error for response
    let errorMessage = 'Failed to geocode address';
    let statusCode = 500;
    
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('Error response data:', error.response.data);
      errorMessage = error.response.data.error_message || errorMessage;
      statusCode = error.response.status;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Google Maps API');
      errorMessage = 'No response received from geocoding service';
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 