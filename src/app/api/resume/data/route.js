import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get resume data with all related information
    const resume = await prisma.resume.findUnique({
      where: { userId },
      include: {
        education: true,
        experience: true,
        skills: true,
        certifications: true,
        projects: true
      }
    });

    if (!resume) {
      return NextResponse.json({ message: 'No resume found' }, { status: 404 });
    }

    // Format the data to match the structure expected by the frontend
    const formattedData = {
      fileUrl: resume.resumeUrl,
      parsedData: {
        personalInfo: {
          fullName: resume.fullName,
          email: resume.email,
          phone: resume.phone
        },
        education: resume.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate ? edu.startDate.toISOString() : null,
          endDate: edu.endDate ? edu.endDate.toISOString() : null,
          gpa: edu.gpa,
          achievements: edu.achievements
        })),
        workExperience: resume.experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate ? exp.startDate.toISOString() : null,
          endDate: exp.endDate ? exp.endDate.toISOString() : null,
          location: exp.location,
          description: exp.description
        })),
        skills: resume.skills.map(skill => ({
          name: skill.name,
          level: skill.level
        })),
        certifications: resume.certifications.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate ? cert.issueDate.toISOString() : null,
          expirationDate: cert.expirationDate ? cert.expirationDate.toISOString() : null
        })),
        projects: resume.projects.map(project => ({
          name: project.name,
          description: project.description,
          startDate: project.startDate ? project.startDate.toISOString() : null,
          endDate: project.endDate ? project.endDate.toISOString() : null,
          url: project.url
        })),
        analysis: {
          strengths: resume.strengths,
          improvementAreas: resume.improvementAreas,
          summary: resume.summary
        }
      }
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching resume data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch resume data',
      detail: typeof error === 'object' ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 