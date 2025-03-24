"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form"
import NavigationBar from "@/components/navigation-bar"
import { LoadingAnimation } from "@/components/loading-animation"
import { CollegeCard } from "@/components/college-card"
import { useSession } from "next-auth/react";
import { API_URL } from "@/config";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Search, ClipboardEdit, Bot, Sparkles, Laptop, ClipboardCheck, Compass, GraduationCap } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [initialQuery, setInitialQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("initial"); // "initial", "followup", "results"
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [searchSummary, setSearchSummary] = useState("");
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedQuery, setSavedQuery] = useState("");
  
  // Function to fetch follow-up questions
  const fetchFollowUpQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/colleges/follow-up-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initial_query: initialQuery,
          user_profile: session?.user?.preferences || {}
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch follow-up questions');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: follow-up questions should be an array');
      }
      
      setFollowUpQuestions(data);
      setCurrentStep("followup");
    } catch (err) {
      setError(err.message);
      console.error('Error fetching follow-up questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the initial search query
  const handleInitialSearch = (e) => {
    e.preventDefault();
    if (!initialQuery.trim()) return;
    
    // Check if user is authenticated
    if (status === "authenticated") {
      fetchFollowUpQuestions();
    } else {
      // Save the query and show the auth modal
      setSavedQuery(initialQuery);
      setShowAuthModal(true);
    }
  };

  // Function to handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    // If user is now authenticated and we have a saved query, continue with search
    if (status === "authenticated" && savedQuery) {
      setInitialQuery(savedQuery);
      setSavedQuery("");
      fetchFollowUpQuestions();
    }
  };

  // Function to handle a follow-up answer and move to the next question
  const handleFollowUpAnswer = () => {
    if (!currentAnswer.trim()) return;
    
    // Save the current answer
    const newAnswers = [...followUpAnswers];
    newAnswers.push({
      question_id: followUpQuestions[currentQuestionIndex].question_id,
      answer: currentAnswer
    });
    setFollowUpAnswers(newAnswers);
    setCurrentAnswer("");
    
    // Check if this was the last question
    if (currentQuestionIndex < followUpQuestions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, get recommendations
      getCollegeRecommendations(newAnswers);
    }
  };

  // Function to get college recommendations
  const getCollegeRecommendations = async (answers) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare the payload for the recommendations request
      const payload = {
        initial_query: initialQuery,
        follow_up_answers: answers,
        user_profile: session?.user?.preferences || {}
      };
      
      const response = await fetch('/api/colleges/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch college recommendations');
      }
      
      const data = await response.json();
      
      // Handle the response structure from the FastAPI backend
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format: recommendations should be an array');
      }
      
      setRecommendations(data.recommendations);
      setSearchSummary(data.search_summary || "Based on your search criteria, we've found the following recommendations.");
      setCurrentStep("results");
    } catch (err) {
      setError(err.message);
      console.error('Error fetching college recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the search flow
  const resetSearch = () => {
    setInitialQuery("");
    setFollowUpQuestions([]);
    setCurrentQuestionIndex(0);
    setFollowUpAnswers([]);
    setCurrentAnswer("");
    setRecommendations(null);
    setSearchSummary("");
    setCurrentStep("initial");
    setError(null);
  };

  // Categorize recommendations
  const getBestFit = () => recommendations?.find(college => 
    college.category === "best_fit" || college.category_type === "best_fit"
  );
  
  const getReachSchools = () => recommendations?.filter(college => 
    college.category === "reach" || college.category_type === "reach"
  );
  
  const getTargetSchools = () => recommendations?.filter(college => 
    college.category === "target" || college.category_type === "target"
  );
  
  const getSafetySchools = () => recommendations?.filter(college => 
    college.category === "safety" || college.category_type === "safety"
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentStep === "followup") {
      e.preventDefault(); // Prevent the default behavior of adding a newline
      handleFollowUpAnswer();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <NavigationBar />
      
      <main className="flex-1 relative">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Sidebar - Only visible on large screens by default */}
          <div className="hidden lg:block lg:w-64 xl:w-72 lg:border-r border-[#BED8D4] dark:border-gray-800 bg-white dark:bg-gray-950 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#4068ec] dark:text-[#63D2FF]">Find Your College</h2>
              <div>
                <SearchForm isSidebar={true} />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center min-h-[90vh] h-full pb-10 sm:pb-20">
                <div className="py-10">
                  <LoadingAnimation />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex items-center justify-center min-h-[70vh] h-full pb-10 sm:pb-20">
                <div className="w-full max-w-2xl px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
                  <div className="text-red-600 dark:text-red-400 text-center mb-6">
                    <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
                    <p>{error}</p>
                  </div>
                  <button 
                    onClick={resetSearch}
                    className="px-4 py-2 rounded-md bg-[#4068ec] text-white hover:bg-[#4068ec]/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Initial Search State */}
            {!isLoading && !error && currentStep === "initial" && (
              <div className="flex items-center justify-center min-h-[90vh] h-full pb-10 sm:pb-20">
                <div className="w-full max-w-2xl px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
                  <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4068ec] to-[#63D2FF] leading-tight">
                    Find Your Perfect College Match
                  </h1>
                  <form onSubmit={handleInitialSearch} className="w-full">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="What type of colleges are you looking for?" 
                        className="w-full py-4 sm:py-6 px-4 sm:px-7 text-base sm:text-lg rounded-xl border border-[#BED8D4]/50 dark:border-gray-700 bg-white dark:bg-gray-900 text-[#4068ec] dark:text-[#63D2FF] placeholder-[#4068ec]/60 dark:placeholder-[#63D2FF]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                        value={initialQuery}
                        onChange={(e) => setInitialQuery(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#4068ec]/5 dark:bg-[#63D2FF]/5 hover:bg-[#4068ec]/15 dark:hover:bg-[#63D2FF]/15 text-[#4068ec] dark:text-[#63D2FF] p-2 sm:p-2.5 rounded-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </form>
                  
                  <div className="flex justify-center mt-6">
                    <div className="w-2 h-2 rounded-full bg-[#78D5D7] dark:bg-[#78D5D7]/70 mx-1"></div>
                    <div className="w-2 h-2 rounded-full bg-[#63D2FF] dark:bg-[#63D2FF]/70 mx-1"></div>
                    <div className="w-2 h-2 rounded-full bg-[#4068ec] dark:bg-[#4068ec]/70 mx-1"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up Questions State */}
            {!isLoading && !error && currentStep === "followup" && followUpQuestions.length > 0 && (
              <div className="flex items-center justify-center min-h-[70vh] h-full pb-10 sm:pb-20">
                <div className="w-full max-w-2xl px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
                  <div className="w-full">
                    <div className="mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4068ec] to-[#63D2FF]">
                        {followUpQuestions[currentQuestionIndex]?.text || "Additional Information"}
                      </h2>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#4068ec] to-[#63D2FF] rounded-full"
                          style={{ width: `${((currentQuestionIndex + 1) / followUpQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Question {currentQuestionIndex + 1} of {followUpQuestions.length}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <textarea 
                        placeholder="Your answer..."
                        className="w-full py-4 px-5 text-base rounded-xl border border-[#BED8D4]/50 dark:border-gray-700 bg-white dark:bg-gray-900 text-[#4068ec] dark:text-[#63D2FF] placeholder-[#4068ec]/60 dark:placeholder-[#63D2FF]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all min-h-[150px] shadow-sm"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleFollowUpAnswer();
                          }
                        }}
                      />
                      <div className="flex justify-center mt-5">
                        <Button 
                          onClick={handleFollowUpAnswer}
                          className="px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#4068ec] to-[#63D2FF] rounded-md shadow hover:from-[#4068ec]/90 hover:to-[#63D2FF]/90 focus:outline-none focus:ring-2 focus:ring-[#4068ec] focus:ring-offset-2 transition-all duration-300 flex items-center gap-2"
                        >
                          {currentQuestionIndex === followUpQuestions.length - 1 ? (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Find Colleges
                            </>
                          ) : (
                            <>
                              Next Question
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results State */}
            {!isLoading && !error && currentStep === "results" && recommendations && (
              <div className="pb-10 sm:pb-20">
     
                
                {/* Best Fit College - Centered */}
                {getBestFit() && (
                  <div className="mb-12 sm:mb-16">
                    <div className="flex justify-center">
                      <div className="w-full max-w-3xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
                        <div className="shadow-lg rounded-xl overflow-hidden">
                          <CollegeCard college={getBestFit()} type="bestFit" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* College Categories in a row */}
                <div className="px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 h-full">
                    {/* Reach School */}
                    {getReachSchools()?.length > 0 && (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 shadow-md rounded-xl overflow-hidden">
                          <CollegeCard college={getReachSchools()[0]} type="reach" />
                        </div>
                      </div>
                    )}
                    
                    {/* Target School */}
                    {getTargetSchools()?.length > 0 && (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 shadow-md rounded-xl overflow-hidden">
                          <CollegeCard college={getTargetSchools()[0]} type="target" />
                        </div>
                      </div>
                    )}
                    
                    {/* Safety School */}
                    {getSafetySchools()?.length > 0 && (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 shadow-md rounded-xl overflow-hidden">
                          <CollegeCard college={getSafetySchools()[0]} type="safety" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose} 
        actionType="search" 
      />
    </div>
  )
} 