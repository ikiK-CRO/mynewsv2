'use client';

import styles from './page.module.scss';
import SearchSection from './components/SearchSection';
import Divider from './components/Divider';
import Sidebar from './components/Sidebar';
import NewsGrid from './components/NewsGrid';
import LatestNews from './components/LatestNews';
import React, { useEffect, useCallback } from 'react';
import { useNews } from './context/NewsContext';
import { UnifiedArticle } from './types/news';

const Home: React.FC = () => {
  const { 
    articles, 
    latestNews, 
    breakingNews, 
    loading, 
    activeCategory,
    setActiveCategory,
    loadMoreLatestNews,
    latestNewsLoading,
    hasMoreLatestNews,
    searchResults,
    searchLoading,
    searchTerm,
    searchNews,
    clearSearch,
    refreshNews
  } = useNews();

  // Log navigation to this page
  useEffect(() => {
    console.log('[Home] Component mounted with category:', activeCategory);
    
    // Optional: Force refresh if needed on initial navigation
    // refreshNews();
    
    return () => {
      console.log('[Home] Component unmounted');
    };
  }, [activeCategory]);

  // Handle category change when a sidebar item is clicked
  const handleCategoryChange = useCallback((category: string) => {
    // Skip if it's the same category
    if (category === activeCategory) {
      console.log(`[Home] Category ${category} already active, skipping change`);
      return;
    }
    
    console.log(`[Home] Changing category from ${activeCategory} to ${category}`);
    
    // Change the active category - this will trigger the useEffect in NewsContext
    setActiveCategory(category);
    
    // Clear search when changing categories
    clearSearch();
  }, [clearSearch, activeCategory, setActiveCategory]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    searchNews(term);
  }, [searchNews]);

  // Merge articles and insert breaking news at random positions within first 11 articles
  const allArticles = React.useMemo(() => {
    // If there's an active search, return search results
    if (searchTerm) {
      return searchResults || [];
    }

    // First, ensure articles array exists
    if (!articles || articles.length === 0) {
      console.log('[Home] No articles available for display');
      return [];
    }

    // Remove any duplicates between breaking news and regular articles
    const regularArticles = articles.filter(article => 
      !breakingNews.some(breaking => breaking.id === article.id)
    );
    
    if (!breakingNews || breakingNews.length === 0) {
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
    const allMerged = [...merged, ...remainingArticles];
    
    // Re-sort non-breaking news articles by date (newest first)
    // Breaking news items will stay at their inserted positions
    return allMerged.sort((a, b) => {
      // Skip sorting for breaking news items (keep them at their special positions)
      if (a.category === 'BREAKING' || b.category === 'BREAKING') {
        return 0;
      }
      // Otherwise sort by date
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [articles, breakingNews, searchTerm, searchResults]);

  return (
    <main className={styles.container}>
      <SearchSection onSearch={handleSearch} />
      <Divider />
      {searchTerm ? (
        <div className={styles.searchResults}>
          <h2 className={styles.sectionTitle}>
            Search Results for "{searchTerm}" 
            <button 
              className={styles.clearSearch}
              onClick={clearSearch}
            >
              Clear Search
            </button>
          </h2>
          <NewsGrid 
            articles={allArticles} 
            loading={searchLoading} 
          />
        </div>
      ) : (
        <div className={styles.contentGrid}>
          <aside className={styles.sidebarContainer}>
            <Sidebar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
          </aside>
          <section className={styles.newsGridContainer}>
            <h2 className={styles.sectionTitle}>News</h2>
            <NewsGrid articles={allArticles} loading={loading} />
          </section>
          <aside className={styles.latestNewsContainer}>
            <LatestNews 
              latestNews={latestNews} 
              loading={loading} 
              loadMoreLatestNews={loadMoreLatestNews}
              latestNewsLoading={latestNewsLoading}
              hasMoreLatestNews={hasMoreLatestNews}
            />
          </aside>
        </div>
      )}
    </main>
  );
};

export default Home; 