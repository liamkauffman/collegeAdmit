"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollegeCompare } from '@/components/college-comparison';
import { MapPin, Sparkles } from "lucide-react";

export function CollegeCard({ college, type = "normal" }) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  if (!college) return null;

  // Helper functions
  const formatCost = (cost) => {
    if (!cost) return "N/A";
    
    // Handle different cost data structures from the backend
    const inState = cost.tuition_in_state || cost.in_state;
    const onCampusHousing = cost.on_campus_housing || 0;
    const booksAndSupplies = cost.books_and_supplies || 0;

    if (inState) {
      return `$${Math.round(inState + onCampusHousing + booksAndSupplies).toLocaleString()}`;
    }
    return "N/A";
  };

  const formatAcceptanceRate = (rate) => {
    if (rate === undefined || rate === null) return "N/A";
    return `${(rate * 100).toFixed(1)}%`;
  };

  // Determine background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'bestFit':
      case 'bestfit':
        return 'bg-gradient-to-br from-[#2081C3] to-[#63D2FF]';
      case 'reach':
        return 'bg-gradient-to-br from-[#FF6B6B] to-[#FF9E9E]';
      case 'target':
        return 'bg-gradient-to-br from-[#4CAF50] to-[#8BC34A]';
      case 'safety':
        return 'bg-gradient-to-br from-[#FFC107] to-[#FFE082]';
      default:
        return 'bg-gradient-to-br from-[#78D5D7] to-[#BED8D4]';
    }
  };

  // Determine text color based on type
  const getTextColor = () => {
    switch (type) {
      case 'bestFit':
      case 'bestfit':
      case 'reach':
        return 'text-white';
      default:
        return 'text-gray-800';
    }
  };

  // Determine badge color based on acceptance rate
  const getBadgeColor = () => {
    if (!college.acceptance_rate) return 'bg-gray-500';
    const rate = college.acceptance_rate * 100;
    if (rate < 15) return 'bg-red-500';
    if (rate < 30) return 'bg-orange-500';
    if (rate < 50) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Get designation based on acceptance rate
  const getDesignation = () => {
    if (!college.acceptance_rate) return null;
    const rate = college.acceptance_rate * 100;
    if (rate < 15) return 'Extreme Reach';
    if (rate < 30) return 'Reach';
    if (rate < 50) return 'Target';
    return 'Likely';
  };

  // Display label for college type
  const getTypeLabel = () => {
    const collegeType = type.toLowerCase();
    switch (collegeType) {
      case 'bestfit':
        return 'Best Fit';
      default:
        return collegeType.charAt(0).toUpperCase() + collegeType.slice(1);
    }
  };

  // Handle click to navigate to college detail page
  const handleCardClick = (e) => {
    // Don't navigate if clicking on compare button
    if (e.target.closest('.compare-button')) {
      e.stopPropagation();
      return;
    }
    
    // Navigate using the actual college ID
    router.push(`/college/${college.id}`);
  };
  
  // Handle selecting a similar college
  const handleSelectSimilarCollege = (similarCollege) => {
    // Use the actual college ID for navigation
    const collegeId = similarCollege.id;
    if (!collegeId) {
      console.error("Missing college ID for navigation", similarCollege);
      return;
    }
    router.push(`/college/${collegeId}`);
  };

  // Default image if none is provided
  const defaultImage = "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  return (
    <div 
      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col cursor-pointer group relative`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src={college.image || defaultImage} 
          alt={college.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className={`${getBgColor()} px-3 py-1 rounded-full text-sm font-medium ${getTextColor()}`}>
            {getTypeLabel()}
          </span>
        </div>
        <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold z-20 drop-shadow-md">
          {college.name}
        </h3>
      </div>
      
      <div className="p-4 bg-white text-gray-800 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            <span>{college.state} • {college.type}</span>
          </div>
          
          {college.top_majors && college.top_majors.length > 0 && (
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Top Majors</h4>
              <div className="flex flex-wrap gap-1">
                {college.top_majors.slice(0, 3).map((major, index) => (
                  <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs">
                    {major.name}
                  </span>
                ))}
                {college.top_majors.length > 3 && (
                  <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs">
                    +{college.top_majors.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-500">Acceptance</h4>
              <div className="flex items-center mt-1">
                <span className="font-bold">{formatAcceptanceRate(college.acceptance_rate)}</span>
                {getDesignation() && (
                  <span className={`ml-2 ${getBadgeColor()} text-white text-xs px-1.5 py-0.5 rounded`}>
                    {getDesignation()}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-500">Cost</h4>
              <p className="font-bold mt-1">{formatCost(college.cost)}</p>
            </div>
          </div>
          
          {college.ai_insight && (
            <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-md">
              <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                <span>AI Insight</span>
              </div>
              <p className="text-sm text-gray-700">{college.ai_insight}</p>
            </div>
          )}
        </div>
        
        {/* Compare button - Always visible */}
        <div className="mt-3 compare-button" onClick={(e) => e.stopPropagation()}>
          <CollegeCompare 
            college={college} 
            onSelectCollege={handleSelectSimilarCollege}
          />
        </div>
      </div>
    </div>
  );
}

export function CollegeCardSection({ title, colleges, type }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#2081C3] mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges?.map((college, index) => (
          <CollegeCard key={index} college={college} type={type} />
        ))}
      </div>
    </div>
  );
} 