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
import { UnifiedArticle } from './types/news';

const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const { articles, latestNews, breakingNews, loading, error } = useNews(activeCategory);

  // Handle category change when a sidebar item is clicked
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Merge articles and insert breaking news at random positions within first 11 articles
  const allArticles = React.useMemo(() => {
    // First, remove any duplicates between breaking news and regular articles
    const regularArticles = articles.filter(article => 
      !breakingNews.some(breaking => breaking.id === article.id)
    );
    
    if (breakingNews.length === 0) {
      return regularArticles;
    }
    
    // Get the first 11 or fewer regular articles
    const firstArticles = regularArticles.slice(0, 11);
    const remainingArticles = regularArticles.slice(11);
    
    // Create an array to hold the merged results
    const merged: UnifiedArticle[] = [...firstArticles];
    
    // Insert breaking news at random positions within the first set
    breakingNews.forEach(breakingArticle => {
      // Limit random position to the current length of merged array
      const randomPosition = Math.floor(Math.random() * (merged.length + 1));
      merged.splice(randomPosition, 0, breakingArticle);
    });
    
    // Add remaining articles
    return [...merged, ...remainingArticles];
  }, [articles, breakingNews]);

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
          <NewsGrid articles={allArticles} loading={loading} />
        </section>
        <aside className={styles.latestNewsContainer}>
          <LatestNews latestNews={latestNews} loading={loading} />
        </aside>
      </div>
    </main>
  );
};

export default Home; 