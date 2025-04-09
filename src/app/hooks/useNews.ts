import { useState, useEffect, useCallback, useRef } from 'react';
import { UnifiedArticle } from '../types/news';
import { getLatestNews, getNewsByCategory, getBreakingNews } from '../services/newsService';

interface UseNewsReturn {
  articles: UnifiedArticle[];
  latestNews: UnifiedArticle[];
  breakingNews: UnifiedArticle[];
  loading: boolean;
  error: Error | null;
  refreshNews: () => Promise<void>;
  loadMoreLatestNews: () => Promise<void>;
  latestNewsLoading: boolean;
  hasMoreLatestNews: boolean;
  searchResults: UnifiedArticle[];
  searchLoading: boolean;
  searchTerm: string;
  searchNews: (term: string) => void;
  clearSearch: () => void;
}

export default function useNews(category: string = 'general'): UseNewsReturn {
  const [articles, setArticles] = useState<UnifiedArticle[]>([]);
  const [latestNews, setLatestNews] = useState<UnifiedArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<UnifiedArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UnifiedArticle[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  // Pagination state for latest news
  const [latestNewsPage, setLatestNewsPage] = useState<number>(1);
  const [latestNewsLoading, setLatestNewsLoading] = useState<boolean>(false);
  const [hasMoreLatestNews, setHasMoreLatestNews] = useState<boolean>(true);

  // Refs to prevent unnecessary fetches
  const isMounted = useRef(true);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCategoryRef = useRef<string>(category);
  const isLoadingRef = useRef<boolean>(false);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, []);

  const fetchNews = useCallback(async () => {
    // Prevent duplicate fetches
    if (isLoadingRef.current || !isMounted.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    console.log(`[useNews] Fetching news for category: ${category}`);
    
    try {
      // Fetch category articles first for faster UI response
      const categoryArticles = await getNewsByCategory(category);
      
      if (isMounted.current) {
        setArticles(categoryArticles);
        
        // Continue loading other data in parallel
        Promise.all([
          getLatestNews(1),
          getBreakingNews()
        ]).then(([latest, breaking]) => {
          if (isMounted.current) {
            setLatestNews(latest);
            setBreakingNews(breaking);
            
            // Reset pagination state
            setLatestNewsPage(1);
            setHasMoreLatestNews(latest.length > 0);
            
            // Update last fetched category
            lastCategoryRef.current = category;
          }
        }).catch(err => {
          console.error('Error fetching additional news data:', err);
        }).finally(() => {
          if (isMounted.current) {
            setLoading(false);
            isLoadingRef.current = false;
          }
        });
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('An error occurred fetching news'));
        console.error('Error in useNews hook:', err);
        setLoading(false);
        isLoadingRef.current = false;
      }
    }
  }, [category]);

  // Function to load more latest news
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
        // Ensure we don't add duplicate articles
        setLatestNews(prev => {
          const prevIds = new Set(prev.map(article => article.id));
          const uniqueNewArticles = moreLatestNews.filter(article => !prevIds.has(article.id));
          return [...prev, ...uniqueNewArticles];
        });
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Error loading more latest news:', err);
      }
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
    
    // Combine all articles to search through
    const allArticles = [
      ...articles,
      ...latestNews,
      ...breakingNews
    ];
    
    // Remove duplicates by id
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.id, article])).values()
    );
    
    // Filter articles based on search term
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

  // Fetch news when the category changes, with debounce
  useEffect(() => {
    // Skip API calls when we're on the favorites page 
    if (typeof window !== 'undefined' && window.IS_FAVORITES_PAGE) {
      console.log('[useNews] Skipping API calls on favorites page');
      setLoading(false);
      return;
    }
    
    // Skip if category hasn't changed to avoid duplicate fetches
    if (category === lastCategoryRef.current && articles.length > 0) {
      console.log(`[useNews] Skipping duplicate fetch for category ${category}`);
      return;
    }
    
    // Clear any existing timer
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    
    // Debounce API calls to prevent excessive requests during navigation
    fetchTimerRef.current = setTimeout(() => {
      fetchNews();
    }, 300);
    
    // Cleanup timer on unmount or category change
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, [category, fetchNews, articles.length]);

  // Function to manually refresh the news
  const refreshNews = useCallback(async () => {
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    
    await fetchNews();
  }, [fetchNews]);

  return {
    articles,
    latestNews,
    breakingNews,
    loading,
    error,
    refreshNews,
    loadMoreLatestNews,
    latestNewsLoading,
    hasMoreLatestNews,
    searchResults,
    searchLoading,
    searchTerm,
    searchNews,
    clearSearch
  };
} 