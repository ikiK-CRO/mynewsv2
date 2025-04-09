'use client';

import styles from './LatestNews.module.scss';
import Link from 'next/link';
import React, { useEffect, useRef, useCallback } from 'react';
import { UnifiedArticle } from '../types/news';
import BookmarkButton from './BookmarkButton';

interface LatestNewsProps {
  latestNews: UnifiedArticle[];
  loading: boolean;
  loadMoreLatestNews: () => Promise<void>;
  latestNewsLoading: boolean;
  hasMoreLatestNews: boolean;
}

const LatestNews: React.FC<LatestNewsProps> = ({
  latestNews,
  loading,
  loadMoreLatestNews,
  latestNewsLoading,
  hasMoreLatestNews
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const newsListRef = useRef<HTMLDivElement>(null);

  // Format time with date context
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Formatting options
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    // Check if article is from today
    const isToday = date.toDateString() === now.toDateString();
    
    // Check if article is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    // Format based on how recent the article is
    if (isToday) {
      return date.toLocaleTimeString('en-US', timeOptions);
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', timeOptions)}`;
    } else {
      // For older articles, include the date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...timeOptions
      });
    }
  };

  // Set up intersection observer for infinite scroll
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!loadMoreRef.current || !newsListRef.current) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreLatestNews && !latestNewsLoading) {
          console.log('[LatestNews] Intersection observer triggered, loading more news...');
          loadMoreLatestNews();
        }
      },
      { 
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(loadMoreRef.current);
  }, [hasMoreLatestNews, latestNewsLoading, loadMoreLatestNews]);

  useEffect(() => {
    // Need to wait a bit for the DOM to be ready
    const timer = setTimeout(() => {
      setupObserver();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupObserver, latestNews]);

  // Manual scroll handler as a fallback
  const handleScroll = useCallback(() => {
    if (!newsListRef.current || !loadMoreRef.current || latestNewsLoading || !hasMoreLatestNews) return;
    
    const container = newsListRef.current;
    const loadMoreElement = loadMoreRef.current;
    
    const containerRect = container.getBoundingClientRect();
    const loadMoreRect = loadMoreElement.getBoundingClientRect();
    
    // Check if loadMore element is visible in the container
    if (loadMoreRect.top <= containerRect.bottom + 50) {
      console.log('Scroll handler loading more news...');
      loadMoreLatestNews();
    }
  }, [latestNewsLoading, hasMoreLatestNews, loadMoreLatestNews]);

  useEffect(() => {
    const newsListElement = newsListRef.current;
    if (newsListElement) {
      newsListElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (newsListElement) {
        newsListElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  if (loading && latestNews.length === 0) {
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
      <div className={styles.newsList} ref={newsListRef}>
        {latestNews && latestNews.length > 0 ? (
          <>
            {latestNews.map((item, index) => (
              <div key={`${item.id}-${index}`} className={styles.newsItem}>
                <div className={styles.newsItemHeader}>
                  <span className={styles.time}>{formatTime(item.publishedAt)}</span>
                  <span className={styles.source}>{item.source}</span>
                </div>
                <div className={styles.titleWrapper}>
                  <a 
                    href={item.url} 
                    className={styles.titleLink}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {item.title}
                  </a>
                  <div className={styles.bookmarkWrapper}>
                    <BookmarkButton article={item} position="bottom-right" />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Invisible loading indicator for infinite scroll */}
            <div ref={loadMoreRef} className={styles.loadMoreIndicator}>
              {latestNewsLoading && (
                <div className={styles.loadingSpinner}>
                  <span className={styles.loadingDots}>Loading...</span>
                </div>
              )}
            </div>
          </>
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