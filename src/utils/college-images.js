// Map of college images
const COLLEGE_IMAGES = {
  // Add specific college images here if you have them
};

// Fallback images that actually work
const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1200", // Library
  "https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus
  "https://images.pexels.com/photos/356065/pexels-photo-356065.jpeg?auto=compress&cs=tinysrgb&w=1200", // Building
  "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus Path
];

// Get a consistent fallback image based on college name
function getFallbackImage(collegeName) {
  if (!collegeName) return FALLBACK_IMAGES[0];
  
  const hash = String(collegeName).split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
}

// Simplified getCollegeImage function that returns immediately
export function getCollegeImage(collegeId, collegeName) {
  // Safely convert collegeId to string if it exists
  const id = collegeId ? String(collegeId).toLowerCase() : '';
  
  // Try to get a specific college image
  const specificImage = COLLEGE_IMAGES[id];
  if (specificImage) {
    return specificImage;
  }

  // Use fallback image
  return getFallbackImage(collegeName);
} 