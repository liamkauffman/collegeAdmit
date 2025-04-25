import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

// Create Prisma client with more error details
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

/**
 * GET handler for fetching comparison history
 * Retrieves saved comparisons for the authenticated user
 */
export async function GET(request) {
  console.log('GET request received for comparison history');
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      console.log('Authentication failed');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    console.log(`Fetching comparisons for user: ${userId}`);
    
    // Fetch the user's saved comparisons
    const comparisons = await prisma.CollegeComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`Found ${comparisons.length} comparisons`);
    
    // Return the list of comparisons
    return new Response(JSON.stringify(comparisons), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching comparison history:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comparison history' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST handler for saving a comparison
 * Saves a new comparison to the user's history
 */
export async function POST(request) {
  console.log('POST request received to save comparison');
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      console.log('Authentication failed');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    console.log(`Saving comparison for user: ${userId}`);
    
    // Parse the request body
    const body = await request.json();
    const { name, colleges, categories, results } = body;
    
    // Validate required fields
    if (!name || !colleges || !categories || !results) {
      console.log('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(colleges) || colleges.length < 2) {
        return new Response(JSON.stringify({ 
          error: 'Invalid colleges - must be array of at least 2 college IDs' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!Array.isArray(categories) || categories.length === 0) {
        return new Response(JSON.stringify({ 
          error: 'Invalid categories - must be non-empty array' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    
    console.log(`Creating comparison: ${name}`);

    // Debug logging for the data types
    console.log('Colleges type:', typeof colleges, Array.isArray(colleges));
    console.log('Categories type:', typeof categories, categories instanceof Object);
    console.log('Results type:', typeof results, results instanceof Object);

    try {
      // Prepare the data with proper JSON serialization
      // Convert objects to strings for storage in JSON fields
      const categoriesData = JSON.stringify(categories);
      const resultsData = JSON.stringify(results);
      
      // Ensure college IDs are strings, not integers
      const collegeIds = colleges.map(id => String(id));
      
      console.log('Prepared data for database insertion:');
      console.log('- Categories length:', categoriesData.length);
      console.log('- Results length:', resultsData.length);
      console.log('- Colleges:', collegeIds);
      
      // Create a new comparison in the database
      const comparison = await prisma.CollegeComparison.create({
        data: {
          userId,
          name,
          colleges: collegeIds, // Array of college IDs as strings
          // Use the stringified JSON data
          categories: categoriesData,
          results: resultsData
        }
      });
      
      console.log(`Comparison created with ID: ${comparison.id}`);
      
      // Return the created comparison
      return new Response(JSON.stringify(comparison), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (createError) {
      console.error('Prisma create error details:', createError);
      
      // Handle the error safely
      let errorMessage = 'Failed to create comparison in database';
      if (createError && createError.message) {
        errorMessage = createError.message;
      }
      
      return new Response(JSON.stringify({ 
        error: `Database creation error: ${errorMessage}`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error saving comparison:', error);
    return new Response(JSON.stringify({ error: 'Failed to save comparison' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}