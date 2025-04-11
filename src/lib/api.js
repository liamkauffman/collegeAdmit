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
    
    const response = await fetch(apiPath, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      // Use text() followed by JSON.parse() to avoid ReadableStream issues
      const errorText = await response.text();
      let errorMsg = `Error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // If parsing fails, use the raw text if available
        if (errorText) errorMsg = errorText;
      }
      
      throw new Error(errorMsg);
    }
    
    // Always use text() followed by JSON.parse() to avoid ReadableStream issues
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response received from API');
    }
    
    const data = JSON.parse(responseText);
    
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
      // Use text() followed by JSON.parse() to avoid ReadableStream issues
      const errorText = await response.text();
      let errorMsg = `Error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        if (errorText) errorMsg = errorText;
      }
      
      throw new Error(errorMsg);
    }
    
    // Always use text() followed by JSON.parse()
    const responseText = await response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to fetch similar colleges:", error);
    throw error;
  }
} 