'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { addBookmark, removeBookmark, isBookmarked } from '../services/bookmarkService';
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
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (user) {
        setIsChecking(true);
        try {
          const bookmarkStatus = await isBookmarked(user.uid, article.id);
          setIsMarked(bookmarkStatus);
        } catch (error) {
          console.error('Error checking bookmark status:', error);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };

    checkBookmarkStatus();
  }, [user, article.id]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to sign in if user is not authenticated
      router.push('/signin');
      return;
    }

    try {
      if (isMarked) {
        await removeBookmark(user.uid, article.id);
        setIsMarked(false);
      } else {
        await addBookmark(user.uid, article);
        setIsMarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <button
      className={`bookmarkButton ${styles.bookmarkButton} ${styles[position]} ${isMarked ? styles.active : ''}`}
      onClick={handleBookmarkClick}
      disabled={isChecking}
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