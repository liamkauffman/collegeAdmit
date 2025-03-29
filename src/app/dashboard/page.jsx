'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavigationBar from '@/components/navigation-bar';
import { Upload, BookOpen, GraduationCap, Heart, FileText, Edit, Plus, Check, Clock, X, Download, MapPin, ArrowRight, Search } from 'lucide-react';
import { FileUpload } from "@/components/ui/file-upload";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add state for academic metrics
  const [academicMetrics, setAcademicMetrics] = useState({
    gpa: '',
    satScore: '',
    actScore: '',
    classRank: ''
  });

  // Add state for academic notes and languages
  const [academicNotes, setAcademicNotes] = useState('');
  const [languages, setLanguages] = useState([
    { language: 'English', proficiency: 'Native' }
  ]);

  // Add state for onboarding data
  const [onboardingData, setOnboardingData] = useState({
    gpa: '',
    testScores: { sat: '', act: '' },
    majors: '',
    careerGoals: '',
    collegeSetting: '',
    collegeType: '',
    sportsPrograms: '',
    extracurriculars: [],
    additionalPreferences: ''
  });

  const [resumeUrl, setResumeUrl] = useState('');

  // Add a new state for favorite colleges
  const [favoriteColleges, setFavoriteColleges] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Update the fetchPreferences effect
  useEffect(() => {
    const fetchPreferences = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/user/preferences');
          if (!response.ok) {
            throw new Error('Failed to fetch preferences');
          }
          const data = await response.json();
          if (data.preferences) {
            const prefs = data.preferences;
            // Set academic metrics
            setAcademicMetrics({
              gpa: prefs.gpa || '',
              satScore: prefs.testScores?.sat || '',
              actScore: prefs.testScores?.act || '',
              classRank: prefs.classRank || ''
            });
            // Set onboarding data
            setOnboardingData({
              gpa: prefs.gpa || '',
              testScores: prefs.testScores || { sat: '', act: '' },
              majors: prefs.majors || '',
              careerGoals: prefs.careerGoals || '',
              collegeSetting: prefs.collegeSetting || '',
              collegeType: prefs.collegeType || '',
              sportsPrograms: prefs.sportsPrograms || '',
              extracurriculars: prefs.extracurriculars || [],
              additionalPreferences: prefs.additionalPreferences || ''
            });
            setAcademicNotes(prefs.academicNotes || '');
            setLanguages(prefs.languages || [{ language: 'English', proficiency: 'Native' }]);
            setResumeUrl(prefs.resume || '');
          }
        } catch (err) {
          console.error('Error fetching preferences:', err);
          setError('Failed to load your academic profile');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPreferences();
  }, [status]);

  // Add effect to fetch favorite colleges
  useEffect(() => {
    const fetchFavoriteColleges = async () => {
      if (status === 'authenticated' && activeTab === 'favorites') {
        setLoadingFavorites(true);
        setFavoritesError(null);
        try {
          const response = await fetch('/api/colleges/favorite');
          if (!response.ok) {
            throw new Error('Failed to fetch favorite colleges');
          }
          const data = await response.json();
          setFavoriteColleges(data);
        } catch (err) {
          console.error('Error fetching favorite colleges:', err);
          setFavoritesError('Failed to load your favorite colleges');
        } finally {
          setLoadingFavorites(false);
        }
      }
    };

    fetchFavoriteColleges();
  }, [status, activeTab]);

  // Handler for input changes
  const handleInputChange = async (field, value) => {
    const newMetrics = {
      ...academicMetrics,
      [field]: value
    };
    setAcademicMetrics(newMetrics);
    
    // Save to database
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...newMetrics,
            academicNotes,
            languages
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      // Optionally show an error message to the user
    }
  };

  // Handler for notes changes
  const handleNotesChange = async (value) => {
    setAcademicNotes(value);
    
    // Save to database
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...academicMetrics,
            academicNotes: value,
            languages
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      // Optionally show an error message to the user
    }
  };

  // Handler for language changes
  const handleLanguageChange = async (index, field, value) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    setLanguages(updatedLanguages);
    
    // Save to database
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...academicMetrics,
            academicNotes,
            languages: updatedLanguages
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      // Optionally show an error message to the user
    }
  };

  // Add a new language input field
  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: '' }]);
  };

  // Remove a language input field
  const removeLanguage = (index) => {
    if (languages.length > 1) {
      const updatedLanguages = languages.filter((_, i) => i !== index);
      setLanguages(updatedLanguages);
    }
  };

  // Handler for onboarding data changes
  const handleOnboardingChange = async (field, value) => {
    const newData = {
      ...onboardingData,
      [field]: value
    };
    setOnboardingData(newData);
    
    // Save to database
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...academicMetrics,
            academicNotes,
            languages,
            ...newData
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      // Optionally show an error message to the user
    }
  };

  // Handler for adding extracurricular activity
  const handleAddExtracurricular = () => {
    setOnboardingData({
      ...onboardingData,
      extracurriculars: [...onboardingData.extracurriculars, '']
    });
  };

  // Handler for removing extracurricular activity
  const handleRemoveExtracurricular = (index) => {
    const newExtracurriculars = onboardingData.extracurriculars.filter((_, i) => i !== index);
    setOnboardingData({
      ...onboardingData,
      extracurriculars: newExtracurriculars
    });
  };

  // Handler for updating extracurricular activity
  const handleExtracurricularChange = (index, value) => {
    const newExtracurriculars = [...onboardingData.extracurriculars];
    newExtracurriculars[index] = value;
    setOnboardingData({
      ...onboardingData,
      extracurriculars: newExtracurriculars
    });
  };

  // Add handler for resume upload
  const handleResumeUpload = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload/resume', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const data = await response.json();
        setResumeUrl(data.fileUrl);
        
        // Save to preferences
        await fetch('/api/user/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences: {
              ...academicMetrics,
              academicNotes,
              languages,
              resume: data.fileUrl
            }
          }),
        });
      } catch (err) {
        console.error('Error uploading resume:', err);
        // Optionally show an error message to the user
      }
    }
  };

  // Add handler for resume removal
  const handleRemoveResume = async () => {
    try {
      setResumeUrl('');
      
      // Update preferences to remove resume
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            ...academicMetrics,
            academicNotes,
            languages,
            resume: ''
          }
        }),
      });
    } catch (err) {
      console.error('Error removing resume:', err);
      // Optionally show an error message to the user
    }
  };

  // Add handler to remove college from favorites
  const handleUnfavoriteCollege = async (collegeId) => {
    try {
      const response = await fetch('/api/colleges/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeId,
          action: 'unfavorite'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }
      
      // Update state to remove the college from the list
      setFavoriteColleges(favoriteColleges.filter(item => item.collegeId !== collegeId));
    } catch (err) {
      console.error('Error removing college from favorites:', err);
      // Show error message to user
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#2081C3]">Loading...</h2>
          <p className="text-[#2081C3]/80">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.name || 'User'}!</h1>
          <p className="text-gray-900 mt-2">Manage your profile, applications, and saved colleges</p>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'profile' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Academic Profile
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'favorites' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Favorite Colleges
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'applications' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Applications
            </button>
          </div>
        </div>
        
        {/* Academic Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Academic Profile</h2>
              <button className="flex items-center text-gray-900 hover:text-gray-700 transition-colors">
                <Edit className="h-4 w-4 mr-1" />
                <span className="text-sm">Edit Profile</span>
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-900">Loading your academic profile...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-red-600 text-sm underline mt-2 hover:text-red-700"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic Metrics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Academic Metrics
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">GPA</label>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={academicMetrics.gpa}
                          onChange={(e) => handleInputChange('gpa', e.target.value)}
                          className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        />
                        <span className="text-xs text-gray-900 ml-2">/ 4.0</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">SAT Score</label>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={academicMetrics.satScore}
                          onChange={(e) => handleInputChange('satScore', e.target.value)}
                          className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        />
                        <span className="text-xs text-gray-900 ml-2">/ 1600</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">ACT Score</label>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={academicMetrics.actScore}
                          onChange={(e) => handleInputChange('actScore', e.target.value)}
                          className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        />
                        <span className="text-xs text-gray-900 ml-2">/ 36</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* College Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    College Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">College Type</label>
                      <select
                        value={onboardingData.collegeType}
                        onChange={(e) => handleOnboardingChange('collegeType', e.target.value)}
                        className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      >
                        <option value="">Select type</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                        <option value="Liberal Arts">Liberal Arts</option>
                        <option value="Research University">Research University</option>
                      </select>
                    </div>
                    
            
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Extracurriculars</label>
                      <div className="space-y-2">
                        {onboardingData.extracurriculars.map((activity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={activity}
                              onChange={(e) => handleExtracurricularChange(index, e.target.value)}
                              placeholder="Enter activity"
                              className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                            />
                            <button
                              onClick={() => handleRemoveExtracurricular(index)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={handleAddExtracurricular}
                          className="flex items-center text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md text-sm transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Activity
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Academic Notes Section */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Academic Notes
              </h3>
              <p className="text-sm text-gray-900 mb-4">
                Add specific notes about your academic interests, achievements, or goals to help our AI provide better college recommendations.
              </p>
              <div className="bg-white border border-gray-300 rounded-md p-4">
                <textarea
                  value={academicNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="E.g., I'm passionate about environmental science and have participated in several research projects. I'm looking for colleges with strong sustainability programs..."
                  className="w-full h-32 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
                ></textarea>
              </div>
            </div>
            
            {/* Languages Section */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Languages
                </h3>
                <button 
                  onClick={addLanguage}
                  className="flex items-center text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md text-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Language
                </button>
              </div>
              <p className="text-sm text-gray-900 mb-4">
                List languages you speak and your proficiency level. This information helps match you with programs that value language skills.
              </p>
              
              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1">Language</label>
                      <input
                        type="text"
                        value={lang.language}
                        onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                        placeholder="Language"
                        className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1">Proficiency</label>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                        className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      >
                        <option value="">Select proficiency</option>
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Beginner">Beginner</option>
                      </select>
                    </div>
                    {languages.length > 1 && (
                      <button
                        onClick={() => removeLanguage(index)}
                        className="mt-6 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Resume Section */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Resume
                </h3>
              </div>
              <p className="text-sm text-gray-900 mb-4">
                Upload your resume to help us better understand your academic and extracurricular achievements.
              </p>
              
              {resumeUrl ? (
                <div className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Resume uploaded</p>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(parseInt(resumeUrl.split('-')[1])).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="h-5 w-5 text-gray-900" />
                      </a>
                      <button
                        onClick={handleRemoveResume}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <FileUpload
                  onFileSelect={handleResumeUpload}
                  accept=".pdf,.doc,.docx"
                  maxSize={5}
                />
              )}
            </div>
          </div>
        )}
        
        {/* Favorite Colleges Tab */}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Favorite Colleges</h2>
              <button 
                onClick={() => router.push('/colleges')} 
                className="flex items-center text-white bg-[#2081C3] hover:bg-[#1a6ea8] transition-colors px-4 py-2 rounded-md text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Browse Colleges</span>
              </button>
            </div>
            
            {loadingFavorites ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-2 border-[#2081C3] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading your favorite colleges...</p>
              </div>
            ) : favoritesError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-center">
                <p className="text-red-600 mb-2">{favoritesError}</p>
                <button 
                  onClick={() => setActiveTab('favorites')} 
                  className="text-[#2081C3] underline hover:text-[#1a6ea8]"
                >
                  Try again
                </button>
              </div>
            ) : favoriteColleges.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite colleges yet</h3>
                <p className="text-gray-600 mb-4">
                  Start exploring colleges and add them to your favorites to keep track of schools you're interested in.
                </p>
                <button 
                  onClick={() => router.push('/colleges')} 
                  className="inline-flex items-center text-white bg-[#2081C3] hover:bg-[#1a6ea8] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Explore Colleges
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {favoriteColleges.map((favorite) => (
                  <div 
                    key={favorite.id} 
                    className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 flex-shrink-0 bg-[#EDF8FF] rounded-md flex items-center justify-center">
                        <GraduationCap className="h-7 w-7 text-[#2081C3]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2081C3] transition-colors">
                            {favorite.college.name}
                          </h3>
                          <button 
                            onClick={() => handleUnfavoriteCollege(favorite.collegeId)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            aria-label="Remove from favorites"
                            title="Remove from favorites"
                          >
                            <Heart className="h-5 w-5 fill-red-500" />
                          </button>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mt-1 mb-3">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {[favorite.college.city, favorite.college.state].filter(Boolean).join(', ')}
                          </span>
                          {favorite.college.type && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <span>{favorite.college.type}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {favorite.college.acceptanceRate && (
                            <span className="bg-[#EDF8FF] text-[#2081C3] text-xs px-2 py-1 rounded-md font-medium">
                              {Math.round(favorite.college.acceptanceRate)}% Acceptance
                            </span>
                          )}
                          {favorite.college.tuition && (
                            <span className="bg-[#EDF8FF] text-[#2081C3] text-xs px-2 py-1 rounded-md font-medium">
                              ${new Intl.NumberFormat().format(favorite.college.tuition)} Tuition
                            </span>
                          )}
                          {favorite.college.majors && favorite.college.majors.length > 0 && (
                            <span className="bg-[#EDF8FF] text-[#2081C3] text-xs px-2 py-1 rounded-md font-medium">
                              {favorite.college.majors[0].major.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-gray-500">
                            Added {new Date(favorite.createdAt).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => router.push(`/colleges/${favorite.collegeId}`)}
                            className="text-[#2081C3] hover:bg-[#EDF8FF] px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
                          >
                            View Details
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Applications</h2>
              <button className="flex items-center text-white bg-gray-900 hover:bg-gray-800 transition-colors px-3 py-1.5 rounded-md text-sm">
                <Plus className="h-4 w-4 mr-1" />
                <span>New Application</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Application Card */}
              <div className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-md mr-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Stanford University</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Submitted</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Early Decision • Computer Science</p>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Application Deadline</p>
                        <p className="text-sm text-gray-900">November 1, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date Submitted</p>
                        <p className="text-sm text-gray-900">October 25, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Decision Date</p>
                        <p className="text-sm text-gray-900">December 15, 2023</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <button className="text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md text-sm transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-md mr-4">
                    <Clock className="h-6 w-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">MIT</h3>
                      <span className="bg-gray-100 text-gray-900 text-xs px-2 py-1 rounded-full">In Progress</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Regular Decision • Engineering</p>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Application Deadline</p>
                        <p className="text-sm text-gray-900">January 5, 2024</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date Started</p>
                        <p className="text-sm text-gray-900">October 10, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Decision Date</p>
                        <p className="text-sm text-gray-900">March 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <button className="text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md text-sm transition-colors">
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-md mr-4">
                    <Edit className="h-6 w-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">UC Berkeley</h3>
                      <span className="bg-gray-100 text-gray-900 text-xs px-2 py-1 rounded-full">Not Started</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Regular Decision • Business</p>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Application Deadline</p>
                        <p className="text-sm text-gray-900">November 30, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date Added</p>
                        <p className="text-sm text-gray-900">October 5, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Decision Date</p>
                        <p className="text-sm text-gray-900">March 31, 2024</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <button className="text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md text-sm transition-colors">
                        Start Application
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 