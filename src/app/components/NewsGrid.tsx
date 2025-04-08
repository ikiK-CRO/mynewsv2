'use client';

import styles from './NewsGrid.module.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UnifiedArticle } from '../types/news';

interface NewsGridProps {
  articles: UnifiedArticle[];
  loading: boolean;
}

// Number of cards initially visible (2 cards per row for first 2 rows, then 3 cards per row for next 4 rows)
const INITIAL_VISIBLE_CARDS = 4 + (4 * 3); // 16 cards total (4 in first 2 rows, 12 in next 4 rows)
const CARDS_TO_LOAD = 6; // Load 6 more cards at a time (2 rows)
const TOP_GRID_CARDS = 4; // First 4 cards in 2x2 layout

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x250/E8E8E8/AAAAAA?text=No+Image';

const NewsGrid: React.FC<NewsGridProps> = ({ articles, loading }) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [visibleCards, setVisibleCards] = useState<number>(INITIAL_VISIBLE_CARDS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const loadMoreCards = useCallback(() => {
    if (isLoading || visibleCards >= articles.length) return;
    
    setIsLoading(true);
    // Simulate loading delay for smoother UX
    setTimeout(() => {
      setVisibleCards(prev => Math.min(prev + CARDS_TO_LOAD, articles.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, visibleCards, articles.length]);
  
  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    if (!loadMoreRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreCards();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(loadMoreRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreCards]);

  if (loading) {
    return <div className={styles.loading}>Loading news...</div>;
  }

  if (!articles || articles.length === 0) {
    return <div className={styles.noResults}>No news articles found.</div>;
  }

  // Format a date string
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  // Handle image loading errors
  const handleImageError = (articleId: string) => {
    setImgErrors(prev => ({
      ...prev,
      [articleId]: true
    }));
  };

  // Get visible cards
  const visibleArticles = articles.slice(0, visibleCards);
  const topGridArticles = visibleArticles.slice(0, TOP_GRID_CARDS);
  const bottomGridArticles = visibleArticles.slice(TOP_GRID_CARDS);
  const hasMoreCards = visibleCards < articles.length;

  return (
    <div className={styles.newsGridWrapper}>
      {/* Top 2x2 grid */}
      <div className={styles.newsGrid}>
        {topGridArticles.map((article) => (
          <div 
            key={article.id} 
            className={`${styles.newsCard} ${article.category === 'BREAKING' ? styles.breaking : ''}`}
          >
            <img 
              src={imgErrors[article.id] ? DEFAULT_PLACEHOLDER : article.imageUrl || DEFAULT_PLACEHOLDER} 
              alt={article.title} 
              className={styles.newsImage}
              onError={() => handleImageError(article.id)}
            />
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                {article.category === 'BREAKING' ? (
                  <span className={styles.breakingTag}>BREAKING</span>
                ) : (
                  <span className={styles.category}>{article.category.toUpperCase()}</span>
                )}
                <span className={styles.source}>{article.source}</span>
              </div>
              <h3 className={styles.title}>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h3>
              <p className={styles.author}>
                {article.author || 'Unknown'} • {formatDate(article.publishedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom 3-column grid */}
      {bottomGridArticles.length > 0 && (
        <div className={styles.threeColGrid}>
          {bottomGridArticles.map((article) => (
            <div key={article.id} className={styles.threeColCard}>
              <div className={`${styles.newsCard} ${article.category === 'BREAKING' ? styles.breaking : ''}`}>
                <img 
                  src={imgErrors[article.id] ? DEFAULT_PLACEHOLDER : article.imageUrl || DEFAULT_PLACEHOLDER} 
                  alt={article.title} 
                  className={styles.newsImage}
                  onError={() => handleImageError(article.id)}
                />
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    {article.category === 'BREAKING' ? (
                      <span className={styles.breakingTag}>BREAKING</span>
                    ) : (
                      <span className={styles.category}>{article.category.toUpperCase()}</span>
                    )}
                    <span className={styles.source}>{article.source}</span>
                  </div>
                  <h3 className={styles.title}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                    </a>
                  </h3>
                  <p className={styles.author}>
                    {article.author || 'Unknown'} • {formatDate(article.publishedAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Load more button */}
      {hasMoreCards && (
        <div ref={loadMoreRef} className={styles.loadMoreContainer}>
          {isLoading ? (
            <div className={styles.loadingMore}>Loading more news...</div>
          ) : (
            <button 
              className={styles.loadMoreButton} 
              onClick={loadMoreCards}
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsGrid; 