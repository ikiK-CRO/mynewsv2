'use client';

import styles from './LatestNews.module.scss';
import Link from 'next/link';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { UnifiedArticle } from '../types/news';
import BookmarkButton from './BookmarkButton';
import { useAuth } from '../context/AuthContext';
import { useArticles } from '../context/ArticleContext';

interface LatestNewsProps {
  latestNews?: UnifiedArticle[];
  loading?: boolean;
  loadMoreLatestNews?: () => Promise<void>;
  latestNewsLoading?: boolean;
  hasMoreLatestNews?: boolean;
}

// Add skeleton loading for LatestNews widget
const LatestNewsSkeleton = () => (
  <div className={styles.newsItemSkeleton}>
    <div className={styles.newsItemHeader}>
      <span className={`${styles.timeSkeleton} ${styles.shimmer}`}></span>
      <span className={`${styles.sourceSkeleton} ${styles.shimmer}`}></span>
    </div>
    <div className={styles.titleWrapper}>
      <div className={`${styles.titleSkeleton} ${styles.shimmer}`}></div>
    </div>
  </div>
);

const LatestNews: React.FC<LatestNewsProps> = ({
  latestNews: propLatestNews,
  loading: propLoading,
  loadMoreLatestNews: propLoadMoreLatestNews,
  latestNewsLoading: propLatestNewsLoading,
  hasMoreLatestNews: propHasMoreLatestNews
}) => {
  // Use context values if props are not provided
  const { 
    latestNews: contextLatestNews, 
    loading: contextLoading,
    loadMoreLatestNews: contextLoadMoreLatestNews,
    latestNewsLoading: contextLatestNewsLoading,
    hasMoreLatestNews: contextHasMoreLatestNews
  } = useArticles();
  
  // Use props if provided, otherwise use context values
  const latestNews = propLatestNews || contextLatestNews;
  const loading = propLoading ?? contextLoading;
  const loadMoreLatestNews = propLoadMoreLatestNews || contextLoadMoreLatestNews;
  const latestNewsLoading = propLatestNewsLoading ?? contextLatestNewsLoading;
  const hasMoreLatestNews = propHasMoreLatestNews ?? contextHasMoreLatestNews;
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const newsListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [key, setKey] = useState(0); // Add a key to force re-render
  const [isMobile, setIsMobile] = useState(false);

  // Force re-render when auth state changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [user]);

  // Add this effect to handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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

  // Update rendering for loading state
  if (loading && latestNews.length === 0) {
    return (
      <aside className={styles.latestNews}>
        <h2 className={styles.heading}>
          <span className={styles.icon}></span> Latest news
        </h2>
        <div className={styles.newsList}>
          {Array.from({ length: 5 }).map((_, index) => (
            <LatestNewsSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </aside>
    );
  }

  // Update news item rendering to include fade-in effects
  return (
    <aside className={`${styles.latestNews} ${isMobile ? styles.mobileLatestNews : ''}`} key={key}>
      <h2 className={styles.heading}>
        <span className={styles.icon}></span> Latest news
      </h2>
      <div className={styles.newsList} ref={newsListRef}>
        {latestNews && latestNews.length > 0 ? (
          <>
            {latestNews.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className={`${styles.newsItem} ${styles.fadeIn}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
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
                    title={item.title}
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