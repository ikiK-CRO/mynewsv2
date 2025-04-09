import { useState, useEffect, useCallback } from 'react';
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

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [categoryArticles, latest, breaking] = await Promise.all([
        getNewsByCategory(category),
        getLatestNews(1), // Reset to page 1
        getBreakingNews()
      ]);
      
      setArticles(categoryArticles);
      setLatestNews(latest);
      setBreakingNews(breaking);
      
      // Reset pagination state
      setLatestNewsPage(1);
      setHasMoreLatestNews(latest.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred fetching news'));
      console.error('Error in useNews hook:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to load more latest news
  const loadMoreLatestNews = useCallback(async () => {
    if (latestNewsLoading || !hasMoreLatestNews) return;
    
    setLatestNewsLoading(true);
    try {
      const nextPage = latestNewsPage + 1;
      const moreLatestNews = await getLatestNews(nextPage);
      
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
      console.error('Error loading more latest news:', err);
    } finally {
      setLatestNewsLoading(false);
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

  // Fetch news when the category changes
  useEffect(() => {
    fetchNews();
  }, [category]);

  // Function to manually refresh the news
  const refreshNews = async () => {
    await fetchNews();
  };

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