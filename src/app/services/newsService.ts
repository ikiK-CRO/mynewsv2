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
    // Return the top 5 most popular articles
    return articles.slice(0, 5);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
}

export async function getNewsByCategory(category: string = 'general'): Promise<UnifiedArticle[]> {
  try {
    // Map our app categories to NYTimes sections
    const nyTimesSection = category === 'general' ? 'home' : category;
    
    // Fetch from both NewsAPI and NYTimes
    const [newsApiArticles, nyTimesArticles] = await Promise.all([
      getTopHeadlinesByCategory(category),
      getTopStoriesBySection(nyTimesSection)
    ]);
    
    // Combine and deduplicate the results
    return combineAndDeduplicate([newsApiArticles, nyTimesArticles]);
  } catch (error) {
    console.error(`Error fetching news for category ${category}:`, error);
    return [];
  }
}

export async function getBreakingNews(): Promise<UnifiedArticle[]> {
  try {
    // For breaking news, we'll use top headlines from NewsAPI
    const newsApiHeadlines = await getTopHeadlinesByCategory();
    
    // Mark the first 1-2 items as breaking news
    return newsApiHeadlines.slice(0, 2).map(article => ({
      ...article,
      category: 'BREAKING'
    }));
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return [];
  }
} 