import { 
  NYTimesPopularResponse, 
  NYTimesPopularArticle,
  NYTimesTopStoriesResponse, 
  NYTimesTopStoryArticle,
  NYTimesNewswireResponse,
  NYTimesNewswireArticle,
  UnifiedArticle 
} from '../types/news';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/440x293/E8E8E8/AAAAAA?text=New+York+Times';

// Map NYTimes section names to our sidebar categories
const SECTION_CATEGORY_MAP: Record<string, string> = {
  'home': 'general',
  'world': 'general',
  'us': 'general',
  'business': 'business',
  'technology': 'technology',
  'science': 'science',
  'health': 'health',
  'sports': 'sports',
  'arts': 'general',
  'books': 'general',
  'style': 'general',
  'food': 'general',
  'travel': 'general',
  'magazine': 'general',
  'realestate': 'business',
  'automobiles': 'business',
};

// Utility function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
 * Fetch data from NYTimes API through our server-side proxy
 * @param endpoint The NYTimes endpoint (topstories, mostpopular, newswire)
 * @param params Additional query parameters
 */
async function fetchFromNYTimesApi<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  // Build the query parameters
  const queryParams = new URLSearchParams({
    endpoint,
    ...params
  });

  try {
    // Use the server-side API route
    const apiUrl = `/api/news/nytimes?${queryParams}`;
    
    // Make the request with retries for network errors
    const response = await fetchWithRetry(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`NYTimes API error: ${errorData.error || response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching from NYTimes API (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Fetch most popular articles from NYTimes
 */
export async function fetchMostPopular(period: number = 1): Promise<NYTimesPopularResponse> {
  return fetchFromNYTimesApi<NYTimesPopularResponse>('mostpopular', {
    period: period.toString()
  });
}

/**
 * Fetch top stories from NYTimes for a specific section
 */
export async function fetchTopStories(section: string = 'home'): Promise<NYTimesTopStoriesResponse> {
  return fetchFromNYTimesApi<NYTimesTopStoriesResponse>('topstories', {
    section
  });
}

/**
 * Fetch newswire articles from NYTimes
 */
export async function fetchNewswire(
  source: string = 'all', 
  section: string = 'all', 
  limit: number = 20, 
  offset: number = 0
): Promise<NYTimesNewswireResponse> {
  return fetchFromNYTimesApi<NYTimesNewswireResponse>('newswire', {
    source,
    section,
    limit: limit.toString(),
    offset: offset.toString()
  });
}

/**
 * Map a NYTimes popular article to unified format
 */
export function mapNYTimesPopularToUnified(article: NYTimesPopularArticle): UnifiedArticle {
  const imageUrl = article.media && article.media.length > 0 && article.media[0]['media-metadata'] 
    ? article.media[0]['media-metadata'].find(meta => meta.format === 'mediumThreeByTwo440')?.url || 
      article.media[0]['media-metadata'][article.media[0]['media-metadata'].length - 1]?.url 
    : PLACEHOLDER_IMAGE;

  return {
    id: article.uri,
    title: article.title || 'No Title Available',
    description: article.abstract || 'No description available',
    url: article.url,
    imageUrl,
    publishedAt: article.published_date,
    source: 'New York Times',
    author: article.byline ? article.byline.replace('By ', '') : 'New York Times',
    category: article.section && SECTION_CATEGORY_MAP[article.section.toLowerCase()] 
      ? SECTION_CATEGORY_MAP[article.section.toLowerCase()] 
      : 'general'
  };
}

/**
 * Map a NYTimes top story article to unified format
 */
export function mapNYTimesTopStoryToUnified(article: NYTimesTopStoryArticle): UnifiedArticle {
  const imageUrl = article.multimedia && article.multimedia.length > 0
    ? article.multimedia.find(media => media.format === 'mediumThreeByTwo440')?.url ||
      article.multimedia[0].url
    : PLACEHOLDER_IMAGE;

  return {
    id: article.uri,
    title: article.title || 'No Title Available',
    description: article.abstract || 'No description available',
    url: article.url,
    imageUrl,
    publishedAt: article.published_date,
    source: 'New York Times',
    author: article.byline ? article.byline.replace('By ', '') : 'New York Times',
    category: article.section && SECTION_CATEGORY_MAP[article.section.toLowerCase()] 
      ? SECTION_CATEGORY_MAP[article.section.toLowerCase()] 
      : 'general'
  };
}

/**
 * Map a NYTimes newswire article to unified format
 */
export function mapNYTimesNewswireToUnified(article: NYTimesNewswireArticle): UnifiedArticle {
  return {
    id: article.uri,
    title: article.title || 'No Title Available',
    description: article.abstract || 'No description available',
    url: article.url,
    imageUrl: article.thumbnail_standard || PLACEHOLDER_IMAGE,
    publishedAt: article.published_date,
    source: 'New York Times',
    author: article.byline ? article.byline.replace('By ', '') : 'New York Times',
    category: article.section && SECTION_CATEGORY_MAP[article.section.toLowerCase()] 
      ? SECTION_CATEGORY_MAP[article.section.toLowerCase()] 
      : 'general'
  };
}

/**
 * Get most popular articles from NYTimes and convert to unified format
 */
export async function getMostPopularArticles(period: number = 1): Promise<UnifiedArticle[]> {
  try {
    const data = await fetchMostPopular(period);
    return data.results.map(mapNYTimesPopularToUnified);
  } catch (error) {
    console.error('Error fetching most popular articles:', error);
    return [];
  }
}

/**
 * Get top stories from NYTimes by section and convert to unified format
 */
export async function getTopStoriesBySection(section: string = 'home'): Promise<UnifiedArticle[]> {
  try {
    const data = await fetchTopStories(section);
    return data.results.map(mapNYTimesTopStoryToUnified);
  } catch (error) {
    console.error(`Error fetching top stories for section ${section}:`, error);
    return [];
  }
}

/**
 * Get newswire articles from NYTimes and convert to unified format
 */
export async function getNewswireArticles(
  source: string = 'all', 
  section: string = 'all', 
  limit: number = 20, 
  offset: number = 0
): Promise<UnifiedArticle[]> {
  try {
    const data = await fetchNewswire(source, section, limit, offset);
    return data.results.map(mapNYTimesNewswireToUnified);
  } catch (error) {
    console.error(`Error fetching newswire articles for section ${section}:`, error);
    return [];
  }
}

// New function to fetch available NYT Newswire sections
export async function fetchNewswireSections(): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_NYT_API_KEY) {
    throw new Error('NY Times API key is missing. Please check your environment variables.');
  }

  const url = `/api/news/nytimes/sections?api-key=${process.env.NEXT_PUBLIC_NYT_API_KEY}`;
  
  try {
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch newswire sections: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results.map((section: { section: string; display_name: string }) => section.section);
  } catch (error) {
    console.error('Error fetching newswire sections:', error);
    return Object.keys(SECTION_CATEGORY_MAP);
  }
} 