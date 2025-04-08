'use client';

import styles from './LatestNews.module.scss';
import Link from 'next/link';
import React from 'react';
import { UnifiedArticle } from '../types/news';

interface LatestNewsProps {
  latestNews: UnifiedArticle[];
  loading: boolean;
}

const LatestNews: React.FC<LatestNewsProps> = ({ latestNews, loading }) => {
  // Format time as HH:MM
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  if (loading) {
    return (
      <aside className={styles.latestNews}>
        <h2 className={styles.heading}>
          <span className={styles.icon}></span> Latest news
        </h2>
        <div className={styles.newsList}>
          <p>Loading latest news...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.latestNews}>
      <h2 className={styles.heading}>
        <span className={styles.icon}></span> Latest news
      </h2>
      <div className={styles.newsList}>
        {latestNews && latestNews.length > 0 ? (
          latestNews.map((item) => (
            <div key={item.id} className={styles.newsItem}>
              <span className={styles.time}>{formatTime(item.publishedAt)}</span>
              <a 
                href={item.url} 
                className={styles.titleLink}
                target="_blank" 
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            </div>
          ))
        ) : (
          <p>No latest news available</p>
        )}
      </div>
      <Link href="/all-news" className={styles.seeAllLink}>
        See all news &gt;
      </Link>
    </aside>
  );
};

export default LatestNews; 