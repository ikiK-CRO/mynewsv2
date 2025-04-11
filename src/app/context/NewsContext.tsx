'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { UnifiedArticle } from '../types/news';
import { getLatestNews, getNewsByCategory, getBreakingNews } from '../services/newsService';
import { useAuth } from './AuthContext';

// Define the shape of our context
interface NewsContextType {
  // Article data
  articles: UnifiedArticle[];
  latestNews: UnifiedArticle[];
  breakingNews: UnifiedArticle[];
  
  // Loading states
  loading: boolean;
  latestNewsLoading: boolean;
  hasMoreLatestNews: boolean;
  
  // Category state
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  
  // Search state
  searchTerm: string;
  searchResults: UnifiedArticle[];
  searchLoading: boolean;
  searchNews: (term: string) => void;
  clearSearch: () => void;
  
  // Actions
  refreshNews: () => Promise<void>;
  loadMoreLatestNews: () => Promise<void>;
}

// Create context with a default undefined value
const NewsContext = createContext<NewsContextType | undefined>(undefined);

// Create a hook to use the context
export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

/**
 * Context provider for news-related state and functionality
 * Manages articles, categories, sources, and loading states
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const NewsProvider = ({ children }: { children: React.ReactNode }) => {
  const [articles, setArticles] = useState<UnifiedArticle[]>([]);
  const [latestNews, setLatestNews] = useState<UnifiedArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<UnifiedArticle[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [activeSource, setActiveSource] = useState<string>('newsapi');
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UnifiedArticle[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  const [latestNewsPage, setLatestNewsPage] = useState<number>(1);
  const [latestNewsLoading, setLatestNewsLoading] = useState<boolean>(false);
  const [hasMoreLatestNews, setHasMoreLatestNews] = useState<boolean>(true);
  
  const { user } = useAuth();
  
  const isMounted = useRef(true);
  const isLoadingRef = useRef<boolean>(false);
  const lastCategoryRef = useRef<string>(activeCategory);
  const lastAuthStateRef = useRef<boolean>(!!user);
  const initialLoadDone = useRef<boolean>(false);
  
  const CATEGORY_STORAGE_KEY = 'news_app_state';
  const NAVIGATION_STORAGE_KEY = 'news_navigation_state';
  
  useEffect(() => {
    try {
      const navigationState = localStorage.getItem(NAVIGATION_STORAGE_KEY);
      if (navigationState) {
        const { from_signin, from_favorites, timestamp } = JSON.parse(navigationState);
        
        const isRecent = (Date.now() - timestamp) < 10000;
        
        if (isRecent) {
          console.log(`[NewsContext] Detected navigation from ${from_signin ? 'signin' : 'favorites'}`);
          initialLoadDone.current = false;
          
          localStorage.removeItem(NAVIGATION_STORAGE_KEY);
        }
      }
      
      const savedState = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (savedState) {
        const { category } = JSON.parse(savedState);
        if (category) {
          console.log('[NewsContext] Restoring category from localStorage:', category);
          setActiveCategory(category);
          lastCategoryRef.current = category;
        }
      }
    } catch (err) {
      console.error('[NewsContext] Error loading state from localStorage:', err);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify({ 
        category: activeCategory,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('[NewsContext] Error saving state to localStorage:', err);
    }
  }, [activeCategory]);
  
  const fetchNews = useCallback(async (forceRefresh: boolean = false) => {
    if (isLoadingRef.current || !isMounted.current) {
      console.log('[NewsContext] Skipping fetch - already loading or unmounted');
      return;
    }
    
    if (activeCategory === 'favorites') {
      console.log('[NewsContext] Skipping API calls for favorites category');
      setLoading(false);
      return;
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    console.log(`[NewsContext] Fetching news for category: ${activeCategory}${forceRefresh ? ' (forced refresh)' : ''}`);
    
    try {
      // Add timestamp to force cache invalidation if needed
      const timestamp = forceRefresh ? `&_t=${Date.now()}` : '';
      const categoryArticles = await getNewsByCategory(activeCategory);
      
      if (!isMounted.current) return;
      
      if (categoryArticles.length > 0) {
        console.log(`[NewsContext] Received ${categoryArticles.length} articles for ${activeCategory}`);
        setArticles(categoryArticles);
      } else {
        console.warn(`[NewsContext] Received 0 articles for ${activeCategory}`);
      }
      
      Promise.all([
        getLatestNews(1),
        getBreakingNews()
      ]).then(([latest, breaking]) => {
        if (!isMounted.current) return;
        
        console.log(`[NewsContext] Received ${latest.length} latest articles and ${breaking.length} breaking news`);
        
        if (latest.length > 0) {
          setLatestNews(latest);
        }
        
        if (breaking.length > 0) {
          setBreakingNews(breaking);
        }
        
        setLatestNewsPage(1);
        setHasMoreLatestNews(latest.length > 0);
        
        lastCategoryRef.current = activeCategory;
        lastAuthStateRef.current = !!user;
        initialLoadDone.current = true;
      }).catch(err => {
        console.error('[NewsContext] Error fetching additional data:', err);
      }).finally(() => {
        if (isMounted.current) {
          setLoading(false);
          isLoadingRef.current = false;
        }
      });
    } catch (err) {
      if (!isMounted.current) return;
      
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      console.error('[NewsContext] Error fetching news:', err);
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [activeCategory, user]);
  
  useEffect(() => {
    console.log(`[NewsContext] Category effect - current: ${activeCategory}, last: ${lastCategoryRef.current}`);
    
    if (!initialLoadDone.current && activeCategory === lastCategoryRef.current) {
      console.log('[NewsContext] Initial load - fetching news');
      fetchNews(true);
      return;
    }
    
    if (activeCategory !== lastCategoryRef.current) {
      console.log(`[NewsContext] Category changed from ${lastCategoryRef.current} to ${activeCategory}`);
      lastCategoryRef.current = activeCategory;
      
      setArticles([]);
      
      fetchNews(true);
    }
    
    const currentAuth = !!user;
    if (currentAuth !== lastAuthStateRef.current) {
      console.log(`[NewsContext] Auth state changed from ${lastAuthStateRef.current} to ${currentAuth}`);
      lastAuthStateRef.current = currentAuth;
      fetchNews(true);
    }
  }, [activeCategory, user, fetchNews]);
  
  const loadMoreLatestNews = useCallback(async () => {
    if (latestNewsLoading || !hasMoreLatestNews || !isMounted.current) return;
    
    setLatestNewsLoading(true);
    try {
      const nextPage = latestNewsPage + 1;
      const moreLatestNews = await getLatestNews(nextPage);
      
      if (!isMounted.current) return;
      
      if (moreLatestNews.length === 0) {
        setHasMoreLatestNews(false);
      } else {
        setLatestNewsPage(nextPage);
        
        setLatestNews(prev => {
          const prevIds = new Set(prev.map(article => article.id));
          const uniqueNewArticles = moreLatestNews.filter(article => !prevIds.has(article.id));
          return [...prev, ...uniqueNewArticles];
        });
      }
    } catch (err) {
      console.error('[NewsContext] Error loading more latest news:', err);
    } finally {
      if (isMounted.current) {
        setLatestNewsLoading(false);
      }
    }
  }, [latestNewsPage, latestNewsLoading, hasMoreLatestNews]);
  
  const searchNews = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchLoading(true);
    
    const allArticles = [
      ...articles,
      ...latestNews,
      ...breakingNews
    ];
    
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.id, article])).values()
    );
    
    const results = uniqueArticles.filter(article => {
      const searchLower = term.toLowerCase();
      return (
        article.title.toLowerCase().includes(searchLower) ||
        (article.description && article.description.toLowerCase().includes(searchLower)) ||
        (article.author && article.author.toLowerCase().includes(searchLower)) ||
        article.source.toLowerCase().includes(searchLower) ||
        article.category.toLowerCase().includes(searchLower)
      );
    });
    
    setSearchResults(results);
    setSearchLoading(false);
  }, [articles, latestNews, breakingNews]);
  
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);
  
  const refreshNews = useCallback(async () => {
    await fetchNews(true); // Force refresh when manually refreshing
  }, [fetchNews]);
  
  const value = {
    articles,
    latestNews,
    breakingNews,
    loading,
    latestNewsLoading,
    hasMoreLatestNews,
    activeCategory,
    setActiveCategory,
    searchTerm,
    searchResults,
    searchLoading,
    searchNews,
    clearSearch,
    refreshNews,
    loadMoreLatestNews
  };
  
  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

export default NewsContext; 