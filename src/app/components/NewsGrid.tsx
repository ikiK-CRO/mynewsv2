'use client';

import styles from './NewsGrid.module.scss';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { UnifiedArticle } from '../types/news';
import AdCard from './AdCard';
import BookmarkButton from './BookmarkButton';
import { useArticles } from '../context/ArticleContext';
import { useSearch } from '../context/SearchContext';

interface NewsGridProps {
  articles?: UnifiedArticle[];
  loading?: boolean;
}

// Number of cards initially visible (2 cards per row for first 2 rows, then 3 cards per row for next 4 rows)
const INITIAL_VISIBLE_CARDS = 4 + (4 * 3); // 16 cards total (4 in first 2 rows, 12 in next 4 rows)
const CARDS_TO_LOAD = 6; // Load 6 more cards at a time (2 rows)
const TOP_GRID_CARDS = 4; // First 4 cards in 2x2 layout
const AD_FREQUENCY = 6; // Insert ad after every 5th article (appears at position 6, 12, 18)

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x250/E8E8E8/AAAAAA?text=No+Image';

// Enhanced skeleton card component with better structure
const NewsCardSkeleton = ({ index }: { index: number }) => (
  <div className={`${styles.newsCard} ${styles.fadeIn} ${styles[`delay-${index + 1}`]}`}>
    <div className={`${styles.skeletonImage} ${styles.shimmer}`}></div>
    <div className={styles.cardContent}>
      <div className={styles.cardHeader}>
        <div className={`${styles.skeletonCategory} ${styles.shimmer}`}></div>
        <div className={`${styles.skeletonSource} ${styles.shimmer}`}></div>
      </div>
      <div className={`${styles.skeletonTitle} ${styles.shimmer}`}></div>
      <div className={`${styles.skeletonAuthor} ${styles.shimmer}`}></div>
    </div>
  </div>
);

