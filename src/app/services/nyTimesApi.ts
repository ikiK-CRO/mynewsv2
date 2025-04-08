import { 
  NYTimesPopularResponse, 
  NYTimesPopularArticle,
  NYTimesTopStoriesResponse, 
  NYTimesTopStoryArticle,
  UnifiedArticle 
} from '../types/news';

const NYT_API_KEY = 'q7SOPsdLjMZHyiJ1d4kkt57TSySHkxFp';
const BASE_URL = 'https://api.nytimes.com/svc';

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

export async function fetchMostPopular(period: number = 1): Promise<NYTimesPopularResponse> {
  const url = `${BASE_URL}/mostpopular/v2/viewed/${period}.json?api-key=${NYT_API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch most popular articles: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchTopStories(section: string = 'home'): Promise<NYTimesTopStoriesResponse> {
  const url = `${BASE_URL}/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch top stories: ${response.statusText}`);
  }
  
  return response.json();
}

export function mapNYTimesPopularToUnified(article: NYTimesPopularArticle): UnifiedArticle {
  const imageUrl = article.media && article.media.length > 0 && article.media[0]['media-metadata'] 
    ? article.media[0]['media-metadata'].find(meta => meta.format === 'mediumThreeByTwo440')?.url || 
      article.media[0]['media-metadata'][article.media[0]['media-metadata'].length - 1]?.url 
    : undefined;

  return {
    id: article.uri,
    title: article.title,
    description: article.abstract,
    url: article.url,
    imageUrl,
    publishedAt: article.published_date,
    source: 'New York Times',
    author: article.byline.replace('By ', ''),
    category: SECTION_CATEGORY_MAP[article.section.toLowerCase()] || 'general'
  };
}

export function mapNYTimesTopStoryToUnified(article: NYTimesTopStoryArticle): UnifiedArticle {
  const imageUrl = article.multimedia && article.multimedia.length > 0 
    ? article.multimedia.find(media => media.format === 'mediumThreeByTwo440')?.url || 
      article.multimedia[0]?.url 
    : undefined;

  return {
    id: article.uri,
    title: article.title,
    description: article.abstract,
    url: article.url,
    imageUrl,
    publishedAt: article.published_date,
    source: 'New York Times',
    author: article.byline.replace('By ', ''),
    category: SECTION_CATEGORY_MAP[article.section.toLowerCase()] || 'general'
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