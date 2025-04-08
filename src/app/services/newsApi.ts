import { NewsApiResponse, NewsApiArticle, UnifiedArticle } from '../types/news';

const NEWS_API_KEY = '66cd839177a64d2180038f004e300d2b';
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchTopHeadlines(category: string = ''): Promise<NewsApiResponse> {
  const params = new URLSearchParams({
    apiKey: NEWS_API_KEY,
    language: 'en',
    ...(category && category !== 'general' ? { category } : {})
  });

  const response = await fetch(`${BASE_URL}/top-headlines?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch top headlines: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchEverything(query: string, sortBy: string = 'publishedAt'): Promise<NewsApiResponse> {
  const params = new URLSearchParams({
    apiKey: NEWS_API_KEY,
    q: query,
    sortBy,
    language: 'en'
  });

  const response = await fetch(`${BASE_URL}/everything?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch everything: ${response.statusText}`);
  }
  
  return response.json();
}

export function mapNewsApiToUnified(article: NewsApiArticle): UnifiedArticle {
  return {
    id: article.url,
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    imageUrl: article.urlToImage,
    publishedAt: article.publishedAt,
    source: article.source.name,
    author: article.author,
    category: 'general' // Default category, can be overridden
  };
}

export async function getTopHeadlinesByCategory(category: string = ''): Promise<UnifiedArticle[]> {
  try {
    const data = await fetchTopHeadlines(category);
    return data.articles.map(article => mapNewsApiToUnified({
      ...article,
      // Override category if provided
      source: { 
        ...article.source,
        name: article.source.name
      }
    })).map(article => ({
      ...article,
      category: category || 'general'
    }));
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    return [];
  }
} 