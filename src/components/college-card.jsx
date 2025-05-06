"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Sparkles, Star } from "lucide-react";
import { getCollegeImage, resetUsedImages } from '@/utils/college-images';
import { useSession } from "next-auth/react";

export function CollegeCard({ college, type = "normal", onToggleFavorite, isFavorited = false, preserveState = false }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isStarred, setIsStarred] = useState(isFavorited);
  const [collegeImageUrl, setCollegeImageUrl] = useState(null);
  
  useEffect(() => {
    // Get initial image
    if (college) {
      const initialImage = getCollegeImage(college.id, college.name);
      setCollegeImageUrl(initialImage);
    }
    
    // Listen for image update events
    const handleImageLoaded = (event) => {
      if (event.detail.collegeId === String(college.id).toLowerCase()) {
        setCollegeImageUrl(event.detail.imageUrl);
        setImageError(false); // Reset error state if we got a new image
      }
    };
    
    window.addEventListener('collegeImageLoaded', handleImageLoaded);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('collegeImageLoaded', handleImageLoaded);
    };
  }, [college?.id, college?.name]);

  if (!college) return null;

  // Handle image errors or loading state
  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load image for college: ${college.name}`);
  };

  // Show a loading skeleton if the image is still loading
  const showImageLoadingSkeleton = !collegeImageUrl;

  // Helper functions
  const formatCost = (cost) => {
    if (!cost) return null;
    
    // Handle new cost data structure from the backend
    if (cost.amount) {
      return `$${Math.round(cost.amount).toLocaleString()}`;
    }
    
    // Handle legacy cost data structures as fallback
    const inState = cost.tuition_in_state || cost.in_state;
    const onCampusHousing = cost.on_campus_housing || 0;
    const booksAndSupplies = cost.books_and_supplies || 0;

    if (inState) {
      return `$${Math.round(inState + onCampusHousing + booksAndSupplies).toLocaleString()}`;
    }
    return null;
  };

  const formatAcceptanceRate = (rate) => {
    if (rate === undefined || rate === null) return "N/A";
    // Check if the rate is already in percentage format (> 1)
    const percentage = rate > 1 ? rate : rate * 100;
    return `${percentage.toFixed(1)}%`;
  };

  // Updated background color gradients for a more modern look
  const getBgColor = () => {
    switch (type) {
      case 'bestFit':
      case 'bestfit':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'reach':
        return 'bg-gradient-to-br from-rose-500 to-rose-600';
      case 'target':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      case 'safety':
        return 'bg-gradient-to-br from-amber-400 to-amber-500';
      default:
        return 'bg-gradient-to-br from-slate-500 to-slate-600';
    }
  };

  // Get shadow color based on type
  const getShadowColor = () => {
    switch (type) {
      case 'bestFit':
      case 'bestfit':
        return 'rgba(59, 130, 246, 0.6)'; // blue-500 with opacity
      case 'reach':
        return 'rgba(244, 63, 94, 0.6)'; // rose-500 with opacity
      case 'target':
        return 'rgba(16, 185, 129, 0.6)'; // emerald-500 with opacity
      case 'safety':
        return 'rgba(251, 191, 36, 0.6)'; // amber-400 with opacity
      default:
        return 'rgba(100, 116, 139, 0.6)'; // slate-500 with opacity
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
    if (rate < 15) return 'Reach';
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
    if (preserveState) {
      // Save the current URL with any search params to localStorage
      // This will allow us to return to the same search results
      const currentUrl = window.location.href;
      localStorage.setItem('previousUrl', currentUrl);
      
      // Also save what college we're viewing for better back behavior
      localStorage.setItem('lastViewedCollege', college.id);
    }
    
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
    
    if (preserveState) {
      // Save the current URL to localStorage
      const currentUrl = window.location.href;
      localStorage.setItem('previousUrl', currentUrl);
      localStorage.setItem('lastViewedCollege', collegeId);
    }
    
    router.push(`/college/${collegeId}`);
  };

  const handleStarClick = async (e) => {
    e.stopPropagation(); // Prevent card click event
    if (!session) {
      // If not logged in, redirect to auth
      router.push('/auth/signin');
      return;
    }

    console.log("College data:", college);
    console.log("Attempting to favorite college:", { 
      id: college.id, 
      name: college.name,
      type: typeof college.id 
    });

    try {
      const response = await fetch('/api/colleges/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeId: college.id,
          action: isStarred ? 'unfavorite' : 'favorite'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to update favorite status');
      }

      setIsStarred(!isStarred);
      if (onToggleFavorite) {
        onToggleFavorite(college.id, !isStarred);
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  // Create the 3D card effect style with backdrop shadow
  const cardStyle = {
    position: 'relative',
    boxShadow: `0 0 1px rgba(0, 0, 0, 0.1), 
                8px 8px 0 ${getShadowColor()}`,
    transform: 'translateZ(0)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  };

  const cardHoverStyle = {
    transform: 'translateY(-4px) translateZ(0)',
    boxShadow: `0 0 1px rgba(0, 0, 0, 0.1), 
                10px 10px 0 ${getShadowColor()}`,
  };

  return (
    <div 
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
      style={cardStyle}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, cardHoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, cardStyle);
      }}
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 transition-opacity group-hover:opacity-70"></div>
        
        {showImageLoadingSkeleton ? (
          <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
            <span className="text-gray-400 text-sm">Loading image...</span>
          </div>
        ) : (
          <img 
            src={collegeImageUrl}
            alt={`${college.name} campus`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
          />
        )}
        
        <div className="absolute top-4 left-4 z-20">
          <span className={`${getBgColor()} backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm transition-transform duration-300 group-hover:scale-105`}>
            {getTypeLabel()}
          </span>
        </div>
        <button
          onClick={handleStarClick}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
        >
          <Star
            className={`w-5 h-5 ${
              isStarred 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-400 hover:text-yellow-400'
            } transition-colors`}
          />
        </button>
        <h3 className="absolute bottom-4 left-4 right-4 z-20 text-xl font-bold text-white drop-shadow-lg line-clamp-2">
          {college.name}
        </h3>
      </div>
      
      <div className="flex flex-1 flex-col justify-between p-5 bg-white">
        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">{college.state} • {college.type}</span>
          </div>
          
          {college.top_majors && college.top_majors.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Top Majors</h4>
              <div className="flex flex-wrap gap-1.5">
                {college.top_majors.slice(0, 3).map((major, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                  >
                    {major.name}
                  </span>
                ))}
                {college.top_majors.length > 3 && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                    +{college.top_majors.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Acceptance</h4>
              <div className="flex items-center">
                <span className="text-base font-semibold text-gray-900">{formatAcceptanceRate(college.acceptance_rate)}</span>
              </div>
            </div>
            
            {formatCost(college.cost) && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Cost</h4>
                <p className="text-base font-semibold text-gray-900">{formatCost(college.cost)}</p>
              </div>
            )}
          </div>
          
          {college.ai_insight && (
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{college.ai_insight}</p>
            </div>
          )}
        </div>
        

      </div>
    </div>
  );
}

export function CollegeCardSection({ title, colleges, type }) {
  // Reset the used images tracking when this component mounts
  useEffect(() => {
    resetUsedImages();
  }, []);

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