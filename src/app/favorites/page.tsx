'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './favorites.module.scss';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';
import NewsGrid from '../components/NewsGrid';
import Sidebar from '../components/Sidebar';
import Divider from '../components/Divider';

const FavoritesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebarContainer}>
        <Sidebar activeCategory="favorites" />
      </div>
      <Divider orientation="vertical" />
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Favorites</h1>
          <p className={styles.subtitle}>Articles you've bookmarked for later</p>
        </div>
        
        {bookmarksLoading ? (
          <div className={styles.loading}>Loading your bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className={styles.empty}>
            <h2>No bookmarks yet</h2>
            <p>Start adding articles to your favorites by clicking the bookmark icon on any article.</p>
          </div>
        ) : (
          <NewsGrid articles={bookmarks} loading={bookmarksLoading} />
        )}
      </div>
    </div>
  );
};

export default FavoritesPage; 