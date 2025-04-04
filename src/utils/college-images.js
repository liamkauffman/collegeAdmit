// Map of college images
const COLLEGE_IMAGES = {
  // Add specific college images here if you have them
};

// Fallback images that actually work
const FALLBACK_IMAGES = [
  // Campus buildings and architecture
  "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1200", // Library
  "https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus
  "https://images.pexels.com/photos/356065/pexels-photo-356065.jpeg?auto=compress&cs=tinysrgb&w=1200", // Building
  "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus Path
  "https://images.pexels.com/photos/159751/book-read-literature-pages-159751.jpeg?auto=compress&cs=tinysrgb&w=1200", // Library books
  "https://images.pexels.com/photos/256520/pexels-photo-256520.jpeg?auto=compress&cs=tinysrgb&w=1200", // Library interior
  "https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg?auto=compress&cs=tinysrgb&w=1200", // Modern campus building
  "https://images.pexels.com/photos/1167021/pexels-photo-1167021.jpeg?auto=compress&cs=tinysrgb&w=1200", // Historic college building
  
  // Campus life
  "https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=1200", // Students walking
  "https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus quad
  "https://images.pexels.com/photos/5940841/pexels-photo-5940841.jpeg?auto=compress&cs=tinysrgb&w=1200", // Students studying
  "https://images.pexels.com/photos/6147276/pexels-photo-6147276.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus life
  "https://images.pexels.com/photos/4491461/pexels-photo-4491461.jpeg?auto=compress&cs=tinysrgb&w=1200", // Science lab
  
  // Nature and landscapes on campus
  "https://images.pexels.com/photos/1534057/pexels-photo-1534057.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus garden
  "https://images.pexels.com/photos/6544096/pexels-photo-6544096.jpeg?auto=compress&cs=tinysrgb&w=1200", // College courtyard
  "https://images.pexels.com/photos/948365/pexels-photo-948365.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus trees
  "https://images.pexels.com/photos/736779/pexels-photo-736779.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus pond
  
  // Academic focus
  "https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=1200", // Classroom
  "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200", // Campus pathway
  "https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg?auto=compress&cs=tinysrgb&w=1200", // Engineering lab
  "https://images.pexels.com/photos/2982449/pexels-photo-2982449.jpeg?auto=compress&cs=tinysrgb&w=1200", // Chemistry lab
  "https://images.pexels.com/photos/714699/pexels-photo-714699.jpeg?auto=compress&cs=tinysrgb&w=1200", // Computer lab
];

// Track which fallback images are already used on the current page
let usedImagesOnCurrentPage = new Set();

// Function to reset the tracking of used images (call this when navigating to a new page)
export function resetUsedImages() {
  usedImagesOnCurrentPage.clear();
}

// Get a fallback image based on college name that hasn't been used yet on the page
function getFallbackImage(collegeName) {
  if (!collegeName) return FALLBACK_IMAGES[0];
  
  const hash = String(collegeName).split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // First try the hash-based image
  let fallbackIndex = Math.abs(hash) % FALLBACK_IMAGES.length;
  let fallbackImage = FALLBACK_IMAGES[fallbackIndex];
  
  // If this image is already used, find the next available one
  if (usedImagesOnCurrentPage.has(fallbackImage)) {
    // Try to find an unused image
    for (let i = 0; i < FALLBACK_IMAGES.length; i++) {
      const nextIndex = (fallbackIndex + i + 1) % FALLBACK_IMAGES.length;
      const nextImage = FALLBACK_IMAGES[nextIndex];
      
      if (!usedImagesOnCurrentPage.has(nextImage)) {
        fallbackImage = nextImage;
        break;
      }
    }
    
    // If all images are used, just use the original hash-based one
    // (this is unlikely with a large number of fallback images)
  }
  
  // Track that this image is now used
  usedImagesOnCurrentPage.add(fallbackImage);
  
  return fallbackImage;
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