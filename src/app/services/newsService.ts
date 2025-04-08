import { UnifiedArticle } from '../types/news';
import { getTopHeadlinesByCategory } from './newsApi';
import { getMostPopularArticles, getTopStoriesBySection } from './nyTimesApi';

// Combine and deduplicate articles from multiple sources
function combineAndDeduplicate(arrays: UnifiedArticle[][]): UnifiedArticle[] {
  const combined = arrays.flat();
  const seen = new Set<string>();
  
  return combined.filter(article => {
    // Use the article title for deduplication since URLs may differ between sources
    const key = article.title.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function getLatestNews(): Promise<UnifiedArticle[]> {
  // For the latest news widget, use NY Times most popular (last 1 day)
  try {
    const articles = await getMostPopularArticles(1);
    
    // If NY Times fails or returns no articles, fall back to NewsAPI
    if (articles.length === 0) {
      console.log('Falling back to NewsAPI for latest news');
      const newsApiArticles = await getTopHeadlinesByCategory();
      return newsApiArticles.slice(0, 5);
    }
    
    // Return the top 5 most popular articles
    return articles.slice(0, 5);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    
    // Fallback to NewsAPI if NY Times fails
    try {
      console.log('Falling back to NewsAPI for latest news after error');
      const newsApiArticles = await getTopHeadlinesByCategory();
      return newsApiArticles.slice(0, 5);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
}

export async function getNewsByCategory(category: string = 'general'): Promise<UnifiedArticle[]> {
  try {
    // Map our app categories to NYTimes sections
    const nyTimesSection = category === 'general' ? 'home' : category;
    
    // Attempt to fetch from both sources, but handle individual failures
    const results = await Promise.allSettled([
      getTopHeadlinesByCategory(category),
      getTopStoriesBySection(nyTimesSection)
    ]);
    
    const successfulResults: UnifiedArticle[][] = [];
    
    // Process results, logging any failures
    if (results[0].status === 'fulfilled') {
      successfulResults.push(results[0].value);
    } else {
      console.error('NewsAPI request failed:', results[0].reason);
    }
    
    if (results[1].status === 'fulfilled') {
      successfulResults.push(results[1].value);
    } else {
      console.error('NY Times request failed:', results[1].reason);
    }
    
    // As long as at least one API succeeded, we can show some results
    if (successfulResults.length > 0) {
      return combineAndDeduplicate(successfulResults);
    }
    
    // If everything failed, return empty array
    console.error('All news sources failed for category:', category);
    return [];
  } catch (error) {
    console.error(`Error fetching news for category ${category}:`, error);
    return [];
  }
}

export async function getBreakingNews(): Promise<UnifiedArticle[]> {
  try {
    // Fetch from both sources in parallel
    const results = await Promise.allSettled([
      getTopHeadlinesByCategory(), // NewsAPI
      getTopStoriesBySection('home') // NY Times
    ]);
    
    const breakingNews: UnifiedArticle[] = [];
    
    // Add top article from NewsAPI if successful
    if (results[0].status === 'fulfilled' && results[0].value.length > 0) {
      breakingNews.push({
        ...results[0].value[0],
        category: 'BREAKING'
      });
    }
    
    // Add top article from NY Times if successful
    if (results[1].status === 'fulfilled' && results[1].value.length > 0) {
      breakingNews.push({
        ...results[1].value[0],
        category: 'BREAKING'
      });
    }
    
    // If both APIs failed, return empty array
    if (breakingNews.length === 0) {
      console.error('Failed to fetch breaking news from any source');
    }
    
    return breakingNews;
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return [];
  }
} 