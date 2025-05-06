import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Update a saved search (toggle favorite status)
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;
    const searchId = params.id;
    const { isFavorite } = await req.json();

    // Verify ownership of the saved search
    const existingSearch = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!existingSearch) {
      return new Response(JSON.stringify({ error: "Saved search not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (existingSearch.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized: You don't own this saved search" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the favorite status
    const updatedSearch = await prisma.savedSearch.update({
      where: { id: searchId },
      data: { isFavorite },
    });

    return new Response(JSON.stringify({ success: true, savedSearch: updatedSearch }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating saved search:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Get a specific saved search by ID
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;
    const searchId = params.id;

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!savedSearch) {
      return new Response(JSON.stringify({ error: "Saved search not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (savedSearch.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized: You don't own this saved search" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ savedSearch }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching saved search:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Delete a saved search
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;
    const searchId = params.id;

    // Verify ownership of the saved search
    const existingSearch = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!existingSearch) {
      return new Response(JSON.stringify({ error: "Saved search not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (existingSearch.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized: You don't own this saved search" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the saved search
    await prisma.savedSearch.delete({
      where: { id: searchId },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 