const NewsGrid: React.FC<NewsGridProps> = ({ 
  articles: propArticles, 
  loading: propLoading 
}) => {
  // Get context values
  const { articles: contextArticles, loading: contextLoading } = useArticles();
  const { searchResults, searchTerm, searchLoading } = useSearch();
  
  // Use props if provided, otherwise use context values
  const articles = propArticles || contextArticles;
  const loading = propLoading ?? contextLoading;
  
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});
  const [visibleCards, setVisibleCards] = useState<number>(INITIAL_VISIBLE_CARDS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const newsCardRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Determine which articles to display based on search state
  const articlesToDisplay = useMemo(() => {
    if (searchTerm && searchResults) {
      return searchResults;
    }
    return articles;
  }, [articles, searchResults, searchTerm]);
  
  // IMPORTANT: Update the visibleArticles useMemo to be called unconditionally
  // This must come before other hooks to maintain hook ordering
  const visibleArticles = useMemo(() => {
    // Add a check at the beginning of the component to better handle empty article arrays
    console.log(`[NewsGrid] / received ${articlesToDisplay?.length || 0} articles`);
    
    if (!articlesToDisplay || articlesToDisplay.length === 0) {
      console.log('[NewsGrid] No articles to display in useMemo');
      return [];
    }
    
    try {
      console.log('[NewsGrid DEBUG] Articles array changed, length:', articlesToDisplay.length);
      return articlesToDisplay.slice(0, visibleCards);
    } catch (error) {
      console.error('[NewsGrid] Error processing articles in useMemo:', error);
      return [];
    }
  }, [articlesToDisplay, visibleCards]);
  
  // Only log the "No articles received" message if we're not in a loading state
  if (articlesToDisplay?.length === 0 && !loading && !searchLoading) {
    console.log('[NewsGrid] No articles received and not loading');
  }

  // Log the articles received from props on mount and when they change
  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    console.log(`[NewsGrid] ${currentPath} received ${articles?.length || 0} articles`);
    
    if (articles?.length > 0) {
      console.log('[NewsGrid] First few articles:', articles.slice(0, 3).map(a => ({
        id: a.id,
        title: a.title,
        source: a.source
      })));
    } else {
      console.log('[NewsGrid] No articles received');
    }
  }, [articles]);

  // Add debug log to monitor when articles array changes
  useEffect(() => {
    console.log(`[NewsGrid DEBUG] Articles array changed, length: ${articles.length}`);
  }, [articles]);

  const loadMoreCards = useCallback(() => {
    if (isLoading || visibleCards >= articles.length) {
      console.log('[NewsGrid] Skipping loadMore - already loading or at end:', 
                 { isLoading, visibleCards, totalArticles: articles.length });
      return;
    }
    
    console.log('[NewsGrid] Loading more cards:', 
               { current: visibleCards, adding: CARDS_TO_LOAD, total: articles.length });
    
    setIsLoading(true);
    // Simulate loading delay for smoother UX
    setTimeout(() => {
      setVisibleCards(prev => {
        const newValue = Math.min(prev + CARDS_TO_LOAD, articles.length);
        console.log(`[NewsGrid] Increased visible cards from ${prev} to ${newValue}`);
        return newValue;
      });
      setIsLoading(false);
    }, 300);
  }, [isLoading, visibleCards, articles.length]);
  
  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    // Fix lazy loading - ensure loadMoreRef is only observed after articles have loaded
    if (!loadMoreRef.current || articles.length === 0) {
      console.log("[NewsGrid] loadMoreRef not available yet or no articles");
      return;
    }
    
    // If already at max articles, don't set up observer
    if (visibleCards >= articles.length) {
      console.log("[NewsGrid] All articles are already visible, no need for observer");
      return;
    }
    
    console.log("[NewsGrid] Setting up IntersectionObserver", 
               { visibleCards, totalArticles: articles.length });
    
    // Disconnect any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log('[NewsGrid] Observer triggered, loading more cards', 
                     { visible: visibleCards, total: articles.length });
          loadMoreCards();
        } else {
          console.log('[NewsGrid] Observer element visible but not intersecting');
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '500px' // Increased significantly to ensure it triggers earlier
      }
    );
    
    console.log('[NewsGrid] Observing loadMoreRef element');
    observerRef.current.observe(loadMoreRef.current);
    
    return () => {
      if (observerRef.current) {
        console.log("[NewsGrid] Disconnecting IntersectionObserver");
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreCards, articles.length, visibleCards]);
  
  // Function to handle automatic loading after articles are loaded
  useEffect(() => {
    // Log when article count changes
    console.log(`[NewsGrid] Article count changed to ${articles.length}`);
    
    // Reset visible cards if article count is too low
    if (articles.length > 0 && articles.length < visibleCards) {
      console.log(`[NewsGrid] Adjusting visible cards from ${visibleCards} to ${articles.length}`);
      setVisibleCards(articles.length);
    }

    // When articles load, if we don't have the max number of articles visible, force visibility check  
    if (articles.length > 0 && articles.length > visibleCards && !isLoading) {
      // Use a short delay to wait for rendering to complete
      const timer = setTimeout(() => {
        // Check if we need to load more to fill the page
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        console.log(`[NewsGrid] Window height: ${windowHeight}, Document height: ${documentHeight}`);
        
        if (documentHeight <= windowHeight + 200) {
          // Need to load more content to fill the page
          console.log('[NewsGrid] Page needs more content, loading more cards');
          loadMoreCards();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [articles.length, visibleCards, isLoading, loadMoreCards]);

  // Add a scroll handler as a backup to ensure loading
  useEffect(() => {
    const handleScroll = () => {
      if (articles.length <= visibleCards || isLoading) return;
      
      if (loadMoreRef.current) {
        const rect = loadMoreRef.current.getBoundingClientRect();
        // Load more when loader is within 300px of viewport
        if (rect.top < window.innerHeight + 300) {
          console.log('[NewsGrid] Scroll detected loader in view, loading more cards');
          loadMoreCards();
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articles.length, visibleCards, isLoading, loadMoreCards]);

  // Add intersection observer for mobile to handle centered card title expansion
  useEffect(() => {
    // Only for mobile devices
    if (typeof window === 'undefined' || window.innerWidth > 768 || newsCardRefs.current.size === 0) {
      return;
    }
    
    const observerOptions = {
      root: null, // Use viewport
      rootMargin: '-30% 0px -30% 0px', // Trigger when in the middle 40% of the screen
      threshold: 0.7, // Card needs to be 70% visible
    };
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all news cards
    newsCardRefs.current.forEach(card => {
      observer.observe(card);
    });
    
    return () => observer.disconnect();
  }, [visibleArticles]); // Re-run when visible articles change

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

  // Handle image loading
  const handleImageLoad = (id: string) => {
    setImgLoaded(prev => ({
      ...prev,
      [id]: true
    }));
  };
  
  // Handle image errors
  const handleImageError = (id: string) => {
    setImgErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Function to insert ads at regular intervals
  const insertAdsIntoArticles = (articles: UnifiedArticle[], adFrequency: number): (UnifiedArticle | 'ad')[] => {
    const result: (UnifiedArticle | 'ad')[] = [];
    
    // Insert an ad after every 'adFrequency' articles
    for (let i = 0; i < articles.length; i++) {
      result.push(articles[i]);
      
      // Insert an ad after every 6th article (i is 0-indexed, so check for 5, 11, 17, etc.)
      if ((i + 1) % adFrequency === 0 && i < articles.length - 1) {
        result.push('ad');
      }
    }
    
    return result;
  };

  // Get top and bottom sections without special treatment for breaking news
  const topGridArticles = visibleArticles.slice(0, TOP_GRID_CARDS);
  const bottomGridArticles = visibleArticles.slice(TOP_GRID_CARDS);

  // Only insert ads in the bottom grid to avoid disrupting the 2x2 layout of top grid
  const bottomGridArticlesWithAds = insertAdsIntoArticles(bottomGridArticles, AD_FREQUENCY);

  // Check if there are more cards to load
  const hasMoreCards = visibleCards < (articles?.length || 0);

  const renderArticle = (article: UnifiedArticle, index: number) => {
    const isBreakingNews = article.category === 'BREAKING';
    const cardId = article.id || `article-${index}`;
    
    return (
      <article 
        key={cardId} 
        className={`${styles.newsCard} ${isBreakingNews ? styles.breaking : ''} ${styles.fadeIn} ${styles[`delay-${index + 1}`]}`}
        ref={el => {
          if (el) newsCardRefs.current.set(cardId, el);
        }}
      >
        {!isBreakingNews && (
          <img
            className={`${styles.newsImage} ${imgLoaded[article.id] ? styles.loaded : ''}`}
            src={imgErrors[article.id] ? DEFAULT_PLACEHOLDER : (article.imageUrl || DEFAULT_PLACEHOLDER)}
            alt={article.title}
            onLoad={() => handleImageLoad(article.id)}
            onError={() => handleImageError(article.id)}
            loading="lazy"
          />
        )}
        
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            {isBreakingNews ? (
              <>
                <span className={styles.breakingTag}>Breaking</span>
                <span className={styles.source}>{article.source}</span>
              </>
            ) : (
              <>
                <span className={styles.category}>{article.category?.toUpperCase() || 'NEWS'}</span>
                <span className={styles.source}>{article.source}</span>
              </>
            )}
          </div>
          
          <h3 className={styles.title} title={article.title}>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => {
                // Prevent excessive movement on click
                // Add analytics tracking if needed
              }}
            >
              {article.title}
            </a>
          </h3>
          
          {article.author && <p className={styles.author}>By {article.author} • {formatDate(article.publishedAt)}</p>}
        </div>
        
        <BookmarkButton article={article} position="top-right" />
      </article>
    );
  };

  // Enhanced skeleton loading display with the correct card layout
  if (loading && articlesToDisplay.length === 0) {
    return (
      <div className={styles.newsGridWrapper}>
        <div className={styles.newsGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <NewsCardSkeleton key={`skeleton-top-${index}`} index={index} />
          ))}
        </div>
        <div className={styles.threeColGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <NewsCardSkeleton key={`skeleton-bottom-${index}`} index={index + 4} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newsGridWrapper}>
      {/* Top 2x2 grid */}
      <div className={styles.newsGrid}>
        {topGridArticles.map((article) => renderArticle(article, 0))}
      </div>
      
      {/* Bottom 3-column grid with ads */}
      {bottomGridArticlesWithAds.length > 0 && (
        <div className={styles.threeColGrid}>
          {bottomGridArticlesWithAds.map((item, index) => (
            item === 'ad' ? (
              <div key={`ad-${index}`} className={styles.threeColCard}>
                <AdCard />
              </div>
            ) : renderArticle(item, index))
          )}
        </div>
      )}
      
      {/* Invisible loader element for intersection observer */}
      {hasMoreCards && (
        <div ref={loadMoreRef} className={styles.invisibleLoader}>
          {isLoading && <div className={styles.loadingMore}>Loading more news...</div>}
        </div>
      )}
    </div>
  );
};

export default NewsGrid; 