'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { UnifiedArticle } from '../types/news';
import styles from './BookmarkButton.module.scss';

interface BookmarkButtonProps {
  article: UnifiedArticle;
  position?: 'top-right' | 'bottom-right' | 'image-overlay';
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  article, 
  position = 'image-overlay' 
}) => {
  const [isMarked, setIsMarked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { bookmarkedIds, toggleBookmark, checkIsBookmarked } = useBookmarks();
  const router = useRouter();

  const checkBookmarkStatus = useCallback(async () => {
    if (!user || !article || !article.id) {
      console.log(`[BookmarkButton] No user/article to check: user=${!!user}, article=${!!article}, id=${article?.id}`);
      setIsChecking(false);
      return;
    }
    
    // Avoid excessive API calls by checking if we're on the favorites page
    // On favorites page, articles are already bookmarked
    if (typeof window !== 'undefined' && window.location.pathname.includes('/favorites')) {
      console.log(`[BookmarkButton] On favorites page, assuming article is bookmarked: ${article.title}`);
      setIsMarked(true);
      setIsChecking(false);
      return;
    }
    
    setIsChecking(true);
    try {
      console.log(`[BookmarkButton] Checking bookmark status for article: ${article.title} (${article.id})`);
      
      // First check the local state
      if (bookmarkedIds.has(article.id)) {
        console.log(`[BookmarkButton] Article ${article.id} is bookmarked (from local state)`);
        setIsMarked(true);
        setIsChecking(false);
        return;
      }
      
      // If not in local state, check the database
      const bookmarkStatus = await checkIsBookmarked(article.id);
      console.log(`[BookmarkButton] Article ${article.id} is ${bookmarkStatus ? 'bookmarked' : 'not bookmarked'}`);
      setIsMarked(bookmarkStatus);
    } catch (error) {
      console.error('[BookmarkButton] Error checking bookmark status:', error);
    } finally {
      setIsChecking(false);
    }
  }, [user, article, bookmarkedIds, checkIsBookmarked]);

  // Check bookmark status on mount and when user/article changes
  useEffect(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus, user, article.id]);

  // Reset bookmark state when user logs out
  useEffect(() => {
    if (!user) {
      setIsMarked(false);
      setIsChecking(false);
    }
  }, [user]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      console.log('[BookmarkButton] No user logged in, redirecting to signin');
      router.push('/signin');
      return;
    }
    
    if (isProcessing) {
      console.log('[BookmarkButton] Already processing a bookmark action');
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log(`[BookmarkButton] Toggling bookmark for article: ${article.title}`);
      const success = await toggleBookmark(article);
      
      if (success !== undefined) {
        setIsMarked(success);
      }
    } catch (error) {
      console.error('[BookmarkButton] Error toggling bookmark:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      className={`bookmarkButton ${styles.bookmarkButton} ${styles[position]} ${isMarked ? styles.active : ''}`}
      onClick={handleBookmarkClick}
      disabled={isChecking || isProcessing}
      aria-label={isMarked ? "Remove from favorites" : "Add to favorites"}
    >
      <svg 
        width="16" 
        height="20" 
        viewBox="0 0 16 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M15 19L8 14L1 19V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H13C13.5304 1 14.0391 1.21071 14.4142 1.58579C14.7893 1.96086 15 2.46957 15 3V19Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill={isMarked ? "currentColor" : "none"}
        />
      </svg>
    </button>
  );
};

export default BookmarkButton; 