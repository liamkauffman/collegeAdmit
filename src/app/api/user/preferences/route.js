import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to save preferences' },
        { status: 401 }
      );
    }

    // Get the preferences data from the request body
    const { preferences } = await request.json();

    // Get the user's ID
    const user = await prisma.User.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update or create user preferences in the database
    const updatedPreferences = await prisma.UserPreferences.upsert({
      where: {
        userId: user.id,
      },
      update: {
        data: JSON.stringify(preferences),
      },
      create: {
        userId: user.id,
        data: JSON.stringify(preferences),
      },
    });

    return NextResponse.json(
      { message: 'Preferences saved successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user by email
    const user = await prisma.User.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the user preferences from the database
    const preferences = await prisma.UserPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      // Instead of returning 404, return empty preferences
      return NextResponse.json(
        { 
          preferences: {
            gpa: '',
            satScore: '',
            actScore: '',
            classRank: '',
            academicNotes: '',
            languages: [{ language: 'English', proficiency: 'Native' }]
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { preferences: JSON.parse(preferences.data) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching preferences' },
      { status: 500 }
    );
  }
} 