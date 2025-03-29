const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=1&imgSize=large&imgType=photo`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch image from Google API');
    }

    const data = await response.json();
    const imageUrl = data.items?.[0]?.link;

    if (!imageUrl) {
      throw new Error('No image found');
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching college image:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 