import React, { useState, useEffect } from 'react';
import { Book, GraduationCap, PencilRuler, Sparkles, Search, School } from 'lucide-react';

export function LoadingAnimation({ type = "colleges" }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  
  // Array of fun follow-up question loading messages
  const followupMessages = [
    "Coming up with thoughtful questions...",
    "Brewing the perfect follow-up questions...",
    "Reading your mind (just kidding)...",
    "Crafting questions just for you...",
    "Getting to know you better...",
    "Preparing your personalized college journey...",
    "Searching for your academic soulmate...",
    "Polishing our crystal ball...",
  ];
  
  // College recommendation loading messages
  const collegeMessages = [
    "Finding colleges, just for you",
    "Matching you with dream schools",
    "Scanning the academic universe",
    "Discovering your perfect campus match"
  ];
  
  // Different loading messages based on the type
  const getMessage = () => {
    const messages = type === "followup" ? followupMessages : collegeMessages;
    return messages[messageIndex % messages.length];
  };
  
  // Cycle through messages every few seconds for a more dynamic experience
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => prev + 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Cycle through icons for the animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex(prev => prev + 1);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  // Icons for the follow-up animation
  const followupIcons = [
    <PencilRuler key="pencil" className="w-8 h-8 text-[#4068ec]" />,
    <Book key="book" className="w-8 h-8 text-[#4068ec]" />,
    <GraduationCap key="grad" className="w-8 h-8 text-[#4068ec]" />,
    <Sparkles key="sparkles" className="w-8 h-8 text-[#4068ec]" />,
  ];
  
  // Icons for the colleges animation
  const collegeIcons = [
    <School key="school" className="w-8 h-8 text-[#4068ec]" />,
    <Search key="search" className="w-8 h-8 text-[#4068ec]" />,
    <GraduationCap key="grad" className="w-8 h-8 text-[#4068ec]" />,
    <Sparkles key="sparkles" className="w-8 h-8 text-[#4068ec]" />,
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[150px]">
      <div className="mt-4 text-[#000000] text-2xl mb-2 min-h-[4rem] text-center transition-opacity duration-300 flex items-center justify-center">
        {getMessage()}
      </div>
      
      {/* Animation with just the icon */}
      <div className="flex justify-center items-center h-12">
        {/* Rotating icons with enhanced animation */}
        <div className="animate-pulse animate-bounce">
          {type === "followup" 
            ? followupIcons[iconIndex % followupIcons.length]
            : collegeIcons[iconIndex % collegeIcons.length]
          }
        </div>
      </div>
    </div>
  );
} 