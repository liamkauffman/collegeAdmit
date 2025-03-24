import { API_URL } from '@/config';

/**
 * Fetch details for a specific college by ID
 * @param {string} collegeId - The ID of the college to fetch
 * @returns {Promise<Object>} - The college details
 */
export async function fetchCollegeDetails(collegeId) {
  try {
    const isTest = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test') === 'true';
    
    // Use our Next.js API route that wraps the backend
    // This ensures consistent error handling and client-side fetching
    const apiPath = isTest 
      ? `/api/college/${collegeId}?test=true` 
      : `/api/college/${collegeId}`;
    
    console.log(`Fetching college details from: ${apiPath}`);
    
    const response = await fetch(apiPath);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format received from API');
    }
    
    return data;
  } catch (error) {
    console.error("Failed to fetch college details:", error);
    throw error;
  }
}

/**
 * Fetch similar colleges based on a given college
 * @param {string} collegeId - The ID of the reference college
 * @returns {Promise<Array>} - Array of similar colleges
 */
export async function fetchSimilarColleges(collegeId) {
  try {
    const response = await fetch(`${API_URL}/api/college/${collegeId}/similar`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch similar colleges:", error);
    throw error;
  }
} 