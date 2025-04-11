"use client";

import { CustomCollegeCompare } from "@/components/custom-college-compare";
import NavigationBar from "@/components/navigation-bar";
import { motion } from "framer-motion";

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <NavigationBar />
      
      <main className="flex-1 relative">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <motion.div 
            className="w-full max-w-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black dark:text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Smart <span className="text-[#446cec]">College Comparison</span>
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Define what matters to you, select your colleges, and get personalized AI-powered comparisons based on your priorities.
              </motion.p>
            </div>
            
            <CustomCollegeCompare />
          </motion.div>
        </div>
      </main>
    </div>
  );
} 