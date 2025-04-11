"use client";

import { CollegeCompare } from "@/components/college-compare";
import NavigationBar from "@/components/navigation-bar";

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <NavigationBar />
      
      <main className="flex-1 relative">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-full max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center text-black dark:text-white mb-8 pb-2 leading-tight">
              Compare <span className="text-[#446cec]">Colleges</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-center text-lg max-w-2xl mx-auto">
              Compare colleges to find the best fit for your academic journey. Select a college to see similar institutions.
            </p>
            
            <div className="max-w-md mx-auto">
              <CollegeCompare />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 