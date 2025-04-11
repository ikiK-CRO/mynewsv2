'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UnifiedArticle } from '../types/news';
import { addBookmark, removeBookmark, getBookmarks, isBookmarked } from '../services/bookmarkService';
import { useAuth } from './AuthContext';

// Extend UnifiedArticle type to include bookmarkedAt
interface BookmarkedArticle extends UnifiedArticle {
  bookmarkedAt?: string;
}

// Define the shape of our context
interface BookmarkContextType {
  // Bookmark state
  bookmarkedArticles: BookmarkedArticle[];
  bookmarkedIds: Set<string>;
  bookmarksLoading: boolean;
  
  // Actions
  toggleBookmark: (article: UnifiedArticle) => Promise<boolean>;
  checkIsBookmarked: (articleId: string) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;
}

// Create context with a default undefined value
const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

// Create a hook to use the context
export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

/**
 * Context provider for bookmark-related state and functionality
 */
export const BookmarkProvider = ({ children }: { children: React.ReactNode }) => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkedArticle[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarksLoading, setBookmarksLoading] = useState<boolean>(false);
  
  const { user } = useAuth();
  
  // Load bookmarks when user changes
  useEffect(() => {
    if (user) {
      refreshBookmarks();
    } else {
      // Clear bookmarks when user logs out
      setBookmarkedArticles([]);
      setBookmarkedIds(new Set());
    }
  }, [user]);
  
  // Refresh bookmarks
  const refreshBookmarks = useCallback(async () => {
    if (!user) return;
    
    try {
      setBookmarksLoading(true);
      const bookmarks = await getBookmarks(user.uid);
      
      // Create a Set of bookmarked IDs for quick lookups
      const ids = new Set(bookmarks.map(article => article.id));
      
      setBookmarkedArticles(bookmarks);
      setBookmarkedIds(ids);
    } catch (err) {
      console.error('[BookmarkContext] Error refreshing bookmarks:', err);
    } finally {
      setBookmarksLoading(false);
    }
  }, [user]);
  
  // Toggle bookmark status for an article
  const toggleBookmark = useCallback(async (article: UnifiedArticle): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const isCurrentlyBookmarked = bookmarkedIds.has(article.id);
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        await removeBookmark(user.uid, article.id);
        
        // Update state
        setBookmarkedArticles(prev => 
          prev.filter(item => item.id !== article.id)
        );
        
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(article.id);
          return newSet;
        });
        
        return false;
      } else {
        // Add bookmark
        const success = await addBookmark(user.uid, article);
        
        if (success) {
          // Update state
          const bookmarkedArticle: BookmarkedArticle = {
            ...article,
            bookmarkedAt: new Date().toISOString()
          };
          
          setBookmarkedArticles(prev => [...prev, bookmarkedArticle]);
          
          setBookmarkedIds(prev => {
            const newSet = new Set(prev);
            newSet.add(article.id);
            return newSet;
          });
          
          return true;
        }
        
        return false;
      }
    } catch (err) {
      console.error('[BookmarkContext] Error toggling bookmark:', err);
      return false;
    }
  }, [user, bookmarkedIds]);
  
  // Check if an article is bookmarked
  const checkIsBookmarked = useCallback(async (articleId: string): Promise<boolean> => {
    if (!user) return false;
    
    // First check the local state
    if (bookmarkedIds.has(articleId)) {
      return true;
    }
    
    // If not in local state, check the database
    try {
      return await isBookmarked(user.uid, articleId);
    } catch (err) {
      console.error('[BookmarkContext] Error checking bookmark status:', err);
      return false;
    }
  }, [user, bookmarkedIds]);
  
  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedArticles,
        bookmarkedIds,
        bookmarksLoading,
        toggleBookmark,
        checkIsBookmarked,
        refreshBookmarks
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}; 