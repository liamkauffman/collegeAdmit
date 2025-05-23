'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavigationBar from '@/components/navigation-bar';
import { Upload, BookOpen, GraduationCap, Heart, FileText, Edit, Plus, Check, Clock } from 'lucide-react';

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Add effect to fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/user/preferences');
          if (!response.ok) {
            throw new Error('Failed to fetch preferences');
          }
          const data = await response.json();
          console.log("Data", data);
          if (data.preferences) {
            const prefs = data.preferences;
            setAcademicMetrics({
              gpa: prefs.gpa || '',
              satScore: prefs.satScore || '',
              actScore: prefs.actScore || '',
              classRank: prefs.classRank || ''
            });
            setAcademicNotes(prefs.academicNotes || '');
            setLanguages(prefs.languages || [{ language: 'English', proficiency: 'Native' }]);
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
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9F9] to-[#BED8D4]">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2081C3]">Welcome, {session.user.name || 'User'}!</h1>
          <p className="text-[#2081C3]/80 mt-2">Manage your profile, applications, and saved colleges</p>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="mb-8 border-b border-[#BED8D4]">
          <div className="flex space-x-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'profile' 
                  ? 'text-[#2081C3] border-b-2 border-[#2081C3]' 
                  : 'text-[#2081C3]/70 hover:text-[#2081C3]'
              }`}
            >
              Academic Profile
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'favorites' 
                  ? 'text-[#2081C3] border-b-2 border-[#2081C3]' 
                  : 'text-[#2081C3]/70 hover:text-[#2081C3]'
              }`}
            >
              Favorite Colleges
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'applications' 
                  ? 'text-[#2081C3] border-b-2 border-[#2081C3]' 
                  : 'text-[#2081C3]/70 hover:text-[#2081C3]'
              }`}
            >
              Applications
            </button>
          </div>
        </div>
        
        {/* Academic Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2081C3]">Academic Profile</h2>
              <button className="flex items-center text-[#2081C3] hover:text-[#2081C3]/80 transition-colors">
                <Edit className="h-4 w-4 mr-1" />
                <span className="text-sm">Edit Profile</span>
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#2081C3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#2081C3]/70">Loading your academic profile...</p>
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
                  <h3 className="text-lg font-medium text-[#2081C3] mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Academic Metrics
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2081C3]/80 mb-1">GPA</label>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={academicMetrics.gpa}
                          onChange={(e) => handleInputChange('gpa', e.target.value)}
                          className="bg-white/50 border border-[#BED8D4] rounded-md py-2 px-3 text-[#2081C3] w-full focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                        />
                        <span className="text-xs text-[#2081C3]/60 ml-2">/ 4.0</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2081C3]/80 mb-1">SAT Score</label>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={academicMetrics.satScore}
                          onChange={(e) => handleInputChange('satScore', e.target.value)}
                          className="bg-white/50 border border-[#BED8D4] rounded-md py-2 px-3 text-[#2081C3] w-full focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                        />
                        <span className="text-xs text-[#2081C3]/60 ml-2">/ 1600</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2081C3]/80 mb-1">ACT Score</label>
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={academicMetrics.actScore}
                          onChange={(e) => handleInputChange('actScore', e.target.value)}
                          className="bg-white/50 border border-[#BED8D4] rounded-md py-2 px-3 text-[#2081C3] w-full focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                        />
                        <span className="text-xs text-[#2081C3]/60 ml-2">/ 36</span>
                      </div>
                    </div>
                    
            
                  </div>
                </div>
                
                {/* Documents */}
                <div>
                  <h3 className="text-lg font-medium text-[#2081C3] mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border border-dashed border-[#BED8D4] rounded-lg p-6 bg-white/30 text-center">
                      <Upload className="h-8 w-8 mx-auto text-[#2081C3]/60 mb-2" />
                      <h4 className="text-sm font-medium text-[#2081C3] mb-1">Upload Resume</h4>
                      <p className="text-xs text-[#2081C3]/60 mb-3">PDF, DOC or DOCX up to 5MB</p>
                      <button className="bg-[#2081C3]/10 text-[#2081C3] px-4 py-2 rounded-md text-sm hover:bg-[#2081C3]/20 transition-colors">
                        Select File
                      </button>
                    </div>
                    
                    <div className="border border-[#BED8D4] rounded-lg p-4 bg-white/50">
                      <div className="flex items-center">
                        <div className="bg-[#2081C3]/10 p-2 rounded-md mr-3">
                          <FileText className="h-5 w-5 text-[#2081C3]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#2081C3]">Personal Statement.pdf</h4>
                          <p className="text-xs text-[#2081C3]/60">Uploaded on May 15, 2023</p>
                        </div>
                        <button className="text-[#2081C3]/70 hover:text-[#2081C3] transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-[#BED8D4] rounded-lg p-4 bg-white/50">
                      <div className="flex items-center">
                        <div className="bg-[#2081C3]/10 p-2 rounded-md mr-3">
                          <BookOpen className="h-5 w-5 text-[#2081C3]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#2081C3]">Transcript.pdf</h4>
                          <p className="text-xs text-[#2081C3]/60">Uploaded on May 10, 2023</p>
                        </div>
                        <button className="text-[#2081C3]/70 hover:text-[#2081C3] transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Academic Notes Section */}
            <div className="mt-8 border-t border-[#BED8D4] pt-8">
              <h3 className="text-lg font-medium text-[#2081C3] mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Academic Notes
              </h3>
              <p className="text-sm text-[#2081C3]/70 mb-4">
                Add specific notes about your academic interests, achievements, or goals to help our AI provide better college recommendations.
              </p>
              <div className="bg-white/50 border border-[#BED8D4] rounded-md p-4">
                <textarea
                  value={academicNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="E.g., I'm passionate about environmental science and have participated in several research projects. I'm looking for colleges with strong sustainability programs..."
                  className="w-full h-32 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-[#2081C3] placeholder-[#2081C3]/40"
                ></textarea>
              </div>
            </div>
            
            {/* Languages Section */}
            <div className="mt-8 border-t border-[#BED8D4] pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[#2081C3] flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Languages
                </h3>
                <button 
                  onClick={addLanguage}
                  className="flex items-center text-[#2081C3] hover:bg-[#2081C3]/10 px-3 py-1 rounded-md text-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Language
                </button>
              </div>
              <p className="text-sm text-[#2081C3]/70 mb-4">
                List languages you speak and your proficiency level. This information helps match you with programs that value language skills.
              </p>
              
              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#2081C3]/80 mb-1">Language</label>
                      <input
                        type="text"
                        value={lang.language}
                        onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                        placeholder="Language"
                        className="bg-white/50 border border-[#BED8D4] rounded-md py-2 px-3 text-[#2081C3] w-full focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#2081C3]/80 mb-1">Proficiency</label>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                        className="bg-white/50 border border-[#BED8D4] rounded-md py-2 px-3 text-[#2081C3] w-full focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
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
          </div>
        )}
        
        {/* Favorite Colleges Tab */}
        {activeTab === 'favorites' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2081C3]">Favorite Colleges</h2>
              <button className="flex items-center text-white bg-[#2081C3] hover:bg-[#2081C3]/90 transition-colors px-3 py-1.5 rounded-md text-sm">
                <Plus className="h-4 w-4 mr-1" />
                <span>Add College</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* College Card */}
              <div className="border border-[#BED8D4] rounded-lg p-5 bg-white/50 hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-[#2081C3]/10 p-3 rounded-md mr-4">
                    <GraduationCap className="h-6 w-6 text-[#2081C3]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[#2081C3]">Stanford University</h3>
                      <button className="text-[#2081C3] hover:text-[#2081C3]/80 transition-colors">
                        <Heart className="h-5 w-5 fill-[#2081C3]" />
                      </button>
                    </div>
                    <p className="text-sm text-[#2081C3]/70 mb-3">Stanford, CA • Private Research University</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">Top 5 National</span>
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">4% Acceptance</span>
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">Computer Science</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#2081C3]/80">Added on May 20, 2023</span>
                      <button className="text-[#2081C3] hover:bg-[#2081C3]/10 px-3 py-1 rounded-md text-sm transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-[#BED8D4] rounded-lg p-5 bg-white/50 hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-[#2081C3]/10 p-3 rounded-md mr-4">
                    <GraduationCap className="h-6 w-6 text-[#2081C3]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[#2081C3]">MIT</h3>
                      <button className="text-[#2081C3] hover:text-[#2081C3]/80 transition-colors">
                        <Heart className="h-5 w-5 fill-[#2081C3]" />
                      </button>
                    </div>
                    <p className="text-sm text-[#2081C3]/70 mb-3">Cambridge, MA • Private Research University</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">Top 5 National</span>
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">7% Acceptance</span>
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">Engineering</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#2081C3]/80">Added on May 18, 2023</span>
                      <button className="text-[#2081C3] hover:bg-[#2081C3]/10 px-3 py-1 rounded-md text-sm transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-[#BED8D4] rounded-lg p-5 bg-white/50 hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-[#2081C3]/10 p-3 rounded-md mr-4">
                    <GraduationCap className="h-6 w-6 text-[#2081C3]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[#2081C3]">UC Berkeley</h3>
                      <button className="text-[#2081C3] hover:text-[#2081C3]/80 transition-colors">
                        <Heart className="h-5 w-5 fill-[#2081C3]" />
                      </button>
                    </div>
                    <p className="text-sm text-[#2081C3]/70 mb-3">Berkeley, CA • Public Research University</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">Top 20 National</span>
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">16% Acceptance</span>
                      <span className="bg-[#2081C3]/10 text-[#2081C3] text-xs px-2 py-1 rounded-md">Business</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#2081C3]/80">Added on May 15, 2023</span>
                      <button className="text-[#2081C3] hover:bg-[#2081C3]/10 px-3 py-1 rounded-md text-sm transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-[#78D5D7]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2081C3]">Applications</h2>
              <button className="flex items-center text-white bg-[#2081C3] hover:bg-[#2081C3]/90 transition-colors px-3 py-1.5 rounded-md text-sm">
                <Plus className="h-4 w-4 mr-1" />
                <span>New Application</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Application Card */}
              <div className="border border-[#BED8D4] rounded-lg p-5 bg-white/50 hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-[#63D2FF]/20 p-3 rounded-md mr-4">
                    <Check className="h-6 w-6 text-[#63D2FF]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[#2081C3]">Stanford University</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Submitted</span>
                    </div>
                    <p className="text-sm text-[#2081C3]/70 mb-3">Early Decision • Computer Science</p>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Application Deadline</p>
                        <p className="text-sm text-[#2081C3]">November 1, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Date Submitted</p>
                        <p className="text-sm text-[#2081C3]">October 25, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Decision Date</p>
                        <p className="text-sm text-[#2081C3]">December 15, 2023</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <button className="text-[#2081C3] hover:bg-[#2081C3]/10 px-3 py-1 rounded-md text-sm transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-[#BED8D4] rounded-lg p-5 bg-white/50 hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-[#78D5D7]/20 p-3 rounded-md mr-4">
                    <Clock className="h-6 w-6 text-[#78D5D7]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[#2081C3]">MIT</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">In Progress</span>
                    </div>
                    <p className="text-sm text-[#2081C3]/70 mb-3">Regular Decision • Engineering</p>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Application Deadline</p>
                        <p className="text-sm text-[#2081C3]">January 5, 2024</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Date Started</p>
                        <p className="text-sm text-[#2081C3]">October 10, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Decision Date</p>
                        <p className="text-sm text-[#2081C3]">March 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <button className="text-[#2081C3] hover:bg-[#2081C3]/10 px-3 py-1 rounded-md text-sm transition-colors">
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-[#BED8D4] rounded-lg p-5 bg-white/50 hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-[#BED8D4]/30 p-3 rounded-md mr-4">
                    <Edit className="h-6 w-6 text-[#BED8D4]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[#2081C3]">UC Berkeley</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Not Started</span>
                    </div>
                    <p className="text-sm text-[#2081C3]/70 mb-3">Regular Decision • Business</p>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Application Deadline</p>
                        <p className="text-sm text-[#2081C3]">November 30, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Date Added</p>
                        <p className="text-sm text-[#2081C3]">October 5, 2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#2081C3]/60">Decision Date</p>
                        <p className="text-sm text-[#2081C3]">March 31, 2024</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                      </div>
                      <button className="text-[#2081C3] hover:bg-[#2081C3]/10 px-3 py-1 rounded-md text-sm transition-colors">
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