'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ResumeUploader({ onUploadComplete }) {
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [useGemini, setUseGemini] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [parsingStatus, setParsingStatus] = useState('idle'); // 'idle', 'parsing', 'success', 'error'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
    setParsedData(null);
    setParsingStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    setIsUploading(true);
    setError('');
    setParsingStatus('parsing');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('use_gemini', useGemini);
      
      // Only append user_id if it's an admin uploading for someone else
      if (session?.user?.role === 'ADMIN' && document.getElementById('user-id')?.value) {
        formData.append('user_id', document.getElementById('user-id').value);
      }

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });

      // Parse response data
      const result = await response.json();
      
      // Handle different response statuses
      if (!response.ok && response.status !== 207) {
        // Complete failure
        throw new Error(result.error || result.detail || 'Failed to upload resume');
      }
      
      // Check if we have a partial success (file uploaded but parsing failed)
      if (response.status === 207) {
        setParsingStatus('error');
        setError(result.error || 'Resume was uploaded but parsing failed');
        console.warn('Resume parsing issue:', result.errorDetails || 'Unknown error');
      } else {
        setParsingStatus('success');
      }
      
      // Save parsed data if available
      if (result.parsedData) {
        setParsedData(result.parsedData);
      }
      
      // Call the completion handler with the result
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'An error occurred during upload');
      setParsingStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Resume (PDF, DOC, DOCX)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
            accept=".pdf,.doc,.docx"
            disabled={isUploading}
          />
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={useGemini}
              onChange={() => setUseGemini(!useGemini)}
              className="form-checkbox h-4 w-4 text-blue-600"
              disabled={isUploading}
            />
            <span className="ml-2 text-sm text-gray-700">Use enhanced AI parsing (Gemini)</span>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {parsingStatus === 'success' && !error && (
          <div className="mb-4 p-2 text-sm text-green-700 bg-green-100 rounded-md">
            Resume uploaded and analyzed successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${isUploading || !file 
                      ? 'bg-blue-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
        >
          {isUploading ? (parsingStatus === 'parsing' ? 'Analyzing Resume...' : 'Uploading...') : 'Upload Resume'}
        </button>
      </form>

      {parsedData && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Analysis</h3>
          
          <div className="border rounded-md p-3 mb-3 bg-gray-50">
            <h4 className="font-medium">Personal Information</h4>
            <p className="text-sm">{parsedData.personalInfo.fullName}</p>
            <p className="text-sm">{parsedData.personalInfo.email}</p>
            <p className="text-sm">{parsedData.personalInfo.phone}</p>
          </div>
          
          <div className="border rounded-md p-3 mb-3 bg-gray-50">
            <h4 className="font-medium">Summary</h4>
            <p className="text-sm">{parsedData.analysis.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="border rounded-md p-3 bg-gray-50">
              <h4 className="font-medium">Strengths</h4>
              <p className="text-sm">{parsedData.analysis.strengths}</p>
            </div>
            <div className="border rounded-md p-3 bg-gray-50">
              <h4 className="font-medium">Areas to Improve</h4>
              <p className="text-sm">{parsedData.analysis.improvementAreas}</p>
            </div>
          </div>
          
          <button
            onClick={() => setParsedData(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Hide Analysis
          </button>
        </div>
      )}
    </div>
  );
} 