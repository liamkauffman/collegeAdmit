"use client";

import { useEffect, useRef } from 'react';

/**
 * Hook to add state persistence when navigating to college detail pages
 * @param {function} onRestoreState - Function to call when state should be restored
 */
export function useStatePersistence(onRestoreState) {
  // Use a ref to track if restoration has been done
  const restorationDone = useRef(false);
  
  useEffect(() => {
    // Check if we're returning from a college detail page
    const checkForReturnNavigation = () => {
      // Skip if we've already restored state
      if (restorationDone.current) {
        return;
      }
      
      const previousUrl = localStorage.getItem('previousUrl');
      
      // If we have a stored URL and it looks like we might be returning
      // from a college detail page, trigger state restoration
      if (previousUrl) {
        const currentPathname = window.location.pathname;
        // We're back at the main page after visiting a college
        if (currentPathname === '/' || currentPathname === '') {
          console.log('Detected return from college page, restoring state');
          restorationDone.current = true; // Mark as done
          onRestoreState?.();
          
          // Remove the saved previous URL 
          localStorage.removeItem('previousUrl');
          localStorage.removeItem('lastViewedCollege');
        }
      }
    };
    
    // First check on mount
    checkForReturnNavigation();
    
    // Also listen for popstate events (browser back/forward)
    const handlePopState = () => {
      // Reset the flag on navigation events
      restorationDone.current = false;
      checkForReturnNavigation();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onRestoreState]);
}

/**
 * Saves current search state for preservation during navigation
 * @param {Object} state - Current application state
 */
export function saveSearchState(state) {
  localStorage.setItem('lastSearchState', JSON.stringify(state));
}

/**
 * Loads saved search state
 * @returns {Object|null} The saved state or null if not found
 */
export function loadSearchState() {
  try {
    const savedState = localStorage.getItem('lastSearchState');
    return savedState ? JSON.parse(savedState) : null;
  } catch (err) {
    console.error('Error loading saved state:', err);
    return null;
  }
} 