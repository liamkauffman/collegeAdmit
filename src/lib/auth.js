import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Hash a password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Create a new user in the database
 * @param {Object} userData - User data including email, password, name
 * @returns {Promise<Object>} - The created user object (without password)
 */
export async function createUser({ email, password, name }) {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'USER', // Default role
    },
  });

  // Don't return the password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get a user by email
 * @param {string} email - The user's email
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Get a user by ID
 * @param {string} id - The user's ID
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
} 