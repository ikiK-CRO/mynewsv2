import { NewsApiResponse, NewsApiArticle, UnifiedArticle } from '../types/news';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/440x293/E8E8E8/AAAAAA?text=News+API';

// Utility function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if code is running on server or client
const isServer = typeof window === 'undefined';

/**
 * Fetch data from NewsAPI through our server-side proxy
 * @param endpoint The NewsAPI endpoint (top-headlines, everything)
 * @param params Additional query parameters
 */
async function fetchFromNewsApi(endpoint: string, params: Record<string, string>): Promise<NewsApiResponse> {
  // Build the query parameters
  const queryParams = new URLSearchParams({
    endpoint,
    ...params
  });
  
  try {
    // Use the server-side API route
    const apiUrl = `/api/news/newsapi?${queryParams}`;
    
    // Make the request with retries for network errors
    const response = await fetchWithRetry(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`NewsAPI error: ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching from NewsAPI (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Simple fetch with retry for network errors
 */
async function fetchWithRetry(url: string, maxRetries = 1): Promise<Response> {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      console.error(`Network error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await delay(Math.pow(2, attempt) * 1000);
      }
    }
  }
  
  throw lastError;
}

/**
 * Fetch top headlines from NewsAPI
 */
export async function fetchTopHeadlines(category: string = ''): Promise<NewsApiResponse> {
  const params: Record<string, string> = {
    language: 'en'
  };
  
  if (category && category !== 'general') {
    params.category = category;
  }
  
  return fetchFromNewsApi('top-headlines', params);
}

/**
 * Fetch articles matching a query from NewsAPI
 */
export async function fetchEverything(query: string, sortBy: string = 'publishedAt'): Promise<NewsApiResponse> {
  return fetchFromNewsApi('everything', {
    q: query,
    sortBy,
    language: 'en'
  });
}

/**
 * Map a NewsAPI article to the unified format
 */
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

/**
 * Get top headlines by category and convert to unified format
 */
export async function getTopHeadlinesByCategory(category: string = '', forceRefresh: boolean = false): Promise<UnifiedArticle[]> {
  try {
    // Add timestamp to force cache invalidation if needed
    const timestamp = forceRefresh ? `&_t=${Date.now()}` : '';
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