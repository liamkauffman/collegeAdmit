"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollegeCompare } from '@/components/college-comparison';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, ShieldCheck } from "lucide-react";

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

  // Get the background color based on card type
  const getBgColor = () => {
    switch (type) {
      case "bestFit":
        return "bg-gradient-to-br from-[#a8edea]/40 to-[#fed6e3]/40 dark:from-[#4068ec]/20 dark:to-[#78D5D7]/20 border-[#78D5D7]/40 dark:border-[#63D2FF]/20";
      case "reach":
        return "bg-gradient-to-br from-[#fad0c4]/30 to-[#ffd1ff]/30 dark:from-[#ff9a9e]/10 dark:to-[#fad0c4]/10 border-[#fad0c4]/40 dark:border-[#fad0c4]/20";
      case "target":
        return "bg-gradient-to-br from-[#d4fc79]/30 to-[#96e6a1]/30 dark:from-[#d4fc79]/10 dark:to-[#96e6a1]/10 border-[#96e6a1]/40 dark:border-[#96e6a1]/20";
      case "safety":
        return "bg-gradient-to-br from-[#84fab0]/30 to-[#8fd3f4]/30 dark:from-[#84fab0]/10 dark:to-[#8fd3f4]/10 border-[#8fd3f4]/40 dark:border-[#8fd3f4]/20";
      default:
        return "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800";
    }
  };

  // Get the type icon
  const getIcon = () => {
    switch (type) {
      case "bestFit":
        return <Sparkles className="h-5 w-5 text-[#4068ec] dark:text-[#63D2FF]" />;
      case "reach":
        return <TrendingUp className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case "target":
        return <Target className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case "safety":
        return <ShieldCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  // Get the type label
  const getTypeLabel = () => {
    switch (type) {
      case "bestFit":
        return "Best Fit";
      case "reach":
        return "Reach";
      case "target":
        return "Target";
      case "safety":
        return "Safety";
      default:
        return "";
    }
  };

  // Handle click to navigate to college detail page
  const handleCardClick = () => {
    router.push(`/college/${college.id}`);
  };
  
  // Handle selecting a similar college
  const handleSelectSimilarCollege = (similarCollege) => {
    const collegeId = similarCollege.name.toLowerCase().split(' ')[0] || 'unknown';
    router.push(`/college/${collegeId}`);
  };

  // Handle category from backend which might use snake_case instead of camelCase
  const getCategory = () => {
    return college.category || college.category_type;
  };

  return (
    <Card 
      className={`overflow-hidden ${getBgColor()} hover:shadow-lg transition-all border cursor-pointer`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-[#4068ec] dark:text-[#63D2FF]">
              {college.name}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {college.state} • {college.type}
            </CardDescription>
          </div>
          {getTypeLabel() && (
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 px-2 py-1 ${
                type === "bestFit" 
                  ? "bg-[#4068ec]/10 text-[#4068ec] border-[#4068ec]/30 dark:bg-[#63D2FF]/10 dark:text-[#63D2FF] dark:border-[#63D2FF]/30" 
                  : type === "reach" 
                  ? "bg-red-100 text-red-500 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/30"
                  : type === "target"
                  ? "bg-green-100 text-green-500 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/30"
                  : "bg-blue-100 text-blue-500 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/30"
              }`}
            >
              {getIcon()}
              <span>{getTypeLabel()}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-sm mt-2">
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Acceptance Rate</div>
            <div className="font-medium">{formatAcceptanceRate(college.acceptance_rate)}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Estimated Cost</div>
            <div className="font-medium">{formatCost(college.cost)}</div>
          </div>
          {college.top_majors && college.top_majors.length > 0 && (
            <div className="col-span-2 md:col-span-1">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Top Majors</div>
              <div className="font-medium flex flex-wrap gap-1 mt-1">
                {college.top_majors.slice(0, 2).map((major, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-[10px] py-0 px-1.5 bg-gray-100 dark:bg-gray-800/50"
                  >
                    {major.name}
                  </Badge>
                ))}
                {college.top_majors.length > 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">+{college.top_majors.length - 2} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        {college.recruiting_info && (
          <div className="mt-4 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Recruiting Info</div>
            <div className="text-gray-700 dark:text-gray-300 text-xs">{college.recruiting_info}</div>
          </div>
        )}

        {college.ai_insight && (
          <div className="mt-4 bg-gradient-to-r from-[#4068ec]/5 to-[#78D5D7]/5 dark:from-[#4068ec]/10 dark:to-[#78D5D7]/10 p-3 rounded-md">
            <div className="flex items-center gap-1 text-[#4068ec] dark:text-[#63D2FF] text-xs font-medium mb-1">
              <Sparkles className="h-3 w-3" />
              <span>AI Insight</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{college.ai_insight}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CollegeCardSection({ title, colleges, type }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#4068ec] mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges?.map((college, index) => (
          <CollegeCard key={index} college={college} type={type} />
        ))}
      </div>
    </div>
  );
} 