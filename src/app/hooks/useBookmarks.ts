'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, addBookmark, removeBookmark } from '../services/bookmarkService';
import { UnifiedArticle } from '../types/news';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<UnifiedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedBookmarks = await getBookmarks(user.uid);
      setBookmarks(fetchedBookmarks);
    } catch (err: any) {
      console.error('Error fetching bookmarks:', err);
      setError(err.message || 'Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = useCallback(async (article: UnifiedArticle) => {
    if (!user) return false;

    try {
      const isBookmarked = bookmarks.some(bookmark => bookmark.id === article.id);
      
      if (isBookmarked) {
        await removeBookmark(user.uid, article.id);
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== article.id));
      } else {
        await addBookmark(user.uid, article);
        setBookmarks(prev => [...prev, { ...article, bookmarkedAt: new Date().toISOString() }]);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      setError(err.message || 'Failed to toggle bookmark');
      return false;
    }
  }, [bookmarks, user]);

  const isArticleBookmarked = useCallback((articleId: string) => {
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