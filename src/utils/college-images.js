// Map of college images (can be used for specific colleges)
const COLLEGE_IMAGES = {
  // Add specific college images here if you have them
};

// Cache for API results to avoid duplicate requests
const API_CACHE = {
  // Maps search terms to API responses
  queries: {},
  // Maps college IDs to selected images 
  colleges: {}
};

// Track which images are already used on the current page
let usedImagesOnCurrentPage = new Set();

/**
 * Resets tracking of used images when navigating to a new page
 */
export function resetUsedImages() {
  console.log('Resetting used images');
  usedImagesOnCurrentPage.clear();
}

/**
 * Searches the Pexels API for college-related images
 * @param {string} query - Search term for the Pexels API
 * @param {Object} options - Additional search options
 * @returns {Promise<Object[]>} Promise resolving to array of photo objects
 */
export async function searchPexelsImages(query, options = {}) {
  console.log(`Searching Pexels images for query: ${query}`, options);
  const {
    perPage = 15,
    orientation = 'landscape',
    size = 'medium'
  } = options;
  
  // Check cache first to avoid redundant API calls
  const cacheKey = `${query}-${perPage}-${orientation}-${size}`;
  if (API_CACHE.queries[cacheKey]) {
    console.log('Returning cached Pexels results for query:', query);
    return API_CACHE.queries[cacheKey];
  }
  
  // Pexels API key should be in environment variables
  const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  if (!apiKey) {
    console.error('Missing Pexels API key. Set NEXT_PUBLIC_PEXELS_API_KEY in your environment.');
    return [];
  }
  
  try {
    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.append('query', query);
    url.searchParams.append('per_page', perPage);
    url.searchParams.append('orientation', orientation);
    url.searchParams.append('size', size);
    
    console.log('Fetching from Pexels API:', url.toString());
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data.photos.length} photos from Pexels API`);
    
    // Store in cache
    API_CACHE.queries[cacheKey] = data.photos;
    
    return data.photos;
  } catch (error) {
    console.error('Error fetching from Pexels API:', error);
    return [];
  }
}

/**
 * Creates an image object with attribution info
 * @param {Object} photo - Pexels photo object
 * @returns {Object} Formatted image object with URL and attribution
 */
function createImageObject(photo) {
  console.log('Creating image object for photo:', photo.id);
  return {
    url: photo.src.large,
    alt: photo.alt || `Campus image by ${photo.photographer}`,
    attribution: {
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      pexelsUrl: photo.url,
      id: photo.id
    }
  };
}

/**
 * Gets college image asynchronously from Pexels API
 * @param {string|number} collegeId - ID of the college
 * @param {string} collegeName - Name of the college
 * @returns {Promise<Object|null>} Promise resolving to image object or null if not found
 */
export async function getCollegeImageAsync(collegeId, collegeName) {
  console.log(`Getting college image async for: ${collegeName} (ID: ${collegeId})`);
  // Safely convert collegeId to string if it exists
  const id = collegeId ? String(collegeId).toLowerCase() : '';
  
  // Try to get a specific college image from hardcoded map
  const specificImage = COLLEGE_IMAGES[id];
  if (specificImage) {
    console.log(`Found specific image for college ID: ${id}`);
    return specificImage;
  }
  
  // Check if we already cached an image for this college
  if (API_CACHE.colleges[id] && !API_CACHE.colleges[id].placeholder) {
    console.log(`Returning cached image for college ID: ${id}`);
    return API_CACHE.colleges[id];
  }
  
  try {
    // Create search query based on college name
    const searchQuery = `${collegeName} university campus`;
    
    // Search for images
    console.log(`Searching for images with query: ${searchQuery}`);
    const photos = await searchPexelsImages(searchQuery, {
      perPage: 10,
      orientation: 'landscape'
    });
    
    if (photos && photos.length > 0) {
      console.log(`Found ${photos.length} photos for ${collegeName}`);
      // Try to find an image that hasn't been used yet
      let selectedPhoto = photos[0];
      
      for (const photo of photos) {
        const photoUrl = photo.src.large;
        if (!usedImagesOnCurrentPage.has(photoUrl)) {
          selectedPhoto = photo;
          console.log(`Selected unused photo: ${photo.id}`);
          break;
        }
      }
      
      // Create image object with attribution
      const imageObject = createImageObject(selectedPhoto);
      
      // Cache for future use
      API_CACHE.colleges[id] = imageObject;
      
      // Mark as used on this page
      usedImagesOnCurrentPage.add(imageObject.url);
      console.log(`Marked image as used: ${imageObject.url}`);
      
      return imageObject;
    }
    // No images found, return null
    return null;
  } catch (error) {
    console.error('Error getting college image from Pexels:', error);
    return null;
  }
}

/**
 * Synchronous version that returns an image URL immediately
 * and triggers async fetch in background if needed
 * @param {string|number} collegeId - ID of the college
 * @param {string} collegeName - Name of the college
 * @returns {string|null} Image URL or null if no image available yet
 */
export function getCollegeImage(collegeId, collegeName) {
  console.log(`Getting college image for: ${collegeName} (ID: ${collegeId})`);
  const id = collegeId ? String(collegeId).toLowerCase() : '';
  
  // Try to get a specific college image from hardcoded map
  const specificImage = COLLEGE_IMAGES[id];
  if (specificImage) {
    console.log(`Found specific image for college ID: ${id}`);
    return typeof specificImage === 'string' ? specificImage : specificImage.url;
  }
  
  // Check if we already have a cached version
  if (API_CACHE.colleges[id]) {
    console.log(`Returning cached image for college ID: ${id}`);
    const cachedImage = API_CACHE.colleges[id];
    return typeof cachedImage === 'string' ? cachedImage : cachedImage.url;
  }
  
  // Mark this college as loading, but don't provide a placeholder
  API_CACHE.colleges[id] = { 
    placeholder: true,
    loading: true
  };
  
  // Start async fetch in background
  getCollegeImageAsync(collegeId, collegeName)
    .then(result => {
      // Update the cache with the fetched image
      if (result) {
        console.log(`Async fetch complete for ${collegeName}. Updating cache.`);
        API_CACHE.colleges[id] = result;
        
        // Dispatch a custom event to notify components to update
        if (typeof window !== 'undefined') {
          console.log(`Dispatching collegeImageLoaded event for ${collegeName}`);
          window.dispatchEvent(new CustomEvent('collegeImageLoaded', { 
            detail: { collegeId: id, imageUrl: result.url }
          }));
        }
      } else {
        // If no image was found, update cache to reflect that
        delete API_CACHE.colleges[id];
      }
    })
    .catch(error => {
      console.error(`Error in async image fetch for ${collegeName}:`, error);
      // On error, remove the placeholder
      delete API_CACHE.colleges[id];
    });
  
  // Return null to indicate image is loading
  return null;
}
