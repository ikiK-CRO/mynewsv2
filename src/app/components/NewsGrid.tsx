'use client';

import styles from './NewsGrid.module.scss';
import React, { useState } from 'react';
import { UnifiedArticle } from '../types/news';

interface NewsGridProps {
  articles: UnifiedArticle[];
  loading: boolean;
}

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x250/E8E8E8/AAAAAA?text=No+Image';

const NewsGrid: React.FC<NewsGridProps> = ({ articles, loading }) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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

  return (
    <div className={styles.newsGrid}>
      {articles.map((article) => (
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
  );
};

export default NewsGrid; 