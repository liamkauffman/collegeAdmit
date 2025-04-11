import { createUser, getUserByEmail } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'User with this email already exists' }),
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Create new user
    const user = await createUser({ name, email, password });

    return new Response(
      JSON.stringify({ 
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ message: 'An error occurred during registration' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 