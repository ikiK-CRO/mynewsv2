import { UnifiedArticle } from '../types/news';
import { getTopHeadlinesByCategory } from './newsApi';
import { 
  getMostPopularArticles, 
  getTopStoriesBySection, 
  getNewswireArticles 
} from './nyTimesApi';

// Map both source categories to our internal categories for consistency
const CATEGORY_MAP = {
  // NewsAPI categories
  'general': 'general',
  'business': 'business',
  'entertainment': 'entertainment',
  'health': 'health',
  'science': 'science',
  'sports': 'sports',
  'technology': 'technology',
  
  // NYTimes sections that need normalization
  'home': 'general',
  'world': 'general',
  'us': 'general',
  'arts': 'entertainment',
  'books': 'entertainment',
  'style': 'entertainment',
  'food': 'lifestyle',
  'travel': 'lifestyle',
  'magazine': 'lifestyle',
  'realestate': 'business',
  'automobiles': 'business',
};

/**
 * Normalize category names across different sources
 */
function normalizeCategory(category: string): string {
  return CATEGORY_MAP[category.toLowerCase()] || category.toLowerCase();
}

/**
 * Combine and deduplicate articles from multiple sources
 */
function combineAndDeduplicate(arrays: UnifiedArticle[][]): UnifiedArticle[] {
  const combined = arrays.flat();
  const seen = new Set<string>();
  
  return combined
    .filter(article => {
      // Use the article title for deduplication since URLs may differ between sources
      const key = article.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    // Ensure consistent category names across all articles
    .map(article => ({
      ...article,
      category: normalizeCategory(article.category)
    }));
}

/**
 * Get latest news with pagination
 * Uses a reduced set of API calls while maintaining diversity of sources
 */
export async function getLatestNews(page: number = 1, pageSize: number = 20): Promise<UnifiedArticle[]> {
  try {
    // Reduced API calls - only 4 sources instead of 10
    // But keeping both NewsAPI and NYTimes sources for diversity
    const results = await Promise.allSettled([
      // NY Times - Most essential endpoints (2)
      getMostPopularArticles(7),
      getTopStoriesBySection('home'),
      // NewsAPI - Essential categories (2)
      getTopHeadlinesByCategory('general'),
      getTopHeadlinesByCategory('technology')
    ]);
    
    // Collect all successful results
    const allArticles: UnifiedArticle[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        // Normalize all categories before adding to allArticles
        const normalizedArticles = result.value.map(article => ({
          ...article,
          category: normalizeCategory(article.category)
        }));
        allArticles.push(...normalizedArticles);
        console.log(`Got ${result.value.length} articles from source ${index}`);
      }
    });
    
    if (allArticles.length === 0) {
      console.error('All news sources failed to return articles');
      return [];
    }
    
    // Deduplicate articles
    const seen = new Set<string>();
    const uniqueArticles = allArticles.filter(article => {
      // Use title + source as a unique key to allow different sources to cover the same story
      const key = `${article.title.toLowerCase().trim()}-${article.source}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    // Sort by published date, newest first
    const sortedArticles = uniqueArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    // Calculate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    // For debugging
    console.log(`Fetching latest news page ${page}, items ${start}-${end} of ${sortedArticles.length}`);
    
    // Only return empty array if we're past the total items
    if (start >= sortedArticles.length) {
      return [];
    }
    
    // Return the paginated slice with unique IDs
    return sortedArticles.slice(start, end).map((article, index) => {
      if (!article.id) {
        return {
          ...article,
          id: `article-${start + index}-${Date.now()}`
        };
      }
      return article;
    });
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
}

/**
 * Get news by category
 * Uses both sources to ensure diverse news
 */
export async function getNewsByCategory(category: string = 'general'): Promise<UnifiedArticle[]> {
  try {
    // Map our app categories to NYTimes sections
    const nyTimesSection = category === 'general' ? 'home' : category;
    
    // Attempt to fetch from both sources for diversity, but limit to 2 API calls
    const results = await Promise.allSettled([
      getTopHeadlinesByCategory(category),
      getTopStoriesBySection(nyTimesSection)
    ]);
    
    const successfulResults: UnifiedArticle[][] = [];
    
    // Process results, logging any failures
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        // Normalize all categories before adding to results
        const normalizedArticles = result.value.map(article => ({
          ...article,
          category: normalizeCategory(category) // Use requested category for consistency
        }));
        successfulResults.push(normalizedArticles);
        console.log(`Got ${result.value.length} articles from source ${index} for category ${category}`);
      } else {
        console.error(`API request ${index} failed for category ${category}:`, result.reason);
      }
    });
    
    // As long as at least one API succeeded, we can show some results
    if (successfulResults.length > 0) {
      // Get deduplicated articles
      const dedupedArticles = combineAndDeduplicate(successfulResults);
      
      // Sort articles by published date, newest first
      return dedupedArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    
    // If everything failed, return empty array
    console.error('All news sources failed for category:', category);
    return [];
  } catch (error) {
    console.error(`Error fetching news for category ${category}:`, error);
    return [];
  }
}

/**
 * Get breaking news
 * Uses both sources to ensure diversity
 */
export async function getBreakingNews(): Promise<UnifiedArticle[]> {
  try {
    // Use both sources for breaking news but reduced to 2 API calls
    const results = await Promise.allSettled([
      getTopHeadlinesByCategory(), // NewsAPI
      getTopStoriesBySection('home') // NY Times Top Stories
    ]);
    
    const breakingNews: UnifiedArticle[] = [];
    
    // Add top article from NewsAPI if successful (first position)
    if (results[0].status === 'fulfilled' && results[0].value.length > 0) {
      breakingNews.push({
        ...results[0].value[0],
        category: 'BREAKING'
      });
      
      // Add a second article if available
      if (results[0].value.length > 1) {
        breakingNews.push({
          ...results[0].value[1],
          category: 'BREAKING'
        });
      }
    }
    
    // Add top article from NY Times Top Stories if successful
    if (results[1].status === 'fulfilled' && results[1].value.length > 0) {
      breakingNews.push({
        ...results[1].value[0],
        category: 'BREAKING'
      });
    }
    
    // If all APIs failed, return empty array
    if (breakingNews.length === 0) {
      console.error('Failed to fetch breaking news from any source');
    }
    
    return breakingNews;
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return [];
  }
} 