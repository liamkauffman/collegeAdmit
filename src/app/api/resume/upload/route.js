import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { parseResumeContent, saveResumeData } from './helpers';

const prisma = new PrismaClient();

export async function POST(request) {
  console.log('Starting resume upload and parsing process');
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Unauthorized request - no valid session');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const useGemini = formData.get('use_gemini') === 'true';
    const userId = formData.get('user_id') || session.user.id;
    
    console.log(`Processing resume for user: ${userId}, use_gemini: ${useGemini}`);

    if (!file) {
      console.log('No file provided in request');
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();
    
    console.log(`Received file: ${fileName} with extension ${fileExtension}`);
    
    if (!allowedTypes.includes(fileExtension)) {
      console.log(`Invalid file type: ${fileExtension}. Allowed types: ${allowedTypes.join(', ')}`);
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Create unique filename
    const uniqueFileName = `${userId}-${Date.now()}${fileExtension}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes');
    const filePath = join(uploadDir, uniqueFileName);

    console.log(`Saving file to: ${filePath}`);

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      console.log('Upload directory does not exist, creating...');
      try {
        await mkdir(uploadDir, { recursive: true });
        console.log('Upload directory created successfully');
      } catch (err) {
        console.error('Error creating upload directory:', err.message);
        return new Response(
          JSON.stringify({ error: 'Failed to create upload directory' }),
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
    }

    try {
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      console.log('File written successfully');
    } catch (err) {
      console.error('Error writing file:', err.message);
      return new Response(
        JSON.stringify({ error: 'Failed to write file' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Generate the URL to access the file
    const fileUrl = `/uploads/resumes/${uniqueFileName}`;
    console.log(`Generated file URL: ${fileUrl}`);
    
    // First, update user preferences with the resume URL
    console.log(`Updating preferences for user: ${userId}`);
    try {
      // Get existing preferences
      let existingPrefs = await prisma.userPreferences.findUnique({
        where: { userId: userId }
      });
      
      let prefsData = '{}'; // Default empty JSON object as string
      
      // If we have existing preferences, use that data
      if (existingPrefs && existingPrefs.data) {
        prefsData = existingPrefs.data;
      }
      
      // Update or create user preferences with the resumeUrl
      await prisma.userPreferences.upsert({
        where: { 
          userId: userId 
        },
        update: {
          resumeUrl: fileUrl
        },
        create: {
          userId: userId,
          resumeUrl: fileUrl,
          data: prefsData
        }
      });
      
      console.log('User preferences updated successfully');
    } catch (err) {
      console.error('Error updating user preferences:', err.message);
      // Don't return an error - continue with resume parsing
    }
    
    try {
      // Parse the resume content
      console.log('Parsing resume content...');
      const parsedData = await parseResumeContent(filePath, useGemini);
      
      // Save the data to the database
      console.log('Saving parsed resume data to database...');
      await saveResumeData(userId, fileUrl, parsedData);
      
      // Return the parsed data
      return new Response(
        JSON.stringify({
          fileUrl,
          parsedData
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (error) {
      console.error('Error processing resume:', error.message);
      console.error(error.stack);
      
      // Still return the file URL even if parsing failed
      return new Response(
        JSON.stringify({ 
          fileUrl,
          error: 'Resume was uploaded but parsing failed. Please try again later.',
          errorDetails: error.message
        }),
        { 
          status: 207, // Status 207 "Multi-Status" indicates partial success
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Error processing resume:', typeof error === 'object' ? error.message : 'Unknown error');
    console.error(error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process resume',
        detail: typeof error === 'object' ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error disconnecting from database');
    }
  }
}

export async function GET() {
  console.log('GET request received - method not allowed');
  return new Response(
    JSON.stringify({ message: 'Method not allowed' }),
    { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
} 