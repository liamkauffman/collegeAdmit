import { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { AuthModal } from '@/components/auth-modal';

export function SaveSearchButton({ 
  initialQuery, 
  recommendations, 
  searchSummary, 
  followUpAnswers = []
}) {
  const { data: session, status } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Save the current search as a favorite
  const handleSaveSearch = async () => {
    if (status !== 'authenticated') {
      setShowAuthModal(true);
      return;
    }
    
    if (isSaved) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialQuery,
          followUpQandA: followUpAnswers,
          recommendations,
          searchSummary,
          isFavorite: true // Save directly as a favorite
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save search');
      }
      
      setIsSaved(true);
      
      // Reset the saved state after a delay
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving search:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    // If user is now authenticated, save the search
    if (status === 'authenticated') {
      handleSaveSearch();
    }
  };

  return (
    <>
      <Button
        variant={isSaved ? "default" : "outline"}
        onClick={handleSaveSearch}
        disabled={isSaving || isSaved}
        className={`flex items-center gap-2 w-full justify-center py-3 rounded-full transition-all duration-300 ${
          isSaved 
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md' 
            : 'border-gray-300 hover:border-yellow-400 hover:text-yellow-500 hover:shadow-md'
        }`}
      >
        {isSaving ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : isSaved ? (
          <>
            <Check className="h-4 w-4" />
            <span className="font-medium">Saved to Favorites</span>
          </>
        ) : (
          <>
            <Star className="h-4 w-4" />
            <span className="font-medium">Save Search to Favorites</span>
          </>
        )}
      </Button>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose} 
        actionType="saveSearch" 
      />
    </>
  );
} 