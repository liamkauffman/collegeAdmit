"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form"
import NavigationBar from "@/components/navigation-bar"
import { LoadingAnimation } from "@/components/loading-animation"
import { CollegeCard, CollegeCardSection } from "@/components/college-card"
import { mockColleges } from "@/lib/mock-colleges"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <NavigationBar />
      <main className="flex-1 relative">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Sidebar - Only visible on large screens by default */}
          <div className="hidden lg:block lg:w-64 xl:w-72 lg:border-r border-[#BED8D4] dark:border-gray-800 bg-white dark:bg-gray-950 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2081C3] dark:text-[#63D2FF]">Find Your College</h2>
              <div>
                <SearchForm isSidebar={true} />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {!showResults ? (
              <div className="flex items-center justify-center min-h-[90vh] h-full pb-10 sm:pb-20">
                <div className="w-full max-w-2xl px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
                  {isLoading ? (
                    <div className="py-10">
                      <LoadingAnimation />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-light text-[#2081C3] dark:text-[#63D2FF] mb-4">Hello, I'm CollegeAdmit</h2>
                      <p className="text-center text-xl sm:text-2xl text-[#2081C3]/80 dark:text-[#63D2FF]/80 mb-6 sm:mb-10">
                        I'm your college admissions assistant, ready to help you find the perfect match.
                      </p>
                      <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Tell me what you're looking for..." 
                            className="w-full py-4 sm:py-6 px-4 sm:px-7 text-base sm:text-lg rounded-xl border border-[#BED8D4]/50 dark:border-gray-700 bg-white dark:bg-gray-900 text-[#2081C3] dark:text-[#63D2FF] placeholder-[#2081C3]/60 dark:placeholder-[#63D2FF]/60 focus:outline-none focus:ring-1 focus:ring-[#63D2FF] focus:border-[#63D2FF] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button 
                            type="submit"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#2081C3]/5 dark:bg-[#63D2FF]/5 hover:bg-[#2081C3]/15 dark:hover:bg-[#63D2FF]/15 text-[#2081C3] dark:text-[#63D2FF] p-2 sm:p-2.5 rounded-lg transition-all"
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
                        <div className="w-2 h-2 rounded-full bg-[#2081C3] dark:bg-[#2081C3]/70 mx-1"></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="pb-10 sm:pb-20">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#2081C3] dark:text-[#63D2FF] mb-2">College Recommendations</h2>
                  <p className="text-[#2081C3]/70 dark:text-[#63D2FF]/70">Based on your preferences and profile</p>
                </div>
                
                {/* Best Fit College - Centered */}
                <div className="mb-8 sm:mb-16">
                  <div className="flex justify-center">
                    <div className="w-full max-w-3xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
                      <CollegeCard college={mockColleges.bestFit} type="bestFit" />
                    </div>
                  </div>
                </div>
                
                {/* College Categories in a row */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 h-full">
                    {/* Reach School - Only display the first one */}
                    {mockColleges.reach.length > 0 && (
                      <div className="h-full flex flex-col">
                        <div className="flex-1">
                          <CollegeCard college={mockColleges.reach[0]} type="reach" />
                        </div>
                      </div>
                    )}
                    
                    {/* Target School - Only display the first one */}
                    {mockColleges.target.length > 0 && (
                      <div className="h-full flex flex-col">
                        <div className="flex-1">
                          <CollegeCard college={mockColleges.target[0]} type="target" />
                        </div>
                      </div>
                    )}
                    
                    {/* Safety School - Only display the first one */}
                    {mockColleges.safety.length > 0 && (
                      <div className="h-full flex flex-col">
                        <div className="flex-1">
                          <CollegeCard college={mockColleges.safety[0]} type="safety" />
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
    </div>
  )
} 