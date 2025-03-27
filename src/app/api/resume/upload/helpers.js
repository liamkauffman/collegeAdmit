import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import node-fetch properly for Next.js server components
// This works with both node-fetch v2 and v3
import fetch from 'node-fetch';
// Import FormData from formdata-node instead of requiring form-data
import { FormData, File } from 'formdata-node';

// Parse resume by calling the backend FastAPI service
export async function parseResumeContent(filePath, useGemini = false) {
  console.log(`Parsing resume from ${filePath}, useGemini: ${useGemini}`);
  
  try {
    // Convert file path to actual file object
    const fs = require('fs');
    const path = require('path');
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // Create a FormData object using formdata-node
    const formData = new FormData();
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (fileName.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileName.endsWith('.doc')) {
      contentType = 'application/msword';
    }
    
    // Add the file to the form data using File constructor from formdata-node
    const file = new File([fileBuffer], fileName, { type: contentType });
    formData.append('file', file);
    
    // Add other parameters
    formData.append('use_gemini', useGemini.toString());
    
    // Make the API call to the FastAPI backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log(`Making API call to: ${apiUrl}/api/resume/upload`);
    
    const response = await fetch(`${apiUrl}/api/resume/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to parse resume');
    }
    
    // Parse the response
    const parsedResumeData = await response.json();
    console.log('Resume parsed successfully from backend API');
    
    // Transform the FastAPI response to match our expected format
    return {
      personalInfo: {
        fullName: parsedResumeData.name || "Unknown",
        email: parsedResumeData.email || "",
        phone: parsedResumeData.phone || ""
      },
      education: parsedResumeData.education?.map(edu => ({
        institution: edu.institution || "",
        degree: edu.degree || "",
        fieldOfStudy: edu.field || "",
        startDate: extractStartDate(edu.dates),
        endDate: extractEndDate(edu.dates),
        gpa: edu.gpa?.toString() || "",
        achievements: ""
      })) || [],
      workExperience: parsedResumeData.work_experience?.map(exp => ({
        company: exp.company || "",
        position: exp.position || "",
        startDate: extractStartDate(exp.dates),
        endDate: extractEndDate(exp.dates),
        location: "",
        description: exp.description || ""
      })) || [],
      skills: parsedResumeData.skills?.map(skill => ({
        name: skill,
        level: ""
      })) || [],
      certifications: parsedResumeData.certifications?.map(cert => ({
        name: cert,
        issuer: "",
        issueDate: null,
        expirationDate: null
      })) || [],
      projects: parsedResumeData.projects?.map(project => ({
        name: project.name || "",
        description: project.description || "",
        startDate: null,
        endDate: null,
        url: project.url || ""
      })) || [],
      analysis: {
        strengths: parsedResumeData.analysis?.strengths?.join(". ") || "",
        improvementAreas: parsedResumeData.analysis?.improvement_areas?.join(". ") || "",
        summary: parsedResumeData.analysis?.summary || ""
      }
    };
  } catch (error) {
    console.error('Error parsing resume with backend API:', error);
    throw error;
  }
}

// Helper function to extract start date from a date range string
function extractStartDate(dateStr) {
  if (!dateStr) return null;
  
  // Try to extract dates in various formats
  const dateRangeRegex = /(\d{4})\s*-\s*(\d{4}|present|current)/i;
  const monthYearRangeRegex = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\s*-\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4}|present|current)/i;
  
  let match = dateRangeRegex.exec(dateStr);
  if (match) {
    return `${match[1]}-01-01`; // Use January 1 of the start year
  }
  
  match = monthYearRangeRegex.exec(dateStr);
  if (match) {
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const startMonth = months[match[1].toLowerCase().slice(0, 3)];
    const startYear = match[2];
    return `${startYear}-${startMonth}-01`;
  }
  
  return null;
}

// Helper function to extract end date from a date range string
function extractEndDate(dateStr) {
  if (!dateStr) return null;
  
  // Check if currently present/working
  if (/present|current/i.test(dateStr)) {
    return null; // Indicating present
  }
  
  // Try to extract dates in various formats
  const dateRangeRegex = /(\d{4})\s*-\s*(\d{4})/i;
  const monthYearRangeRegex = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\s*-\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i;
  
  let match = dateRangeRegex.exec(dateStr);
  if (match) {
    return `${match[2]}-12-31`; // Use December 31 of the end year
  }
  
  match = monthYearRangeRegex.exec(dateStr);
  if (match) {
    const months = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const endMonth = months[match[3].toLowerCase().slice(0, 3)];
    const endYear = match[4];
    return `${endYear}-${endMonth}-28`; // Using 28th as a safe day value
  }
  
  return null;
}

// Save parsed resume data to the database
export async function saveResumeData(userId, resumeUrl, parsedData) {
  console.log('Saving resume data to database');
  
  // First, create or update the main Resume record
  const resume = await prisma.resume.upsert({
    where: { userId },
    update: {
      fullName: parsedData.personalInfo.fullName,
      email: parsedData.personalInfo.email,
      phone: parsedData.personalInfo.phone,
      resumeUrl,
      strengths: parsedData.analysis.strengths,
      improvementAreas: parsedData.analysis.improvementAreas,
      summary: parsedData.analysis.summary,
      updatedAt: new Date()
    },
    create: {
      userId,
      fullName: parsedData.personalInfo.fullName,
      email: parsedData.personalInfo.email,
      phone: parsedData.personalInfo.phone,
      resumeUrl,
      strengths: parsedData.analysis.strengths,
      improvementAreas: parsedData.analysis.improvementAreas,
      summary: parsedData.analysis.summary
    },
    include: {
      education: true,
      experience: true,
      skills: true,
      certifications: true,
      projects: true
    }
  });

  // Delete existing related records to replace with new data
  await Promise.all([
    prisma.education.deleteMany({ where: { resumeId: resume.id } }),
    prisma.workExperience.deleteMany({ where: { resumeId: resume.id } }),
    prisma.skill.deleteMany({ where: { resumeId: resume.id } }),
    prisma.certification.deleteMany({ where: { resumeId: resume.id } }),
    prisma.project.deleteMany({ where: { resumeId: resume.id } })
  ]);

  // Add education entries
  if (parsedData.education && parsedData.education.length > 0) {
    await Promise.all(parsedData.education.map(edu => {
      return prisma.education.create({
        data: {
          resumeId: resume.id,
          institution: edu.institution,
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || "",
          startDate: edu.startDate ? new Date(edu.startDate) : null,
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          gpa: edu.gpa || "",
          achievements: edu.achievements || ""
        }
      });
    }));
  }

  // Add work experience entries
  if (parsedData.workExperience && parsedData.workExperience.length > 0) {
    await Promise.all(parsedData.workExperience.map(exp => {
      return prisma.workExperience.create({
        data: {
          resumeId: resume.id,
          company: exp.company,
          position: exp.position || "",
          startDate: exp.startDate ? new Date(exp.startDate) : null,
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          location: exp.location || "",
          description: exp.description || ""
        }
      });
    }));
  }

  // Add skills
  if (parsedData.skills && parsedData.skills.length > 0) {
    await Promise.all(parsedData.skills.map(skill => {
      return prisma.skill.create({
        data: {
          resumeId: resume.id,
          name: skill.name,
          level: skill.level || ""
        }
      });
    }));
  }

  // Add certifications
  if (parsedData.certifications && parsedData.certifications.length > 0) {
    await Promise.all(parsedData.certifications.map(cert => {
      return prisma.certification.create({
        data: {
          resumeId: resume.id,
          name: cert.name,
          issuer: cert.issuer || "",
          issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
          expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : null
        }
      });
    }));
  }

  // Add projects
  if (parsedData.projects && parsedData.projects.length > 0) {
    await Promise.all(parsedData.projects.map(project => {
      return prisma.project.create({
        data: {
          resumeId: resume.id,
          name: project.name,
          description: project.description || "",
          startDate: project.startDate ? new Date(project.startDate) : null,
          endDate: project.endDate ? new Date(project.endDate) : null,
          url: project.url || ""
        }
      });
    }));
  }

  console.log('Resume data saved successfully');
  return resume.id;
} 