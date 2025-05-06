"use client";

import NavigationBar from "@/components/navigation-bar";
import { CollegeTracker } from "@/components/college-tracker/college-tracker";
import { motion } from "framer-motion";

export default function CollegeListPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <NavigationBar />
      
      <main className="flex-1 relative">
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <motion.div 
            className="w-full max-w-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <motion.h1 
                className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white mb-4 leading-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                College <span className="text-[#446cec]">Application Tracker</span>
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Track and manage all your college applications in one place.
              </motion.p>
            </div>
            
            <CollegeTracker />
          </motion.div>
        </div>
      </main>
    </div>
  );
} 