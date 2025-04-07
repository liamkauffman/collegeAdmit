import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  console.log('Starting preferences POST request');
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');
    
    if (!session) {
      console.log('Unauthorized request - no valid session');
      return new Response(JSON.stringify({ error: 'You must be logged in to save preferences' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the preferences data from the request body
    const { preferences } = await request.json();
    console.log('Received preferences data:', preferences);

    // Get the user's ID
    const user = await prisma.User.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      console.log('User not found for email:', session.user.email);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Found user with ID:', user.id);

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

    console.log('Preferences saved successfully for user:', user.id);

    return new Response(JSON.stringify({ message: 'Preferences saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error saving preferences:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Failed to save preferences' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request) {
  console.log('Starting preferences GET request');
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');

    if (!session || !session.user) {
      console.log('Unauthorized request - no valid session or user');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the user by email
    const user = await prisma.User.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      console.log('User not found for email:', session.user.email);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Found user with ID:', user.id);

    // Get the user preferences from the database
    const preferences = await prisma.UserPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      console.log('No preferences found for user:', user.id);
      // Instead of returning 404, return empty preferences
      return new Response(JSON.stringify({ 
        preferences: {
          gpa: '',
          satScore: '',
          actScore: '',
          classRank: '',
          academicNotes: '',
          languages: [{ language: 'English', proficiency: 'Native' }]
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Found preferences for user:', user.id);
    const parsedPreferences = JSON.parse(preferences.data);
    console.log('Parsed preferences:', parsedPreferences);

    return new Response(JSON.stringify({ preferences: parsedPreferences }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'An error occurred while fetching preferences' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 