import { NextResponse } from 'next/server';

/**
 * API endpoint to fetch nearby airports based on coordinates
 * @param {Object} request - The request object containing lat/lng parameters
 * @returns {Object} JSON response with nearby airports data
 */
export async function GET(request) {
  console.log('Received GET request for airports');
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  console.log(`Coordinates received: lat=${lat}, lng=${lng}`);
  
  if (!lat || !lng) {
    console.warn('Missing coordinates in request');
    return NextResponse.json({ 
      error: 'Missing coordinates' 
    }, { status: 400 });
  }
  
  try {
    // Get the radius parameter from the request, default to 50000 meters (50km/~31mi)
    const radius = parseInt(searchParams.get('radius')) || 50000;
    console.log(`Using search radius: ${radius} meters`);
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    console.log(`Searching for airports within ${radius} meters`);
    
    // Search for airports near the college
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=airport&key=${apiKey}`
    );

    
    if (!response.ok) {
      console.error('Failed to fetch from Google Places API:', response.status, response.statusText);
      throw new Error('Failed to fetch from Google Places API');
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    console.log(`Found ${data.results.length} airports in initial search`);
    
    // Format the airports data
    const airports = await Promise.all(
      data.results.map(async (place) => {
        console.log(`Fetching details for airport: ${place.name}`);
        // For each airport, get more details
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,geometry,rating,international_phone_number,website,address_component&key=${apiKey}`
        );
        
        if (!detailsResponse.ok) {
          console.warn(`Failed to fetch details for airport: ${place.name}`);
          return null;
        }
        
        const detailsData = await detailsResponse.json();
        const details = detailsData.result;
        
        // Calculate distance from college to airport (in miles)
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        
        // Try to extract IATA code from address components or name
        let iata = null;
        if (details.address_components) {
          const airportCode = details.address_components.find(
            component => component.types.includes('airport')
          );
          if (airportCode) {
            iata = airportCode.short_name;
          } else {
            // Try to extract a 3-letter code from the name
            const match = place.name.match(/\(([A-Z]{3})\)/);
            if (match) {
              iata = match[1];
            }
          }
        }
        
        console.log(`Processed airport: ${details.name || place.name}, Distance: ${distance} miles, IATA: ${iata || 'N/A'}`);
        
        return {
          place_id: place.place_id,
          name: details.name || place.name,
          address: details.formatted_address || place.vicinity,
          location: place.geometry.location,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          iata,
          rating: place.rating
        };
      })
    );
    
    // Filter out null values and sort by distance
    const validAirports = airports
      .filter(airport => airport !== null)
      .sort((a, b) => a.distance - b.distance);
    
    console.log(`Returning ${validAirports.length} valid airports`);
    
    return NextResponse.json({ airports: validAirports.slice(0, 5) });
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of first location
 * @param {number} lon1 - Longitude of first location
 * @param {number} lat2 - Latitude of second location
 * @param {number} lon2 - Longitude of second location
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  console.log(`Calculating distance between (${lat1},${lon1}) and (${lat2},${lon2})`);
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  console.log(`Calculated distance: ${distance} miles`);
  return distance;
}

/**
 * Converts degrees to radians
 * @param {number} deg - Degrees to convert
 * @returns {number} Radians
 */
function deg2rad(deg) {
  return deg * (Math.PI/180);
} 