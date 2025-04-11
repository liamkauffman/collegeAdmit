import { getServerSession } from 'next-auth/next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import the resume parsing functions from our new endpoint
import { parseResumeContent, saveResumeData } from '../../resume/upload/helpers';

export async function POST(request) {
  console.log('Starting resume upload process');
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
    const uniqueFileName = `${session.user.id}-${Date.now()}${fileExtension}`;
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
    
    // First, get existing preferences
    console.log(`Fetching preferences for user: ${session.user.id}`);
    let existingPrefs;
    try {
      existingPrefs = await prisma.userPreferences.findUnique({
        where: { userId: session.user.id }
      });
      console.log('Found existing preferences');
    } catch (err) {
      console.error('Error fetching preferences:', err.message);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch preferences' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    let prefsData = '{}'; // Default empty JSON object as string

    // If we have existing preferences, use that data
    if (existingPrefs && existingPrefs.data) {
      console.log('Using existing preferences data');
      prefsData = existingPrefs.data;
    }

    console.log('Current preferences data found');

    // Update or create user preferences with JUST the resumeUrl
    console.log('Preparing to upsert user preferences with resume URL');
    try {
      await prisma.userPreferences.upsert({
        where: { 
          userId: session.user.id 
        },
        update: {
          resumeUrl: fileUrl
        },
        create: {
          userId: session.user.id,
          resumeUrl: fileUrl,
          data: prefsData
        }
      });
      
      console.log('Database updated successfully');
      
      // NEW: Parse the resume content and save it to the database
      try {
        console.log('Parsing resume content...');
        const parsedData = await parseResumeContent(filePath, false);
        
        // Save the parsed data
        console.log('Saving parsed resume data...');
        await saveResumeData(session.user.id, fileUrl, parsedData);
        
        console.log('Resume parsing and saving completed successfully');
        
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
      } catch (parseError) {
        console.error('Error parsing resume:', parseError.message);
        // Still return success for the upload, but mention the parsing error
        return new Response(
          JSON.stringify({ 
            fileUrl,
            parsingError: 'Resume was uploaded but could not be parsed. Please try again later.'
          }),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
    } catch (err) {
      console.error('Error saving to database:', typeof err === 'object' ? err.message : 'Unknown error');
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save to database'
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', typeof error === 'object' ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload file'
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