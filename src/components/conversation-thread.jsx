import React, { useRef, useEffect, useState } from 'react';
import { Bot, User, Search, ArrowRight, Info, RefreshCw, School, GraduationCap } from 'lucide-react';
import { CollegeCard } from "@/components/college-card";

export function ConversationMessage({ message, type, responseType, includedRecommendations = [] }) {
  return (
    <div className={`flex flex-col ${type === 'user' ? 'justify-end items-end' : 'justify-start items-start'}`}>
      <div className={`max-w-[90%] p-4 rounded-2xl ${
        type === 'user' 
          ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
          : 'bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-100'
      }`}>
        <p className="whitespace-pre-line">{message}</p>
      </div>
      
      {/* Display college recommendations if they exist in this message */}
      {type === 'assistant' && includedRecommendations && includedRecommendations.length > 0 && (
        <div className="mt-4 w-full">
          <div className="grid grid-cols-1 gap-4">
            {includedRecommendations.map((college) => (
              <div key={college.id} className="transform hover:scale-[1.01] transition-all duration-300">
                <div className="shadow-md rounded-xl overflow-hidden">
                  <CollegeCard 
                    college={college} 
                    type={college.category}
                    preserveState={true}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ConversationThread({ 
  messages, 
  onSendMessage, 
  isTyping = false,
  placeholder = "Refine your search or ask about specific colleges...",
  shouldScrollToSearch = false,
  responseType = "complete",
  lastResponseSummary = ""
}) {
  const [input, setInput] = useState('');
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const searchSectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate the new height
      textareaRef.current.style.height = 'auto';
      // Set the new height based on the scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Extract college names from the last response to generate suggestions
  useEffect(() => {
    if (lastResponseSummary) {
      // Extract college names using regex pattern matching
      const collegePattern = /([A-Z][A-Za-z\s]+(?:University|College|Institute|School|Academy))/g;
      const matches = lastResponseSummary.match(collegePattern) || [];
      
      // Deduplicate and limit to 3 colleges
      const uniqueColleges = [...new Set(matches)].slice(0, 3);
      
      // Create suggested queries based on the identified colleges
      const queries = uniqueColleges.map(name => `Tell me more about ${name}`);
      
      // Add some default suggestions if we don't have enough college-specific ones
      const defaultSuggestions = [
        "Show me colleges with lower tuition",
        "Find schools with better acceptance rates", 
        "What are similar colleges to these?",
        "Compare these colleges",
        "Show me more safety schools"
      ];
      
      // Fill in with default suggestions to have at least 3
      while (queries.length < 3) {
        const randomIndex = Math.floor(Math.random() * defaultSuggestions.length);
        const suggestion = defaultSuggestions.splice(randomIndex, 1)[0];
        if (suggestion) {
          queries.push(suggestion);
        }
      }
      
      setSuggestedQueries(queries);
    }
  }, [lastResponseSummary]);

  // Auto-scroll to the end of messages when messages change or isTyping changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (shouldScrollToSearch && searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [shouldScrollToSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  // Handle enter key to submit, but allow shift+enter for new lines
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Determine the divider text based on the last response
  const getDividerText = () => {
    if (responseType === "specific_info") {
      return "Ask for more details";
    } else if (responseType === "new_search") {
      return "Refine your search";
    } else {
      return "Continue the conversation";
    }
  };

  // Get appropriate icon for divider based on content
  const getDividerIcon = () => {
    if (responseType === "specific_info") {
      return <Info className="mr-2 w-4 h-4" />;
    } else if (responseType === "new_search") {
      return <RefreshCw className="mr-2 w-4 h-4" />;
    } else {
      return <GraduationCap className="mr-2 w-4 h-4" />;
    }
  };

  // Get dynamic placeholder text based on response context
  const getPlaceholderText = () => {
    if (isTyping) {
      return "Waiting for response...";
    } else if (responseType === "specific_info") {
      // Extract college name from summary if possible
      const collegeMatch = /Details (for|about) ([A-Za-z\s]+)/i.exec(lastResponseSummary);
      const collegeName = collegeMatch ? collegeMatch[2].trim() : "this college";
      return `Ask more about ${collegeName} or explore other schools...`;
    } else if (responseType === "new_search") {
      return "Refine your search or ask about specific colleges...";
    } else {
      return "Ask another question about college admissions...";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
      {/* Previous messages */}
      {messages.length > 0 && (
        <div className="space-y-5 mb-8 pr-2 pb-2">
          {messages.map((msg, idx) => (
            <div key={idx} className="animate-slide-in-bottom" style={{ 
              animationDelay: `${idx * 100}ms` 
            }}>
              <ConversationMessage 
                message={msg.content} 
                type={msg.type} 
                responseType={msg.responseType}
                includedRecommendations={msg.includedRecommendations}
              />
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[90%] p-4 rounded-2xl bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Divider with text */}
      <div className="relative mb-6" ref={searchSectionRef}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 py-1.5 bg-white text-gray-600 rounded-full border border-gray-200 shadow-sm flex items-center font-medium">
            {getDividerIcon()}
            {getDividerText()}
          </span>
        </div>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] p-1.5 border border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-start">
          <div className="absolute left-4 top-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholderText()}
            disabled={isTyping}
            rows={1}
            className={`w-full min-h-[56px] py-4 pl-12 pr-24 rounded-xl bg-transparent
              resize-none overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-[#4068ec] focus:ring-offset-0
              transition-all duration-200 text-gray-800 placeholder-gray-500
              ${isTyping ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 top-2 flex items-center gap-2 px-4 py-2 rounded-lg
              transition-all duration-200 ${
                input.trim() && !isTyping
                  ? 'bg-[#4068ec] text-white hover:bg-[#3255d0]' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <span className="text-sm font-medium">Ask</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Example queries */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {suggestedQueries.map((query, index) => (
          <button 
            key={index}
            onClick={() => {
              if (!isTyping) onSendMessage(query);
            }}
            disabled={isTyping}
            className={`text-sm px-4 py-2 rounded-full border border-gray-200 
              bg-white text-gray-700 shadow-sm
              transition-colors ${isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-300'}`}
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
} 