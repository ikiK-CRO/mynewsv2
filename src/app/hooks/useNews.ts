import { useState, useEffect } from 'react';
import { UnifiedArticle } from '../types/news';
import { getLatestNews, getNewsByCategory, getBreakingNews } from '../services/newsService';

interface UseNewsReturn {
  articles: UnifiedArticle[];
  latestNews: UnifiedArticle[];
  breakingNews: UnifiedArticle[];
  loading: boolean;
  error: Error | null;
  refreshNews: () => Promise<void>;
}

export default function useNews(category: string = 'general'): UseNewsReturn {
  const [articles, setArticles] = useState<UnifiedArticle[]>([]);
  const [latestNews, setLatestNews] = useState<UnifiedArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<UnifiedArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [categoryArticles, latest, breaking] = await Promise.all([
        getNewsByCategory(category),
        getLatestNews(),
        getBreakingNews()
      ]);
      
      setArticles(categoryArticles);
      setLatestNews(latest);
      setBreakingNews(breaking);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred fetching news'));
      console.error('Error in useNews hook:', err);
    } finally {
      setLoading(false);
    }
  };

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
    refreshNews
  };
} 