import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

/**
 * GET handler for fetching a specific comparison by ID
 */
export async function GET(request, context) {
  const { id } = context.params;
  
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Fetch the comparison
    const comparison = await prisma.CollegeComparison.findUnique({
      where: { 
        id,
        userId // Ensure it belongs to the current user
      },
    });
    
    if (!comparison) {
      return new Response(JSON.stringify({ error: 'Comparison not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Return the comparison
    return new Response(JSON.stringify(comparison), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comparison' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PATCH handler for updating a comparison (e.g., rename)
 */
export async function PATCH(request, context) {
  const { id } = context.params;
  
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Parse the request body
    const body = await request.json();
    const { name } = body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check if the comparison exists and belongs to the user
    const existingComparison = await prisma.CollegeComparison.findUnique({
      where: { 
        id,
        userId // Ensure it belongs to the current user
      },
    });
    
    if (!existingComparison) {
      return new Response(JSON.stringify({ error: 'Comparison not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Update the comparison
    const updatedComparison = await prisma.CollegeComparison.update({
      where: { id },
      data: { name: name.trim() },
    });
    
    // Return the updated comparison
    return new Response(JSON.stringify(updatedComparison), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating comparison:', error);
    return new Response(JSON.stringify({ error: 'Failed to update comparison' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE handler for deleting a comparison
 */
export async function DELETE(request, context) {
  const { id } = context.params;
  
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Check if the comparison exists and belongs to the user
    const existingComparison = await prisma.CollegeComparison.findUnique({
      where: { 
        id,
        userId // Ensure it belongs to the current user
      },
    });
    
    if (!existingComparison) {
      return new Response(JSON.stringify({ error: 'Comparison not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Delete the comparison
    await prisma.CollegeComparison.delete({
      where: { id },
    });
    
    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete comparison' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
} 