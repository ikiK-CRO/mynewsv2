'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, addBookmark, removeBookmark } from '../services/bookmarkService';
import { UnifiedArticle } from '../types/news';

interface BookmarkedArticle extends UnifiedArticle {
  bookmarkedAt?: string;
}

/**
 * Custom hook for managing bookmarked articles
 * Provides functionality to fetch, add, remove, and check bookmarked articles
 * @returns {Object} Object containing bookmarks state and functions to manage bookmarks
 */
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Fetches bookmarks for the current user
   * Resets state if no user is authenticated
   * @returns {Promise<BookmarkedArticle[]>} Array of bookmarked articles
   */
  const fetchBookmarks = useCallback(async () => {
    // If no user, reset state and return
    if (!user) {
      console.log('No authenticated user, clearing bookmarks');
      setBookmarks([]);
      setLoading(false);
      setError(null);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching bookmarks for user: ${user.uid}`);
      const fetchedBookmarks = await getBookmarks(user.uid);
      
      console.log(`Fetched ${fetchedBookmarks.length} bookmarks`);
      // Store complete article data including all required fields
      setBookmarks(fetchedBookmarks);
      
      return fetchedBookmarks;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch bookmarks';
      console.error('Error fetching bookmarks:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch when component mounts or user changes
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  /**
   * Toggles the bookmark status of an article
   * Adds the article to bookmarks if not bookmarked, removes it if already bookmarked
   * @param {UnifiedArticle} article - The article to toggle bookmark status for
   * @returns {Promise<boolean>} Success status of the operation
   */
  const toggleBookmark = useCallback(async (article: UnifiedArticle) => {
    if (!user) {
      console.log('Cannot toggle bookmark - no authenticated user');
      return false;
    }
    
    if (!article || !article.id) {
      console.error('Invalid article data for bookmark toggle');
      return false;
    }

    try {
      setError(null);
      const isBookmarked = bookmarks.some(bookmark => bookmark.id === article.id);
      console.log(`Toggling bookmark for article ${article.id} - current status: ${isBookmarked ? 'bookmarked' : 'not bookmarked'}`);
      
      if (isBookmarked) {
        // Remove bookmark
        const success = await removeBookmark(user.uid, article.id);
        if (success) {
          setBookmarks(prev => prev.filter(bookmark => bookmark.id !== article.id));
          console.log('Bookmark removed successfully');
        } else {
          console.error('Failed to remove bookmark');
          return false;
        }
      } else {
        // Add bookmark - store complete article data
        const success = await addBookmark(user.uid, article);
        if (success) {
          // Create a complete article object with all necessary data
          const bookmarkedArticle = { 
            ...article, 
            bookmarkedAt: new Date().toISOString() 
          } as BookmarkedArticle;
          
          setBookmarks(prev => [...prev, bookmarkedArticle]);
          console.log('Bookmark added successfully');
        } else {
          console.error('Failed to add bookmark');
          return false;
        }
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to toggle bookmark';
      console.error('Error toggling bookmark:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [bookmarks, user]);

  /**
   * Checks if an article is bookmarked
   * @param {string} articleId - The ID of the article to check
   * @returns {boolean} Whether the article is bookmarked
   */
  const isArticleBookmarked = useCallback((articleId: string) => {
    if (!articleId || !bookmarks.length) return false;
    return bookmarks.some(bookmark => bookmark.id === articleId);
  }, [bookmarks]);

  return {
    bookmarks,
    loading,
    error,
    refreshBookmarks: fetchBookmarks,
    toggleBookmark,
    isArticleBookmarked,
  };
}; 