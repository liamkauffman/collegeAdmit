"use client";

import { useState, useEffect } from "react";
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
import { resetUsedImages } from "@/utils/college-images";
import { SearchHistoryButton } from "@/components/search-history-button";
import { ExampleQuestions } from "@/components/example-questions";
import { useRouter, useSearchParams } from "next/navigation";
import { useStatePersistence } from "@/hooks/useStatePersistence";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State variables
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
  const [responseMode, setResponseMode] = useState("new_search");
  const [stateLoaded, setStateLoaded] = useState(false);
  
  // Use the state persistence hook for handling back navigation
  useStatePersistence(() => {
    // This will be called when returning from a college detail page
    console.log("State persistence hook detected return navigation");
    // Load the saved state
    const savedState = localStorage.getItem('lastSearchState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        console.log('Restoring state from persistence hook:', state);
        
        setInitialQuery(state.initialQuery || "");
        setCurrentStep(state.currentStep || "initial");
        setFollowUpQuestions(state.followUpQuestions || []);
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setFollowUpAnswers(state.followUpAnswers || []);
        setRecommendations(state.recommendations || null);
        setSearchSummary(state.searchSummary || "");
        setConversationHistory(state.conversationHistory || []);
        setResponseMode(state.responseMode || "new_search");
        setStateLoaded(true);
      } catch (err) {
        console.error('Error restoring state from persistence hook:', err);
      }
    }
  });
  
  // Load saved state from localStorage on initial mount
  useEffect(() => {
    const loadSavedState = () => {
      // Prevent infinite restoration
      if (stateLoaded) {
        return;
      }
      
      try {
        // Check if we have a search ID in the URL
        const searchId = searchParams?.get('sid');
        
        // If we're on the homepage with no search ID, reset the search state
        if (window.location.pathname === '/' && !searchId) {
          console.log('On homepage with no search ID, resetting search state');
          resetSearch();
          setStateLoaded(true);
          return;
        }
        
        if (searchId) {
          // Load specific search by ID
          const savedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
          const savedSearch = savedSearches.find(s => s.id === searchId);
          
          if (savedSearch) {
            console.log('Restoring specific search from localStorage:', savedSearch);
            restoreSearch(savedSearch);
            return;
          }
        }
        
        // If we have a previousUrl indicating we're returning from a college page,
        // the useStatePersistence hook will handle restoration
        const hasPreviousUrl = localStorage.getItem('previousUrl');
        if (hasPreviousUrl) {
          console.log("Skipping normal state restoration, letting useStatePersistence handle it");
          return;
        }
        
        // Otherwise try to load most recent state
        const savedState = localStorage.getItem('lastSearchState');
        if (savedState) {
          const state = JSON.parse(savedState);
          console.log('Restoring last state from localStorage:', state);
          
          setInitialQuery(state.initialQuery || "");
          setCurrentStep(state.currentStep || "initial");
          setFollowUpQuestions(state.followUpQuestions || []);
          setCurrentQuestionIndex(state.currentQuestionIndex || 0);
          setFollowUpAnswers(state.followUpAnswers || []);
          setRecommendations(state.recommendations || null);
          setSearchSummary(state.searchSummary || "");
          setConversationHistory(state.conversationHistory || []);
          setResponseMode(state.responseMode || "new_search");
        }
      } catch (err) {
        console.error('Error loading saved state:', err);
        // If there's an error, just start fresh
        resetSearch(false);
      } finally {
        setStateLoaded(true);
      }
    };
    
    // Only attempt to load state on first render
    if (!stateLoaded) {
      loadSavedState();
    }
    
    // Set up listener for back/forward navigation
    const handlePopState = (event) => {
      console.log('Navigation event detected:', event);
      // Only attempt to reload state if URL changes
      const currentSid = new URL(window.location.href).searchParams.get('sid');
      const urlChanged = searchParams?.get('sid') !== currentSid;
      
      if (urlChanged) {
        // If we're back at the homepage with no search ID, reset completely
        if (window.location.pathname === '/' && !currentSid) {
          console.log('Navigation back to homepage with no search ID, resetting search');
          resetSearch();
          return;
        }
        
        setStateLoaded(false); // Reset state loaded flag so we can load again
        loadSavedState();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchParams, stateLoaded]);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save state if it's been loaded first (prevents overwriting with empty state)
    if (!stateLoaded) return;
    
    // Store a value to indicate we need to save state
    const saveTimeout = setTimeout(() => {
      const stateToSave = {
        initialQuery,
        currentStep,
        followUpQuestions,
        currentQuestionIndex,
        followUpAnswers,
        recommendations,
        searchSummary,
        conversationHistory,
        responseMode
      };
      
      localStorage.setItem('lastSearchState', JSON.stringify(stateToSave));
      
      // Update URL with unique search ID for direct sharing/navigation
      if (currentStep === "results" && recommendations) {
        // Create a unique ID for this search if we don't already have one
        const searchId = generateSearchId(initialQuery);
        
        // Store this search in the history with its ID
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        
        // Check if this search already exists
        const existingIndex = recentSearches.findIndex(s => s.id === searchId);
        
        const searchToSave = {
          id: searchId,
          initialQuery,
          followUpQuestions,
          followUpAnswers,
          recommendations,
          searchSummary,
          conversationHistory,
          timestamp: Date.now()
        };
        
        if (existingIndex >= 0) {
          // Update existing search
          recentSearches[existingIndex] = searchToSave;
        } else {
          // Add new search, limit to 20 recent searches
          recentSearches.unshift(searchToSave);
          if (recentSearches.length > 20) {
            recentSearches.pop();
          }
        }
        
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        
        // Update URL without causing navigation
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          // Only update URL if needed
          if (url.searchParams.get('sid') !== searchId) {
            url.searchParams.set('sid', searchId);
            window.history.replaceState({}, '', url);
          }
        }
      }
    }, 500); // Debounce to prevent excessive updates
    
    // Cleanup the timeout
    return () => clearTimeout(saveTimeout);
  }, [initialQuery, currentStep, followUpQuestions, currentQuestionIndex, followUpAnswers, recommendations, searchSummary, conversationHistory, responseMode, stateLoaded]);

  // Generate a consistent ID based on query
  const generateSearchId = (query) => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Combine with timestamp for uniqueness
    return `${Math.abs(hash)}-${Date.now().toString(36)}`;
  };
  
  // Restore a specific search state
  const restoreSearch = (savedSearch) => {
    // Batch all state updates together to prevent multiple renders
    const updates = () => {
      setInitialQuery(savedSearch.initialQuery || "");
      setFollowUpQuestions(savedSearch.followUpQuestions || []);
      setFollowUpAnswers(savedSearch.followUpAnswers || []);
      setRecommendations(savedSearch.recommendations || null);
      setSearchSummary(savedSearch.searchSummary || "");
      setConversationHistory(savedSearch.conversationHistory || []);
      setCurrentStep(savedSearch.recommendations ? "results" : "followup");
      setResponseMode("new_search");
      // Set this last to avoid triggering re-renders with intermediate state
      setStateLoaded(true);
    };
    
    // Batch updates in next tick to avoid potential React batching issues
    setTimeout(updates, 0);
  };
  
  useEffect(() => {
    // Add or remove scrolling ability based on current step
    console.log('Updating scroll behavior for step:', currentStep);
    
    if (currentStep === "initial") {
      console.log('Setting overflow hidden for initial step');
      document.body.style.overflow = 'hidden';
    } else {
      console.log('Setting overflow auto for non-initial step');
      document.body.style.overflow = 'auto';
      // Add hide-scrollbar class to body when in results mode
      if (currentStep === "results") {
        console.log('Adding hide-scrollbar class for results step');
        document.body.classList.add('hide-scrollbar');
      }
    }
    
    // Cleanup function
    return () => {
      console.log('Cleanup: Resetting scroll behavior');
      document.body.style.overflow = 'auto';
      document.body.classList.remove('hide-scrollbar');
    };
  }, [currentStep]);
  
  // Function to fetch a single follow-up question
  const fetchSingleFollowUpQuestion = async () => {
    try {
      setIsAiTyping(true); // Use AI typing indicator instead of full-screen loading for follow-up questions
      setError(null);
      
      console.log("Fetching a single follow-up question");
      console.log("User session status:", status);
      
      // Build conversation history for the request
      // Use the existing conversationHistory if available, otherwise create a new one
      let history = [...conversationHistory];
      
      // If conversation history is empty, initialize it with the initial query
      if (history.length === 0 && initialQuery) {
        history.push({
          type: "user",
          content: initialQuery
        });
      }
      
      // If we have follow-up answers, make sure they're reflected in the conversation history
      // This ensures we're not missing any recent Q&A interactions
      if (followUpAnswers.length > 0) {
        // Check if we need to add the latest question and answer
        const latestAnswerIndex = followUpAnswers.length - 1;
        const shouldAddLatestInteraction = 
          history.findIndex(msg => 
            msg.type === "assistant" && 
            msg.content === followUpQuestions[latestAnswerIndex].text
          ) === -1;
          
        if (shouldAddLatestInteraction) {
          // Add the question
          history.push({
            type: "assistant",
            content: followUpQuestions[latestAnswerIndex].text
          });
          
          // Add the answer
          history.push({
            type: "user",
            content: followUpAnswers[latestAnswerIndex].answer
          });
        }
      }
      
      // Make sure the conversation history is updated in the state
      setConversationHistory(history);
      
      const payload = {
        initial_query: initialQuery,
        user_profile: session?.user?.preferences || {},
        conversation_history: history
      };
      
      console.log("Sending payload to follow-up question API:", payload);
      
      const response = await fetch('/api/colleges/follow-up-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log("Follow-up question API response status:", response.status);
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        console.log("Response content type:", contentType);
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Error data from API:", errorData);
          throw new Error(errorData.error || 'Failed to fetch follow-up question');
        } else {
          // Handle non-JSON response
          const text = await response.text();
          console.error("Non-JSON error response:", text.substring(0, 500) + (text.length > 500 ? "..." : ""));
          throw new Error(`Server returned non-JSON response with status ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log("Received follow-up question:", data);
      
      // Check if we received a valid question
      if (!data || !data.text) {
        throw new Error('Invalid response format: follow-up question should have text property');
      }
      
      // Add the new question to the list
      const questionData = {
        question_id: data.question_id || `q_${followUpQuestions.length + 1}`,
        text: data.text
      };
      
      // Update questions and set proper index for the new question
      setFollowUpQuestions(prev => {
        const newQuestions = [...prev, questionData];
        // Set currentQuestionIndex to point to the newly added question
        setCurrentQuestionIndex(newQuestions.length - 1);
        return newQuestions;
      });
      
      // Add the AI question to the conversation history
      setConversationHistory(prev => [...prev, {
        type: "assistant",
        content: data.text
      }]);
      
      setCurrentStep("followup");
    } catch (err) {
      setError(err.message);
      console.error('Error fetching follow-up question:', err);
    } finally {
      setIsAiTyping(false); // Turn off typing indicator when done
    }
  };

  // Function to fetch follow-up questions
  const fetchFollowUpQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentStep("initial"); // Set to initial for correct loading animation type
      
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
    
    // Reset state for a new search
    setFollowUpQuestions([]);
    setFollowUpAnswers([]);
    setCurrentQuestionIndex(0);
    setIsLoading(true); // Use full-screen loading for initial search
    
    // Initialize conversation history with the initial query
    setConversationHistory([{
      type: "user",
      content: initialQuery
    }]);
    
    // Check if user is authenticated
    if (status === "authenticated") {
      fetchSingleFollowUpQuestion().finally(() => {
        setIsLoading(false); // Turn off full loading after the first question is fetched
      });
    } else {
      // Save the query and show the auth modal
      setSavedQuery(initialQuery);
      setShowAuthModal(true);
      setIsLoading(false);
    }
  };

  // Function to handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    // If user is now authenticated and we have a saved query, continue with search
    if (status === "authenticated" && savedQuery) {
      setInitialQuery(savedQuery);
      setIsLoading(true); // Show full-screen loading during initial search
      
      // Initialize conversation history with the saved query
      setConversationHistory([{
        type: "user",
        content: savedQuery
      }]);
      
      setSavedQuery("");
      // Reset existing questions and answers for new search
      setFollowUpQuestions([]);
      setFollowUpAnswers([]);
      setCurrentQuestionIndex(0);
      
      // Begin fetching the follow-up question
      fetchSingleFollowUpQuestion().finally(() => {
        setIsLoading(false); // Hide full-screen loading after initial question is fetched
      });
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
    
    // Add the user's answer to the conversation history
    setConversationHistory(prev => [...prev, {
      type: "user",
      content: currentAnswer
    }]);
    
    setCurrentAnswer("");
    
    // Once we have 3 questions answered, get recommendations
    if (newAnswers.length >= 3) {
      getCollegeRecommendations(newAnswers);
    } else {
      // Otherwise, fetch the next question
      fetchSingleFollowUpQuestion();
    }
  };

  // Function to get college recommendations
  const getCollegeRecommendations = async (answers) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reset used images before starting the recommendations request
      resetUsedImages();
      
      // Reset conversation history since this is a new search
      setConversationHistory([]);
      
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
      
      // Save this search if the user is authenticated
      if (status === 'authenticated') {
        saveSearch(
          initialQuery,
          answers,
          data.recommendations,
          data.search_summary
        );
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching college recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the search flow
  const resetSearch = (persistReset = true) => {
    setInitialQuery("");
    setFollowUpQuestions([]);
    setCurrentQuestionIndex(0);
    setFollowUpAnswers([]);
    setCurrentAnswer("");
    setRecommendations(null);
    setSearchSummary("");
    setCurrentStep("initial");
    setError(null);
    setConversationHistory([]); // Clear conversation history for new search
    setResponseMode("new_search"); // Reset response mode
    resetUsedImages(); // Reset college images
    
    // Also clear from localStorage if persistReset is true
    if (persistReset) {
      localStorage.removeItem('lastSearchState');
      // Update URL to remove search ID
      const url = new URL(window.location);
      url.searchParams.delete('sid');
      window.history.replaceState({}, '', url);
    }
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
    // Determine if this is likely a new search/query rather than a follow-up question
    const isNewSearchQuery = (msg) => {
      const newSearchPatterns = [
        /show me colleges/i,
        /find colleges/i,
        /search for/i,
        /looking for/i,
        /colleges with/i,
        /universities in/i,
        /schools that/i,
        /best colleges for/i,
        /top universities/i
      ];
      
      return newSearchPatterns.some(pattern => pattern.test(msg));
    };
    
    // Check if this appears to be a new search query
    const isNewSearch = isNewSearchQuery(message);
    
    // If this is a new search, reset the image cache
    if (isNewSearch) {
      resetUsedImages();
    }
    
    // If this is a new search, reset the conversation history
    const chatHistory = isNewSearch ? [] : conversationHistory;
    
    // Add user message to conversation (either the fresh history or existing one)
    const newMessage = { type: 'user', content: message };
    const updatedHistory = [...chatHistory, newMessage];
    
    // Update the UI with the user message
    setConversationHistory(updatedHistory);
    setIsAiTyping(true);
    setShouldScrollToSearch(false); // Reset scroll trigger

    try {
      // Get the displayed colleges only - these are the ones visible to the user
      const displayedColleges = [];
      
      // If we have recommendations
      if (recommendations && !isNewSearch) {
        // Add the best fit college if it exists
        const bestFit = recommendations.find(college => college.category === "best_fit");
        if (bestFit) {
          displayedColleges.push(bestFit);
        }
        
        // Add up to 4 more colleges that aren't best fit
        const otherColleges = recommendations
          .filter(college => college.category !== "best_fit")
          .slice(0, 4);
        
        displayedColleges.push(...otherColleges);
      }
      
      // Prepare the payload with conversation context and ONLY displayed recommendations
      const payload = {
        initial_query: message,
        follow_up_answers: [],
        user_profile: session?.user?.preferences || {},
        conversation_history: isNewSearch ? [newMessage] : updatedHistory,
        current_recommendations: isNewSearch ? [] : displayedColleges
      };
      
      // Use the new refinements endpoint instead of recommendations
      const response = await fetch('/api/colleges/refinements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = 'Failed to fetch refined college recommendations';
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // Handle non-JSON error response
          const text = await response.text();
          errorMessage = `Server error: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Clean up search summary for better readability and remove markdown formatting
      if (data.search_summary) {
        // Remove any markdown formatting and clean up the text
        let cleanSummary = data.search_summary;
        
        // Remove all markdown bold markers
        cleanSummary = cleanSummary.replace(/\*\*/g, '');
        
        // Replace bullet points with proper formatting
        cleanSummary = cleanSummary.replace(/^\s*\*\s+/gm, '• ');
        
        // Replace markdown italics
        cleanSummary = cleanSummary.replace(/\*([^*]+)\*/g, '$1');
        
        // Add proper spacing after periods that are followed by a new line
        cleanSummary = cleanSummary.replace(/\.\n/g, '. \n');
        
        // Replace multiple newlines with double newlines for paragraph separation
        cleanSummary = cleanSummary.replace(/\n{3,}/g, '\n\n');
        
        // Cleanup any remaining formatting issues
        cleanSummary = cleanSummary.replace(/\_\_/g, '');
        
        data.search_summary = cleanSummary;
      }
      
      // Determine response type based on the content and behavior
      let inferredResponseType = "general_question";
      
      // Check if we're getting specific information about a college
      if (data.search_summary.includes("Details for") || 
          data.search_summary.includes("Details about") ||
          data.search_summary.toLowerCase().includes("information about")) {
        inferredResponseType = "specific_info";
      } 
      // Check if response contains new recommendations
      else if (data.recommendations && data.recommendations.length > 0) {
        inferredResponseType = "new_search";
        
        // If this is a new search and we have recommendations, update the main displayed recommendations
        if (isNewSearch) {
          // Reset used images before setting new recommendations
          resetUsedImages();
          setRecommendations(data.recommendations);
        }
      }
      
      // Update response mode for the conversation UI
      setResponseMode(inferredResponseType);
      
      // Add AI response to conversation
      const aiResponse = {
        type: 'assistant',
        content: data.search_summary,
        responseType: inferredResponseType,
        // Always include any new recommendations in the conversation message
        includedRecommendations: data.recommendations || []
      };
      
      setConversationHistory([...updatedHistory, aiResponse]);

      // Add new results to search history
      setSearchHistory(prev => [...prev, {
        query: message,
        results: data.recommendations,
        summary: data.search_summary,
        responseType: inferredResponseType,
        isNewSearch: isNewSearch
      }]);

      // Only update search summary
      setSearchSummary(data.search_summary);
      
      // Trigger scroll after results are updated
      setShouldScrollToSearch(true);
      
      // If this is a new search and we have recommendations, save it
      if (isNewSearch && data.recommendations && data.recommendations.length > 0 && status === 'authenticated') {
        saveSearch(
          message,
          [], // No follow-up answers for direct conversation searches
          data.recommendations,
          data.search_summary
        );
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error in conversation:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Function to test the refinements endpoint with mock data
  const testRefinementsEndpointWithMock = async (responseType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create mock queries based on the response type
      let mockQuery = "";
      switch (responseType) {
        case "new_search":
          mockQuery = "Show me colleges in California with computer science programs";
          break;
        case "specific_info":
          mockQuery = "Tell me more about Stanford University";
          break;
        case "general_question":
          mockQuery = "What is the highest paying job out of college?";
          break;
        default:
          mockQuery = "Test mock query";
      }
      
      // Add user message to conversation
      const newMessage = { type: 'user', content: mockQuery };
      setConversationHistory([newMessage]);
      
      // Get the displayed colleges only - if using existing recommendations
      const displayedColleges = [];
      
      // If we have existing recommendations and it's not a new search
      if (recommendations && responseType !== "new_search") {
        // Add the best fit college if it exists
        const bestFit = recommendations.find(college => college.category === "best_fit");
        if (bestFit) {
          displayedColleges.push(bestFit);
        }
        
        // Add up to 4 more colleges that aren't best fit
        const otherColleges = recommendations
          .filter(college => college.category !== "best_fit")
          .slice(0, 4);
        
        displayedColleges.push(...otherColleges);
      }
      
      // Prepare the payload for the backend request (without response_type to hit the real backend)
      const payload = {
        initial_query: mockQuery,
        follow_up_answers: [],
        user_profile: session?.user?.preferences || {},
        conversation_history: [newMessage],
        current_recommendations: responseType === "new_search" ? [] : displayedColleges
        // Removed response_type parameter to hit the actual backend
      };
      
      const response = await fetch('/api/colleges/refinements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = 'Failed to test refinements endpoint';
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // Handle non-JSON error response
          const text = await response.text();
          errorMessage = `Server error: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Clean up search summary if needed to remove any markdown formatting
      if (data.search_summary) {
        // Remove any markdown-style bold markers
        data.search_summary = data.search_summary.replace(/\*\*/g, '');
      }
      
      // Handle the response structure from the FastAPI backend
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format: recommendations should be an array');
      }
      
      // Add AI response to conversation
      setConversationHistory(prev => [...prev, {
        type: 'assistant',
        content: data.search_summary,
        responseType: responseType // We still set this for UI purposes
      }]);
      
      // Reset used images before setting new recommendations
      resetUsedImages();
      
      // Update all necessary state
      setRecommendations(data.recommendations);
      setSearchSummary(data.search_summary || "Based on your search criteria, we've found the following recommendations.");
      setCurrentStep("results");
      setResponseMode(responseType);
      
      // Add to search history
      setSearchHistory([{
        query: mockQuery,
        results: data.recommendations,
        summary: data.search_summary,
        responseType: responseType
      }]);
      
    } catch (err) {
      setError(err.message);
      console.error('Error testing refinements endpoint:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save a search
  const saveSearch = async (query, answers, recommendationData, summary) => {
    if (!session || status !== 'authenticated') return;
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialQuery: query,
          followUpQandA: answers,
          recommendations: recommendationData,
          searchSummary: summary
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save search');
      }
    } catch (err) {
      console.error('Error saving search:', err);
    }
  };

  // Function to handle selecting a saved search
  const handleSelectSavedSearch = (search) => {
    if (!search) return;
    
    // Reset the state for a new search
    resetSearch();
    
    // Set the initial query
    setInitialQuery(search.initialQuery);
    
    // If we have recommendations, display them directly
    if (search.recommendations && search.recommendations.length > 0) {
      // Ensure images are properly reset before loading new ones
      resetUsedImages();
      
      // Set recommendations with a slight delay to ensure DOM is ready
      setTimeout(() => {
        setRecommendations(search.recommendations);
        setSearchSummary(search.searchSummary || "Based on your saved search, here are your recommendations.");
        setCurrentStep("results");
      }, 10);
      
      // Initialize conversation history with the initial query and response
      setConversationHistory([
        {
          type: "user",
          content: search.initialQuery
        },
        {
          type: "assistant",
          content: search.searchSummary || "Here are your college recommendations.",
          responseType: "new_search",
          includedRecommendations: search.recommendations
        }
      ]);
    } else {
      // If no recommendations, start a new search with the query
      handleInitialSearch({ preventDefault: () => {} });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-gray-950 ${
      currentStep === "initial" ? "overflow-hidden" : ""
    }`}>
    <NavigationBar />
      
      <main className={`flex-1 relative ${
        currentStep === "initial" ? "overflow-hidden" : ""
      }`}>
      <div className="flex flex-col lg:flex-row h-full">
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Loading State - Only for initial search or college recommendations, not for follow-up questions */}
            {isLoading && (
              <div className="flex items-center justify-center min-h-[90vh] h-full pb-10 sm:pb-20">
                <div className="py-10">
                  <LoadingAnimation type={currentStep === "initial" ? "followup" : "colleges"} />
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
              <div className="flex items-center justify-center min-h-[90vh] h-full pb-10 sm:pb-20 relative">
                {/* Search History in top left - fixed position with high z-index */}
                <SearchHistoryButton onSelectSearch={handleSelectSavedSearch} />
                
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
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-2 sm:p-2.5 rounded-lg transition-all duration-300 hover:opacity-100 hover:bg-gray-800"
                        aria-label="Start search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Example Questions */}
                    <ExampleQuestions 
                      onSelectQuestion={(question) => setInitialQuery(question)} 
                      userSession={session}
                    />
                  </form>
                </div>
              </div>
            )}

            {/* Follow-up Questions State */}
            {!isLoading && !error && currentStep === "followup" && followUpQuestions.length > 0 && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] h-full pb-10 sm:pb-20 relative overflow-auto">
                {/* Search History in top left */}
                <SearchHistoryButton onSelectSearch={handleSelectSavedSearch} />
                
                <div className="w-full max-w-3xl px-4 sm:px-6 py-8">
                  {/* Show conversation history */}
                  <div className="mb-8 flex flex-col space-y-4">
                    <div className="flex justify-end">
                      <div className="max-w-[90%] p-4 rounded-2xl bg-blue-600 text-white rounded-tr-none shadow-md">
                        <p className="whitespace-pre-line">{initialQuery}</p>
                      </div>
                    </div>
                    
                    {/* Previous Q&A pairs */}
                    {followUpAnswers.map((answer, index) => (
                      <div key={index} className="flex flex-col space-y-4">
                        <div className="flex justify-start">
                          <div className="max-w-[90%] p-4 rounded-2xl bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-100">
                            <p className="text-gray-800 font-medium">{followUpQuestions[index].text}</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="max-w-[90%] p-4 rounded-2xl bg-blue-600 text-white rounded-tr-none shadow-md">
                            <p className="whitespace-pre-line">{answer.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Current question - only show if we have a question at currentQuestionIndex and not typing */}
                    {followUpQuestions[currentQuestionIndex] && !isAiTyping && followUpQuestions.length > followUpAnswers.length && (
                      <div className="flex justify-start">
                        <div className="max-w-[90%] p-4 rounded-2xl bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-100">
                          <p className="text-gray-800 font-medium">{followUpQuestions[currentQuestionIndex].text}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* AI typing indicator for follow-up questions */}
                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[90%] p-4 rounded-2xl bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* Progress Section */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm text-gray-600">
                          Question {followUpAnswers.length + 1} of 3
                        </h2>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#4068ec] rounded-full transition-all duration-300"
                          style={{ width: `${((followUpAnswers.length + 1) / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Answer Section */}
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea 
                          placeholder="Type your answer here..."
                          className="w-full py-4 px-5 text-base rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4068ec] focus:border-transparent transition-all min-h-[120px] shadow-sm resize-none"
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleFollowUpAnswer();
                            }
                          }}
                          disabled={isAiTyping}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleFollowUpAnswer}
                          className="px-6 py-2.5 text-base font-medium text-white bg-[#4068ec] rounded-xl shadow-sm hover:bg-[#3255d0] focus:outline-none focus:ring-2 focus:ring-[#4068ec] focus:ring-offset-2 transition-all duration-300 flex items-center gap-2"
                          disabled={isAiTyping || !currentAnswer.trim()}
                        >
                          {followUpAnswers.length === 2 ? (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Find Colleges
                            </>
                          ) : (
                            <>
                              Next
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
              <div className="pb-10 sm:pb-20 relative">
                {/* Search History in fixed position for consistency */}
                <SearchHistoryButton onSelectSearch={handleSelectSavedSearch} />
                
                {/* Best Fit College - Centered */}
                {getBestFit() && (
                  <div className="mb-8">
                    <div className="flex justify-center">
                      <div className="w-full max-w-3xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
                        <div className="shadow-lg rounded-xl overflow-hidden">
                          <CollegeCard college={getBestFit()} type="bestFit" preserveState={true} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* College Categories in a row */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Display all recommended colleges except the best fit */}
                    {recommendations && recommendations
                      .filter(college => college.category !== "best_fit")
                      .slice(0, 4)
                      .map((college, index) => (
                        <div key={college.id} className="h-full flex flex-col">
                          <div className="flex-1 shadow-md rounded-xl overflow-hidden">
                            <CollegeCard 
                              college={college} 
                              type={college.category}
                              preserveState={true}
                            />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6">

                  <ConversationThread 
                    messages={conversationHistory}
                    onSendMessage={handleConversationMessage}
                    isTyping={isAiTyping}
                    shouldScrollToSearch={shouldScrollToSearch}
                    responseType={isAiTyping ? "loading" : responseMode}
                    lastResponseSummary={searchSummary}
                  />
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