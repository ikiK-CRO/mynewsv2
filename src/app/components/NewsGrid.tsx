'use client';

import styles from './NewsGrid.module.scss';
import React from 'react';
import { UnifiedArticle } from '../types/news';

interface NewsGridProps {
  articles: UnifiedArticle[];
  loading: boolean;
}

const NewsGrid: React.FC<NewsGridProps> = ({ articles, loading }) => {
  if (loading) {
    return <div className={styles.loading}>Loading news...</div>;
  }

  if (!articles || articles.length === 0) {
    return <div className={styles.noResults}>No news articles found.</div>;
  }

  // Format a date string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.newsGrid}>
      {articles.map((article) => (
        <div 
          key={article.id} 
          className={`${styles.newsCard} ${article.category === 'BREAKING' ? styles.breaking : ''}`}
        >
          <img 
            src={article.imageUrl || 'https://via.placeholder.com/400x250/E8E8E8/AAAAAA?text=No+Image'} 
            alt={article.title} 
            className={styles.newsImage} 
          />
          <div className={styles.cardContent}>
            {article.category === 'BREAKING' ? (
              <span className={styles.breakingTag}>BREAKING</span>
            ) : (
              <span className={styles.category}>{article.category.toUpperCase()}</span>
            )}
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