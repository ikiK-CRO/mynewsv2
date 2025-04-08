import { NewsApiResponse, NewsApiArticle, UnifiedArticle } from '../types/news';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
const BASE_URL = 'https://newsapi.org/v2';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/440x293/E8E8E8/AAAAAA?text=News+API';

// Utility function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry logic
async function fetchWithRetry(url: string, maxRetries = 2): Promise<Response> {
  let retries = 0;
  
  while (retries <= maxRetries) {
    const response = await fetch(url);
    
    // If not rate limited or max retries reached, return the response
    if (response.status !== 429 || retries === maxRetries) {
      return response;
    }
    
    // Exponential backoff: wait longer between each retry
    const waitTime = Math.pow(2, retries) * 1000;
    console.log(`Rate limited by News API. Retrying in ${waitTime}ms...`);
    await delay(waitTime);
    retries++;
  }
  
  throw new Error('Unexpected error in fetchWithRetry');
}

export async function fetchTopHeadlines(category: string = ''): Promise<NewsApiResponse> {
  if (!NEWS_API_KEY) {
    throw new Error('NewsAPI key is missing. Please check your environment variables.');
  }

  const params = new URLSearchParams({
    apiKey: NEWS_API_KEY,
    language: 'en',
    ...(category && category !== 'general' ? { category } : {})
  });

  try {
    const response = await fetchWithRetry(`${BASE_URL}/top-headlines?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top headlines: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    throw error;
  }
}

export async function fetchEverything(query: string, sortBy: string = 'publishedAt'): Promise<NewsApiResponse> {
  if (!NEWS_API_KEY) {
    throw new Error('NewsAPI key is missing. Please check your environment variables.');
  }

  const params = new URLSearchParams({
    apiKey: NEWS_API_KEY,
    q: query,
    sortBy,
    language: 'en'
  });

  try {
    const response = await fetchWithRetry(`${BASE_URL}/everything?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch everything: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching everything:', error);
    throw error;
  }
}

export function mapNewsApiToUnified(article: NewsApiArticle): UnifiedArticle {
  return {
    id: article.url,
    title: article.title || 'No Title Available',
    description: article.description || 'No description available',
    content: article.content,
    url: article.url,
    imageUrl: article.urlToImage || PLACEHOLDER_IMAGE,
    publishedAt: article.publishedAt,
    source: article.source?.name || 'News Source',
    author: article.author || 'Unknown',
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
        name: article.source?.name || 'News Source'
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