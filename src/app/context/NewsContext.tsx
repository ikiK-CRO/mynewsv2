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

// Provider component
export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for articles
  const [articles, setArticles] = useState<UnifiedArticle[]>([]);
  const [latestNews, setLatestNews] = useState<UnifiedArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<UnifiedArticle[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Category state
  const [activeCategory, setActiveCategory] = useState<string>('general');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UnifiedArticle[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  // Pagination state for latest news
  const [latestNewsPage, setLatestNewsPage] = useState<number>(1);
  const [latestNewsLoading, setLatestNewsLoading] = useState<boolean>(false);
  const [hasMoreLatestNews, setHasMoreLatestNews] = useState<boolean>(true);
  
  // Get current auth state
  const { user } = useAuth();
  
  // Refs to prevent unnecessary fetches
  const isMounted = useRef(true);
  const isLoadingRef = useRef<boolean>(false);
  const lastCategoryRef = useRef<string>(activeCategory);
  const lastAuthStateRef = useRef<boolean>(!!user);
  const initialLoadDone = useRef<boolean>(false);
  
  // Local storage keys
  const CATEGORY_STORAGE_KEY = 'news_app_state';
  const NAVIGATION_STORAGE_KEY = 'news_navigation_state';
  
  // Load saved state from local storage on initial mount
  useEffect(() => {
    try {
      // Check for navigation flags first
      const navigationState = localStorage.getItem(NAVIGATION_STORAGE_KEY);
      if (navigationState) {
        const { from_signin, from_favorites, timestamp } = JSON.parse(navigationState);
        
        // Only use navigation flags if they're recent (< 10 seconds)
        const isRecent = (Date.now() - timestamp) < 10000;
        
        if (isRecent) {
          console.log(`[NewsContext] Detected navigation from ${from_signin ? 'signin' : 'favorites'}`);
          // Force a refresh by clearing the initialLoadDone flag
          initialLoadDone.current = false;
          
          // Clear the navigation flag
          localStorage.removeItem(NAVIGATION_STORAGE_KEY);
        }
      }
      
      // Then check for saved category
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
  
  // Save category to local storage when it changes
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
  
  // Fetch news when category changes or auth state changes
  const fetchNews = useCallback(async () => {
    if (isLoadingRef.current || !isMounted.current) {
      console.log('[NewsContext] Skipping fetch - already loading or unmounted');
      return;
    }
    
    // Skip fetching for favorites category
    if (activeCategory === 'favorites') {
      console.log('[NewsContext] Skipping API calls for favorites category');
      setLoading(false);
      return;
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    console.log(`[NewsContext] Fetching news for category: ${activeCategory}`);
    
    try {
      // Fetch category articles first
      const categoryArticles = await getNewsByCategory(activeCategory);
      
      if (!isMounted.current) return;
      
      if (categoryArticles.length > 0) {
        console.log(`[NewsContext] Received ${categoryArticles.length} articles for ${activeCategory}`);
        setArticles(categoryArticles);
      } else {
        console.warn(`[NewsContext] Received 0 articles for ${activeCategory}`);
      }
      
      // Fetch latest news and breaking news in parallel
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
        
        // Update pagination state
        setLatestNewsPage(1);
        setHasMoreLatestNews(latest.length > 0);
        
        // Update refs
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
      
      setError(err instanceof Error ? err : new Error('Failed to fetch news'));
      console.error('[NewsContext] Error fetching news:', err);
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [activeCategory, user]);
  
  // Detect category changes and trigger fetch
  useEffect(() => {
    console.log(`[NewsContext] Category effect - current: ${activeCategory}, last: ${lastCategoryRef.current}`);
    
    // Skip if we're just initializing and haven't changed category
    if (!initialLoadDone.current && activeCategory === lastCategoryRef.current) {
      console.log('[NewsContext] Initial load - fetching news');
      fetchNews();
      return;
    }
    
    // If category changed, update the ref and fetch new data
    if (activeCategory !== lastCategoryRef.current) {
      console.log(`[NewsContext] Category changed from ${lastCategoryRef.current} to ${activeCategory}`);
      lastCategoryRef.current = activeCategory;
      
      // Clear articles immediately when category changes to avoid showing stale data
      setArticles([]);
      
      // Fetch news for the new category
      fetchNews();
    }
    
    // If auth state changed, also fetch new data
    const currentAuth = !!user;
    if (currentAuth !== lastAuthStateRef.current) {
      console.log(`[NewsContext] Auth state changed from ${lastAuthStateRef.current} to ${currentAuth}`);
      lastAuthStateRef.current = currentAuth;
      fetchNews();
    }
  }, [activeCategory, user, fetchNews]);
  
  // Load more latest news
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
        
        // Add new items avoiding duplicates
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
  
  // Search functionality
  const searchNews = useCallback((term: string) => {
    setSearchTerm(term);
    setSearchLoading(true);
    
    // Combine all articles for searching
    const allArticles = [
      ...articles,
      ...latestNews,
      ...breakingNews
    ];
    
    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.id, article])).values()
    );
    
    // Filter based on search term
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
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);
  
  // Manual refresh function
  const refreshNews = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);
  
  // Context value
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