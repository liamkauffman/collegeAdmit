import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collegeId, action } = await req.json();
    console.log("Received request:", { collegeId, action, userId: session.user.id });

    if (!collegeId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = session.user.id;

    // First check if the college exists
    console.log("Searching for college with ID:", collegeId);
    
    // Always convert collegeId to string since that's what Prisma expects
    const stringCollegeId = String(collegeId);
    
    // Find the college using only string ID
    let college = await prisma.College.findFirst({
      where: {
        id: stringCollegeId
      }
    });
    
    // If not found by ID, try by name (if you have numeric IDs from frontend)
    if (!college) {
      console.log("College not found by ID, checking for any college in DB");
      
      // Try to find any college to verify database connection
      const sampleCollege = await prisma.College.findFirst();
      console.log("Sample college from database:", sampleCollege);
      
      return NextResponse.json({ 
        error: "College not found",
        details: `College with ID ${collegeId} does not exist. Sample college from DB: ${sampleCollege ? 'DB has colleges' : 'No colleges in DB'}`
      }, { status: 404 });
    }
    
    console.log("College found:", college.name, "with ID:", college.id);

    if (action === 'favorite') {
      // Add to favorites
      await prisma.UserFavorites.create({
        data: {
          userId,
          collegeId: college.id,
        },
      });
      console.log("Added college to favorites");
    } else if (action === 'unfavorite') {
      // Remove from favorites
      
      await prisma.UserFavorites.delete({
        where: {
          userId_collegeId: {
            userId,
            collegeId: college.id,
          },
        },
      });
      console.log("Removed college from favorites");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error handling favorite:", errorMessage);
    return NextResponse.json({ 
      error: "Internal server error",
      details: errorMessage 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all favorited colleges for the user
    const favorites = await prisma.UserFavorites.findMany({
      where: {
        userId,
      },
      include: {
        college: true,
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error fetching favorites:", errorMessage);
    return NextResponse.json({ 
      error: "Internal server error",
      details: errorMessage 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 