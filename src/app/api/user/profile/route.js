import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Get the user ID from the session
    const userId = session.user.id;

    // Parse the request body
    const { name } = await request.json();

    // Validate input
    if (!name) {
      return new Response(
        JSON.stringify({ message: 'Name is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Update the user in the database
    const updatedUser = await prisma.User.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return new Response(
      JSON.stringify({ 
        message: 'Profile updated successfully',
        user: updatedUser
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(
      JSON.stringify({ message: 'An error occurred while updating the profile' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function PATCH(request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Get the request body
    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return new Response(
        JSON.stringify({ message: 'Preferences data is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Look up the user by email (since NextAuth session may have email but not ID)
    const user = await prisma.User.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Update or create user preferences in the database
    const updatedPreferences = await prisma.userPreferences.upsert({
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

    return new Response(
      JSON.stringify({ message: 'Preferences saved successfully' }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Preferences update error:', error);
    return new Response(
      JSON.stringify({ message: 'An error occurred while updating preferences' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function GET(request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Get the user ID from the session
    const userId = session.user.id;

    // Get the user from the database
    const user = await prisma.User.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(
      JSON.stringify({ message: 'An error occurred while fetching the profile' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 