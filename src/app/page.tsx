'use client';

import styles from './page.module.scss';
import SearchSection from './components/SearchSection';
import Divider from './components/Divider';
import Sidebar from './components/Sidebar';
import NewsGrid from './components/NewsGrid';
import LatestNews from './components/LatestNews';
import React from 'react';
import useNews from './hooks/useNews';
import { useState, useCallback } from 'react';

const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const { articles, latestNews, breakingNews, loading, error } = useNews(activeCategory);

  // Handle category change when a sidebar item is clicked
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  return (
    <main className={styles.container}>
      <SearchSection />
      <Divider />
      <div className={styles.contentGrid}>
        <aside className={styles.sidebarContainer}>
          <Sidebar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
        </aside>
        <section className={styles.newsGridContainer}>
          <h2 className={styles.sectionTitle}>News</h2>
          <NewsGrid articles={articles} loading={loading} />
        </section>
        <aside className={styles.latestNewsContainer}>
          <LatestNews latestNews={latestNews} loading={loading} />
        </aside>
      </div>
    </main>
  );
};

export default Home; 