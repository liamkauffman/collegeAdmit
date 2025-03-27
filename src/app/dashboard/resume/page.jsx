'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ResumeUploader from '@/components/ResumeUploader';
import Link from 'next/link';

export default function ResumePage() {
  const { data: session, status } = useSession();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchResumeData();
    }
  }, [status]);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resume/data');
      
      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
      }
    } catch (error) {
      console.error('Error fetching resume data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (data) => {
    setResumeData(data);
  };

  if (status === 'loading') {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8">
        <p className="mb-4">Please sign in to manage your resume</p>
        <Link 
          href="/auth/signin"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Resume</h1>
      
      {!resumeData && !loading ? (
        <div className="mb-8">
          <p className="text-gray-700 mb-4">
            Upload your resume to help us better understand your academic and professional background.
            This will allow us to provide more personalized college recommendations.
          </p>
          <ResumeUploader onUploadComplete={handleUploadComplete} />
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Resume</h2>
            <button
              onClick={() => setResumeData(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Upload New Resume
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading resume data...</div>
          ) : resumeData ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Personal Information */}
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                <p><span className="font-medium">Name:</span> {resumeData.parsedData.personalInfo.fullName}</p>
                <p><span className="font-medium">Email:</span> {resumeData.parsedData.personalInfo.email}</p>
                <p><span className="font-medium">Phone:</span> {resumeData.parsedData.personalInfo.phone}</p>
                
                {resumeData.fileUrl && (
                  <div className="mt-3">
                    <a 
                      href={resumeData.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Original Resume
                    </a>
                  </div>
                )}
              </div>
              
              {/* Education */}
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg mb-3">Education</h3>
                {resumeData.parsedData.education.map((edu, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <p className="font-medium">{edu.institution}</p>
                    <p>{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(edu.startDate).toLocaleDateString()} - 
                      {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                    </p>
                    {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                    {edu.achievements && <p className="text-sm">{edu.achievements}</p>}
                  </div>
                ))}
              </div>
              
              {/* Experience */}
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg mb-3">Work Experience</h3>
                {resumeData.parsedData.workExperience.map((exp, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <p className="font-medium">{exp.position}</p>
                    <p>{exp.company} • {exp.location}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                    </p>
                    {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
              
              {/* Skills */}
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.parsedData.skills.map((skill, index) => (
                    <div key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {skill.name} {skill.level && `(${skill.level})`}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Analysis */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">Analysis</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Strengths</h4>
                    <p className="text-sm">{resumeData.parsedData.analysis.strengths}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Areas to Improve</h4>
                    <p className="text-sm">{resumeData.parsedData.analysis.improvementAreas}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm">{resumeData.parsedData.analysis.summary}</p>
                </div>
              </div>
            </div>
          ) : (
            <p>No resume data found. Please upload your resume.</p>
          )}
        </div>
      )}
      
      {!resumeData && loading ? (
        <ResumeUploader onUploadComplete={handleUploadComplete} />
      ) : null}
    </div>
  );
} 