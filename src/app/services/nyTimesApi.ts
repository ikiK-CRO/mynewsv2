import { 
  NYTimesPopularResponse, 
  NYTimesPopularArticle,
  NYTimesTopStoriesResponse, 
  NYTimesTopStoryArticle,
  NYTimesNewswireResponse,
  NYTimesNewswireArticle,
  UnifiedArticle 
} from '../types/news';

const NYT_API_KEY = process.env.NEXT_PUBLIC_NYT_API_KEY || '';
const BASE_URL = 'https://api.nytimes.com/svc';
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

// Fetch with retry logic for rate limiting
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
    console.log(`Rate limited by NY Times API. Retrying in ${waitTime}ms...`);
    await delay(waitTime);
    retries++;
  }
  
  // This shouldn't be reached as we return inside the loop,
  // but TypeScript requires a return statement
  throw new Error('Unexpected error in fetchWithRetry');
}

export async function fetchMostPopular(period: number = 1): Promise<NYTimesPopularResponse> {
  if (!NYT_API_KEY) {
    throw new Error('NY Times API key is missing. Please check your environment variables.');
  }

  const url = `${BASE_URL}/mostpopular/v2/viewed/${period}.json?api-key=${NYT_API_KEY}`;
  
  try {
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch most popular articles: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching most popular articles:', error);
    throw error;
  }
}

export async function fetchTopStories(section: string = 'home'): Promise<NYTimesTopStoriesResponse> {
  if (!NYT_API_KEY) {
    throw new Error('NY Times API key is missing. Please check your environment variables.');
  }

  const url = `${BASE_URL}/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`;
  
  try {
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top stories: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching top stories:', error);
    throw error;
  }
}

// New function to fetch from the Newswire API
export async function fetchNewswire(source: string = 'all', section: string = 'all', limit: number = 20, offset: number = 0): Promise<NYTimesNewswireResponse> {
  if (!NYT_API_KEY) {
    throw new Error('NY Times API key is missing. Please check your environment variables.');
  }

  const url = `${BASE_URL}/news/v3/content/${source}/${section}.json?api-key=${NYT_API_KEY}&limit=${limit}&offset=${offset}`;
  
  try {
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch newswire articles: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching newswire articles:', error);
    throw error;
  }
}

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

export function mapNYTimesTopStoryToUnified(article: NYTimesTopStoryArticle): UnifiedArticle {
  const imageUrl = article.multimedia && article.multimedia.length > 0 
    ? article.multimedia.find(media => media.format === 'mediumThreeByTwo440')?.url || 
      article.multimedia[0]?.url 
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

// New function to map newswire articles to our unified format
export function mapNYTimesNewswireToUnified(article: NYTimesNewswireArticle): UnifiedArticle {
  const imageUrl = article.multimedia && article.multimedia.length > 0 
    ? article.multimedia.find(media => media.format === 'mediumThreeByTwo440')?.url || 
      article.multimedia[0]?.url || 
      article.thumbnail_standard
    : PLACEHOLDER_IMAGE;

  return {
    id: article.uri,
    title: article.title || article.headline || 'No Title Available',
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

export async function getMostPopularArticles(period: number = 1): Promise<UnifiedArticle[]> {
  try {
    const data = await fetchMostPopular(period);
    return data.results.map(mapNYTimesPopularToUnified);
  } catch (error) {
    console.error('Error fetching most popular articles:', error);
    return [];
  }
}

export async function getTopStoriesBySection(section: string = 'home'): Promise<UnifiedArticle[]> {
  try {
    const data = await fetchTopStories(section);
    return data.results.map(mapNYTimesTopStoryToUnified);
  } catch (error) {
    console.error('Error fetching top stories:', error);
    return [];
  }
}

// New function to get newswire articles
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
    console.error('Error fetching newswire articles:', error);
    return [];
  }
}

// New function to fetch available NYT Newswire sections
export async function fetchNewswireSections(): Promise<string[]> {
  if (!NYT_API_KEY) {
    throw new Error('NY Times API key is missing. Please check your environment variables.');
  }

  const url = `${BASE_URL}/news/v3/content/section-list.json?api-key=${NYT_API_KEY}`;
  
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