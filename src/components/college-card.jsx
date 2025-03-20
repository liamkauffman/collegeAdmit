import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollegeCompare } from '@/components/college-comparison';

export function CollegeCard({ college, type }) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  // Determine background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'bestFit':
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
      case 'reach':
        return 'text-white';
      default:
        return 'text-gray-800';
    }
  };

  // Determine badge color based on acceptance designation
  const getBadgeColor = () => {
    const designation = college.acceptance?.designation;
    if (designation === 'Extreme Reach') return 'bg-red-500';
    if (designation === 'Reach') return 'bg-orange-500';
    if (designation === 'Target') return 'bg-green-500';
    if (designation === 'Likely') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  // Handle click to navigate to college detail page
  const handleCardClick = (e) => {
    // Don't navigate if clicking on compare button
    if (e.target.closest('.compare-button')) {
      e.stopPropagation();
      return;
    }
    
    // Extract college ID from name (for demo purposes)
    const collegeId = college.name?.toLowerCase().split(' ')[0] || 'unknown';
    router.push(`/college/${collegeId}`);
  };
  
  // Handle selecting a similar college
  const handleSelectSimilarCollege = (similarCollege) => {
    const collegeId = similarCollege.name.toLowerCase().split(' ')[0] || 'unknown';
    router.push(`/college/${collegeId}`);
  };

  return (
    <div 
      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${getTextColor()} h-full flex flex-col cursor-pointer group relative`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src={college.image} 
          alt={college.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className={`${getBgColor()} px-3 py-1 rounded-full text-sm font-medium ${getTextColor()}`}>
            {type === 'bestFit' ? 'Best Fit' : type?.charAt(0).toUpperCase() + type?.slice(1)}
          </span>
        </div>
        <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold z-20 drop-shadow-md">
          {college.name}
        </h3>
      </div>
      
      <div className="p-5 bg-white text-gray-800 flex-1 flex flex-col">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{college.location}</span>
        </div>
        
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Top Majors</h4>
          <div className="flex flex-wrap gap-1">
            {college.topMajors?.slice(0, 3).map((major, index) => (
              <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs">
                {major}
              </span>
            ))}
            {college.topMajors?.length > 3 && (
              <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs">
                +{college.topMajors.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm mt-auto">
          <div>
            <h4 className="font-medium text-gray-500">Acceptance</h4>
            <div className="flex items-center mt-1">
              <span className="font-bold">{college.acceptance?.rate}</span>
              {college.acceptance?.designation && (
                <span className={`ml-2 ${getBadgeColor()} text-white text-xs px-1.5 py-0.5 rounded`}>
                  {college.acceptance.designation}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-500">Cost</h4>
            <p className="font-bold mt-1">{college.cost}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-500">Quality of Life</h4>
            <div className="flex items-center mt-1">
              <span className="font-bold">{college.qualityOfLife}/10</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-500">Recruiting</h4>
            <p className="font-bold mt-1">{college.recruiting}</p>
          </div>
        </div>
        
        {/* Compare button - Always visible on mobile, appears on hover for desktop */}
        <div className="mt-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 compare-button" onClick={(e) => e.stopPropagation()}>
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