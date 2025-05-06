import { useState } from 'react';
import { History, Clock } from 'lucide-react';
import { SavedSearchesDrawer } from '@/components/saved-searches-drawer';
import { useSession } from 'next-auth/react';
import { AuthModal } from '@/components/auth-modal';
import { Button } from '@/components/ui/button';

export function SearchHistoryButton({ onSelectSearch }) {
  const { data: session, status } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

	const handleButtonClick = () => {
		if (status === 'authenticated') {
			setIsDrawerOpen(true);
		} else {
			setShowAuthModal(true);
		}
	};

	const handleToggleFavoritesFilter = () => {
		setShowOnlyFavorites(!showOnlyFavorites);
	};

	const handleAuthModalClose = () => {
		setShowAuthModal(false);
		// If user is now authenticated, open the drawer
		if (status === 'authenticated') {
			setIsDrawerOpen(true);
		}
	};
	return (
		<>
			{/* Tab that sticks out from the left side */}
			<div 
				onClick={handleButtonClick}
				className="fixed left-0 top-32 z-[9999] cursor-pointer group"
			>
				<div className="flex items-center">
					<div className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md rounded-r-lg py-3 px-2 transition-all duration-300 group-hover:px-3 border border-l-0 border-gray-200 dark:border-gray-700">
						<Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
					</div>
					<div className="absolute left-10 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity duration-300 whitespace-nowrap">
						Search History
					</div>
				</div>
			</div>

			{/* Saved searches drawer */}
			<SavedSearchesDrawer 
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				onSelectSearch={onSelectSearch}
				showOnlyFavorites={showOnlyFavorites}
				onToggleFavoritesFilter={handleToggleFavoritesFilter}
			/>

			{/* Auth modal */}
			<AuthModal 
				isOpen={showAuthModal} 
				onClose={handleAuthModalClose} 
				actionType="savedSearches" 
			/>
		</>
	);
} 