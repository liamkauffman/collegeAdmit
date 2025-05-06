import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Save a search
export async function POST(req) {
  console.log('POST /api/search - Saving search');
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('POST /api/search - Unauthorized access attempt');
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;
    const { initialQuery, followUpQandA, recommendations, searchSummary, isFavorite = false } = await req.json();
    console.log(`POST /api/search - Received data for user ${userId}:`, { initialQuery, followUpQandA, recommendations, searchSummary, isFavorite });

    if (!initialQuery) {
      console.log('POST /api/search - Missing initial query');
      return new Response(JSON.stringify({ error: "Initial query is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        initialQuery,
        followUpQandA: followUpQandA || [],
        recommendations: recommendations || [],
        searchSummary,
        isFavorite
      }
    });
    console.log(`POST /api/search - Search saved successfully:`, savedSearch);

    return new Response(JSON.stringify({ success: true, savedSearch }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/search - Error saving search:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Get all saved searches
export async function GET(req) {
  console.log('GET /api/search - Fetching saved searches');
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('GET /api/search - Unauthorized access attempt');
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;
    
    // Get query parameters
    const url = new URL(req.url);
    const onlyFavorites = url.searchParams.get('favorites') === 'true';
    console.log(`GET /api/search - Query params: onlyFavorites=${onlyFavorites}`);
    
    // Build the query
    const query = {
      where: { userId },
      orderBy: { createdAt: 'desc' }
    };
    
    // Filter by favorites if requested
    if (onlyFavorites) {
      query.where.isFavorite = true;
    }

    const savedSearches = await prisma.savedSearch.findMany(query);
    console.log(`GET /api/search - Retrieved ${savedSearches.length} saved searches for user ${userId}`);

    return new Response(JSON.stringify({ savedSearches }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/search - Error fetching saved searches:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 