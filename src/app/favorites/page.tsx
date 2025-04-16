'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './favorites.module.scss';
import { useAuth } from '../context/AuthContext';
import { getBookmarks } from '../services/bookmarkService';
import { UnifiedArticle } from '../types/news';
import NewsGrid from '../components/NewsGrid';
import Sidebar from '../components/Sidebar';
import Divider from '../components/Divider';
import SearchSection from '../components/SearchSection';

const FavoritesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<UnifiedArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Directly fetch bookmarks from Firestore - no middleman
  const fetchBookmarks = async () => {
    if (!user) {
      console.log('No authenticated user to fetch bookmarks');
      return;
    }

    try {
      setLoading(true);
      console.log(`Directly fetching bookmarks for user: ${user.uid}`);
      
      // Get bookmarks directly from Firestore
      const bookmarkData = await getBookmarks(user.uid);
      
      console.log(`Fetched ${bookmarkData.length} bookmarks directly from Firestore`);
      console.log('Bookmark data sample:', bookmarkData.slice(0, 2));
      
      setBookmarks(bookmarkData);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load your bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated, redirect if not
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to sign in');
      router.push('/signin');
      return;
    }
    
    // If user is authenticated, fetch bookmarks
    if (user) {
      fetchBookmarks();
    }
  }, [user, authLoading, router]);

  // Set navigation flag when leaving the page
  useEffect(() => {
    return () => {
      // Set a flag for the home page to detect navigation from favorites
      try {
        localStorage.setItem('news_navigation_state', JSON.stringify({
          from_favorites: true,
          timestamp: Date.now()
        }));
        console.log('[Favorites] Setting navigation flag in localStorage before unmount');
      } catch (err) {
        console.error('[Favorites] Error setting localStorage:', err);
      }
    };
  }, []);

  if (authLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <main className={styles.container}>
      <div className={styles.headerSection}>
        <SearchSection hideSearch={true} />
        <Divider />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.sidebarContainer}>
          <Sidebar activeCategory="favorites" />
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Favorites</h1>
            <p className={styles.subtitle}>Articles you've bookmarked for later</p>
            <button 
              className={styles.refreshButton}
              onClick={fetchBookmarks}
              disabled={loading}
            >
              Refresh Bookmarks
            </button>
          </div>
          
          {loading ? (
            <div className={styles.loading}>Loading your bookmarks...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : bookmarks.length === 0 ? (
            <div className={styles.empty}>
              <h2>No bookmarks yet</h2>
              <p>Start adding articles to your favorites by clicking the bookmark icon on any article.</p>
            </div>
          ) : (
            <NewsGrid 
              articles={bookmarks} 
              loading={loading} 
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default FavoritesPage; 