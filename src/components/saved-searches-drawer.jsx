import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, BookmarkMinus, X, Star, Trash2, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Format truncated text with ellipsis
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Format date to readable format
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  } catch (error) {
    return 'Invalid date';
  }
};

export function SavedSearchesDrawer({ 
  isOpen, 
  onClose, 
  onSelectSearch, 
  showOnlyFavorites = false,
  onToggleFavoritesFilter
}) {
  const { data: session, status } = useSession();
  const [savedSearches, setSavedSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch saved searches when the drawer opens or when filter changes
  useEffect(() => {
    if (isOpen && status === 'authenticated') {
      fetchSavedSearches();
    }
  }, [isOpen, status, showOnlyFavorites]);

  // Fetch saved searches from the API
  const fetchSavedSearches = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?favorites=${showOnlyFavorites}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved searches');
      }
      
      const data = await response.json();
      setSavedSearches(data.savedSearches || []);
    } catch (err) {
      console.error('Error fetching saved searches:', err);
      setError('Could not load your saved searches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle favorite status for a saved search
  const toggleFavorite = async (searchId, currentStatus) => {
    try {
      const response = await fetch(`/api/search/${searchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      // Update the UI
      setSavedSearches(prevSearches => 
        prevSearches.map(search => 
          search.id === searchId 
            ? { ...search, isFavorite: !search.isFavorite } 
            : search
        )
      );
    } catch (err) {
      console.error('Error toggling favorite status:', err);
    }
  };

  // Delete a saved search
  const deleteSearch = async (searchId) => {
    try {
      const response = await fetch(`/api/search/${searchId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete saved search');
      }
      
      // Remove from UI
      setSavedSearches(prevSearches => 
        prevSearches.filter(search => search.id !== searchId)
      );
    } catch (err) {
      console.error('Error deleting saved search:', err);
    }
  };

  // Handle search selection
  const handleSearchSelect = (search) => {
    onSelectSearch(search);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Drawer panel - sliding from left */}
          <motion.div
            initial={{ x: '-100%', opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-screen w-[350px] bg-white dark:bg-gray-900 shadow-xl z-[10000] flex flex-col border-r border-gray-200 dark:border-gray-700"
          >
            {/* Header - fixed at top of drawer */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search History</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFavoritesFilter}
                  className={`flex items-center p-2 ${showOnlyFavorites ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Content - scrollable area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  </div>
                ) : error ? (
                  <div className="text-center p-6 text-red-500 dark:text-red-400">
                    <p>{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={fetchSavedSearches}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : savedSearches.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {showOnlyFavorites 
                        ? "No favorite searches yet" 
                        : "No saved searches yet"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                      {showOnlyFavorites 
                        ? "Mark searches as favorites to add them here for quick access." 
                        : "Your search history will appear here as you explore colleges."}
                    </p>
                    {showOnlyFavorites && (
                      <Button
                        variant="outline"
                        onClick={onToggleFavoritesFilter}
                        className="inline-flex items-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Show All Searches
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedSearches.map((search) => (
                      <motion.div
                        key={search.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <button 
                              onClick={() => handleSearchSelect(search)}
                              className="text-left hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {truncateText(search.initialQuery, 60)}
                              </h3>
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(search.id, search.isFavorite)}
                              className={`ml-2 p-1 h-7 w-7 ${search.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                            >
                              <Star className="h-4 w-4" fill={search.isFavorite ? "currentColor" : "none"} />
                            </Button>
                          </div>
                          
                          {search.searchSummary && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {truncateText(search.searchSummary, 100)}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(search.createdAt)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSearch(search.id)}
                              className="p-1 h-7 w-7 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999]"
          />
        </>
      )}
    </AnimatePresence>
  );
} 