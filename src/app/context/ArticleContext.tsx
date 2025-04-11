'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { UnifiedArticle } from '../types/news';
import { getLatestNews, getNewsByCategory, getBreakingNews } from '../services/newsService';
import { useAuth } from './AuthContext';

// Define the shape of our context
interface ArticleContextType {
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
  
  // Actions
  refreshNews: () => Promise<void>;
  loadMoreLatestNews: () => Promise<void>;
}

// Create context with a default undefined value
const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

// Create a hook to use the context
export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};

/**
 * Context provider for article-related state and functionality
 * Manages articles, categories, and loading states
 */
export const ArticleProvider = ({ children }: { children: React.ReactNode }) => {
  const [articles, setArticles] = useState<UnifiedArticle[]>([]);
  const [latestNews, setLatestNews] = useState<UnifiedArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<UnifiedArticle[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState<string>('general');
  
  const [latestNewsPage, setLatestNewsPage] = useState<number>(1);
  const [latestNewsLoading, setLatestNewsLoading] = useState<boolean>(false);
  const [hasMoreLatestNews, setHasMoreLatestNews] = useState<boolean>(true);
  
  const { user } = useAuth();
  
  const isMounted = useRef(true);
  const isLoadingRef = useRef<boolean>(false);
  const lastCategoryRef = useRef<string>(activeCategory);
  const lastAuthStateRef = useRef<boolean>(!!user);
  const initialLoadDone = useRef<boolean>(false);
  
  const CATEGORY_STORAGE_KEY = 'news_app_category';
  
  // Restore category from localStorage on mount
  useEffect(() => {
    try {
      const savedCategory = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (savedCategory) {
        setActiveCategory(savedCategory);
        lastCategoryRef.current = savedCategory;
      }
    } catch (err) {
      console.error('[ArticleContext] Error restoring category:', err);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Save category to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, activeCategory);
    } catch (err) {
      console.error('[ArticleContext] Error saving category:', err);
    }
  }, [activeCategory]);
  
  // Fetch news when category changes or auth state changes
  useEffect(() => {
    const fetchNews = async () => {
      // Skip if already loading or component unmounted
      if (isLoadingRef.current || !isMounted.current) return;
      
      // Skip if category hasn't changed and we've already loaded
      if (activeCategory === lastCategoryRef.current && 
          initialLoadDone.current && 
          !!user === lastAuthStateRef.current) {
        return;
      }
      
      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);
        
        console.log(`[ArticleContext] Fetching news for category: ${activeCategory}`);
        
        // Fetch category-specific news
        const categoryNews = await getNewsByCategory(activeCategory);
        
        // Fetch breaking news
        const breaking = await getBreakingNews();
        
        // Fetch latest news (first page)
        const latest = await getLatestNews(1);
        
        if (isMounted.current) {
          setArticles(categoryNews);
          setBreakingNews(breaking);
          setLatestNews(latest);
          setHasMoreLatestNews(latest.length >= 10); // Assuming 10 is the page size
          setLatestNewsPage(1);
          initialLoadDone.current = true;
          lastCategoryRef.current = activeCategory;
          lastAuthStateRef.current = !!user;
        }
      } catch (err) {
        console.error('[ArticleContext] Error fetching news:', err);
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch news');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          isLoadingRef.current = false;
        }
      }
    };
    
    fetchNews();
  }, [activeCategory, user]);
  
  // Load more latest news
  const loadMoreLatestNews = useCallback(async (forceRefresh = false) => {
    if (latestNewsLoading || (!hasMoreLatestNews && !forceRefresh)) return;
    
    try {
      setLatestNewsLoading(true);
      
      const nextPage = forceRefresh ? 1 : latestNewsPage + 1;
      const newArticles = await getLatestNews(nextPage);
      
      if (isMounted.current) {
        if (forceRefresh) {
          setLatestNews(newArticles);
        } else {
          setLatestNews(prev => [...prev, ...newArticles]);
        }
        
        setLatestNewsPage(nextPage);
        setHasMoreLatestNews(newArticles.length >= 10); // Assuming 10 is the page size
      }
    } catch (err) {
      console.error('[ArticleContext] Error loading more latest news:', err);
    } finally {
      if (isMounted.current) {
        setLatestNewsLoading(false);
      }
    }
  }, [latestNewsLoading, hasMoreLatestNews, latestNewsPage]);
  
  // Refresh news
  const refreshNews = useCallback(async () => {
    await loadMoreLatestNews(true);
  }, [loadMoreLatestNews]);
  
  return (
    <ArticleContext.Provider
      value={{
        articles,
        latestNews,
        breakingNews,
        loading,
        latestNewsLoading,
        hasMoreLatestNews,
        activeCategory,
        setActiveCategory,
        refreshNews,
        loadMoreLatestNews
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
}; 