import React from 'react';

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-4 text-[#4068ec] text-2xl mb-4">
        Finding colleges, just for you...
      </div>
      
      {/* Animated dots */}
      <div className="flex justify-center items-center">
        <div className="w-2 h-2 bg-[#4068ec] rounded-full mx-1 animate-bounce"></div>
        <div className="w-2 h-2 bg-[#4068ec] rounded-full mx-1 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-[#4068ec] rounded-full mx-1 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
} 