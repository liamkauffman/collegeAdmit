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
import { ConversationThread } from "@/components/conversation-thread";

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
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [shouldScrollToSearch, setShouldScrollToSearch] = useState(false);
  
  // Function to fetch follow-up questions
  const fetchFollowUpQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching follow-up questions for query:", initialQuery);
      console.log("User session status:", status);
      console.log("User preferences:", session?.user?.preferences);
      
      const payload = {
        initial_query: initialQuery,
        user_profile: session?.user?.preferences || {}
      };
      
      console.log("Sending payload to follow-up questions API:", payload);
      
      const response = await fetch('/api/colleges/follow-up-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log("Follow-up questions API response status:", response.status);
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        console.log("Response content type:", contentType);
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Error data from API:", errorData);
          throw new Error(errorData.error || 'Failed to fetch follow-up questions');
        } else {
          // Handle non-JSON response
          const text = await response.text();
          console.error("Non-JSON error response:", text.substring(0, 500) + (text.length > 500 ? "..." : ""));
          throw new Error(`Server returned non-JSON response with status ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log("Received follow-up questions:", data);
      
      if (!Array.isArray(data)) {
        console.error("Invalid data format - expected array but got:", typeof data);
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
    college.category === "best_fit" 
  );
  
  const getReachSchools = () => recommendations?.filter(college => 
    college.category === "reach"
  );
  
  const getTargetSchools = () => recommendations?.filter(college => 
    college.category === "target"
  );
  
  const getSafetySchools = () => recommendations?.filter(college => 
    college.category === "safety"
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

  // Function to handle conversation messages
  const handleConversationMessage = async (message) => {
    // Add user message to conversation
    const newMessage = { type: 'user', content: message };
    setConversationHistory(prev => [...prev, newMessage]);
    setIsAiTyping(true);
    setShouldScrollToSearch(false); // Reset scroll trigger

    try {
      // Prepare the payload with conversation context
      const payload = {
        initial_query: message,
        follow_up_answers: [],
        user_profile: session?.user?.preferences || {},
        conversation_history: conversationHistory
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
      
      // Add AI response to conversation
      setConversationHistory(prev => [...prev, {
        type: 'assistant',
        content: data.search_summary
      }]);

      // Add new results to search history
      setSearchHistory(prev => [...prev, {
        query: message,
        results: data.recommendations,
        summary: data.search_summary
      }]);

      // Update current recommendations
      setRecommendations(data.recommendations);
      setSearchSummary(data.search_summary);
      
      // Trigger scroll after results are updated
      setShouldScrollToSearch(true);
      
    } catch (err) {
      setError(err.message);
      console.error('Error in conversation:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <NavigationBar />
      
      <main className="flex-1 relative">
        <div className="flex flex-col lg:flex-row h-full">
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
                <div className="w-full max-w-2xl px-4 sm:px-6 py-8 flex flex-col items-center justify-center relative">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                  </div>

                  {/* Floating icons */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 animate-float">
                      <GraduationCap className="w-8 h-8 text-gray-400 opacity-50" />
                    </div>
                    <div className="absolute top-40 right-20 animate-float animation-delay-1000">
                      <Compass className="w-8 h-8 text-gray-400 opacity-50" />
                    </div>
                    <div className="absolute bottom-20 left-20 animate-float animation-delay-2000">
                      <Laptop className="w-8 h-8 text-gray-400 opacity-50" />
                    </div>
                    <div className="absolute bottom-40 right-10 animate-float animation-delay-3000">
                      <Bot className="w-8 h-8 text-gray-400 opacity-50" />
                    </div>
                  </div>

                  <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-black dark:text-white mb-8 pb-2 leading-tight animate-fade-in">
                    Find Your Perfect <span className="text-[#446cec]">College</span> Match
                  </h1>
                  <form onSubmit={handleInitialSearch} className="w-full animate-fade-in-up">
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="What type of colleges are you looking for?" 
                        className="w-full py-4 sm:py-6 px-4 sm:px-7 text-base sm:text-lg rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                        value={initialQuery}
                        onChange={(e) => setInitialQuery(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-2 sm:p-2.5 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-gray-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Follow-up Questions State */}
            {!isLoading && !error && currentStep === "followup" && followUpQuestions.length > 0 && (
              <div className="flex items-center justify-center min-h-[70vh] h-full pb-10 sm:pb-20">
                <div className="w-full max-w-3xl px-4 sm:px-6 py-8">
                  <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    {/* Progress Section */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {followUpQuestions[currentQuestionIndex]?.text || "Additional Information"}
                        </h2>
                        <span className="text-sm font-medium text-gray-900">
                          {currentQuestionIndex + 1}/{followUpQuestions.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-900 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / followUpQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Answer Section */}
                    <div className="space-y-6">
                      <div className="relative">
                        <textarea 
                          placeholder="Type your answer here..."
                          className="w-full py-4 px-6 text-base rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all min-h-[180px] shadow-sm resize-none"
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
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleFollowUpAnswer}
                          className="px-8 py-3 text-base font-medium text-white bg-gray-900 rounded-xl shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-300 flex items-center gap-2"
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
                  <div className="mb-8">
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
                <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                    {/* First slot: Target or Reach or Safety */}
                    <div className="h-full flex flex-col">
                      <div className="flex-1 shadow-md rounded-xl overflow-hidden">
                        <CollegeCard 
                          college={getTargetSchools()?.[0] || getReachSchools()?.[0] || getSafetySchools()?.[0]} 
                          type={getTargetSchools()?.[0] ? "target" : (getReachSchools()?.[0] ? "reach" : "safety")}
                        />
                      </div>
                    </div>
                    
                    {/* Second slot: Reach or Safety or Target */}
                    <div className="h-full flex flex-col">
                      <div className="flex-1 shadow-md rounded-xl overflow-hidden">
                        <CollegeCard 
                          college={getReachSchools()?.[0] || getSafetySchools()?.[0] || getTargetSchools()?.[0]} 
                          type={getReachSchools()?.[0] ? "reach" : (getSafetySchools()?.[0] ? "safety" : "target")}
                        />
                      </div>
                    </div>
                    
                    {/* Third slot: Safety or Target or Reach */}
                    <div className="h-full flex flex-col">
                      <div className="flex-1 shadow-md rounded-xl overflow-hidden">
                        <CollegeCard 
                          college={getSafetySchools()?.[0] || getTargetSchools()?.[0] || getReachSchools()?.[0]} 
                          type={getSafetySchools()?.[0] ? "safety" : (getTargetSchools()?.[0] ? "target" : "reach")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                <ConversationThread 
                  messages={conversationHistory}
                  onSendMessage={handleConversationMessage}
                  isTyping={isAiTyping}
                  shouldScrollToSearch={shouldScrollToSearch}
                />
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