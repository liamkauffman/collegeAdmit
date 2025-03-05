import React from 'react';

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-4 text-[#2081C3] text-2xl mb-4">
        Finding colleges, just for you...
      </div>
      
      {/* Animated dots */}
      <div className="flex mt-2">
        <div className="w-2 h-2 bg-[#78D5D7] rounded-full mx-1 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-[#63D2FF] rounded-full mx-1 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-[#2081C3] rounded-full mx-1 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
} 