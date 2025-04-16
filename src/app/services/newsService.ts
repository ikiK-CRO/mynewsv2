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
    // Reduced API calls but with better category diversity
    const results = await Promise.allSettled([
      // NY Times - Multiple sections
      getMostPopularArticles(7),
      getTopStoriesBySection('home'),
      getTopStoriesBySection('business'),
      // NewsAPI - Multiple categories
      getTopHeadlinesByCategory('general'),
      getTopHeadlinesByCategory('technology'),
      getTopHeadlinesByCategory('business')
    ]);
    
    // Collect all successful results
    const allArticles: UnifiedArticle[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        // Keep the original categories instead of normalizing everything to match source
        allArticles.push(...result.value);
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
export async function getNewsByCategory(category: string = 'general', forceRefresh: boolean = false): Promise<UnifiedArticle[]> {
  try {
    // If category is 'all', fetch from multiple categories
    if (category === 'all') {
      console.log(`[newsService] Fetching news for all categories ${forceRefresh ? ' (forced refresh)' : ''}`);
      
      // Fetch from multiple sources/categories for a diverse set of news
      const results = await Promise.allSettled([
        getTopHeadlinesByCategory('general'),
        getTopHeadlinesByCategory('business'),
        getTopHeadlinesByCategory('technology'),
        getTopStoriesBySection('home'),
        getTopStoriesBySection('science'),
        getTopStoriesBySection('health')
      ]);
      
      const successfulResults: UnifiedArticle[][] = [];
      
      // Process results, logging any failures
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value);
          console.log(`Got ${result.value.length} articles from source ${index} for all categories`);
        } else {
          console.error(`API request ${index} failed for all categories:`, result.reason);
        }
      });
      
      // As long as at least one API succeeded, we can show some results
      if (successfulResults.length > 0) {
        // Get deduplicated articles
        const dedupedArticles = combineAndDeduplicate(successfulResults);
        
        console.log(`[newsService] Got ${dedupedArticles.length} deduplicated articles for all categories`);
        
        // If we end up with an empty array, throw an error to trigger fallback
        if (dedupedArticles.length === 0) {
          throw new Error(`No articles found for all categories after deduplication`);
        }
        
        // Sort articles by published date, newest first
        return dedupedArticles.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      }
      
      // If everything failed, throw an error to trigger fallback
      throw new Error(`All news sources failed for all categories`);
    }
    
    // For specific categories, use existing logic
    // Map our app categories to NYTimes sections
    const nyTimesSection = category === 'general' ? 'home' : category;
    
    console.log(`[newsService] Fetching news for category: ${category}, NYT section: ${nyTimesSection}${forceRefresh ? ' (forced refresh)' : ''}`);
    
    // Add timestamp to force cache invalidation if needed
    const timestamp = forceRefresh ? `&_t=${Date.now()}` : '';
    
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
      
      console.log(`[newsService] Got ${dedupedArticles.length} deduplicated articles for category ${category}`);
      
      // If we end up with an empty array, throw an error to trigger fallback
      if (dedupedArticles.length === 0) {
        throw new Error(`No articles found for category ${category} after deduplication`);
      }
      
      // Sort articles by published date, newest first
      return dedupedArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    
    // If everything failed, throw an error to trigger fallback
    throw new Error(`All news sources failed for category: ${category}`);
  } catch (error) {
    console.error(`Error fetching news for category ${category}:`, error);
    
    // Return fallback data if we have no articles
    return getLocalFallbackData(category);
  }
}

/**
 * Provides fallback data when API calls fail
 */
function getLocalFallbackData(category: string): UnifiedArticle[] {
  console.log(`[newsService] Using fallback data for ${category}`);
  
  // Return a simple placeholder article
  return [
    {
      id: `fallback-${Date.now()}`,
      title: `Unable to load news for ${category}`,
      description: 'Please check your internet connection and try again later.',
      url: '#',
      imageUrl: 'https://via.placeholder.com/440x293/E8E8E8/AAAAAA?text=News+Service+Error',
      publishedAt: new Date().toISOString(),
      source: 'News Service',
      author: 'System',
      category: category
    }
  ];
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

/**
 * Search for news articles across all sources
 * @param searchTerm The term to search for
 * @returns A promise that resolves to an array of unified articles
 */
export const searchNews = async (searchTerm: string): Promise<UnifiedArticle[]> => {
  try {
    console.log(`[newsService] Searching for: ${searchTerm}`);
    
    // Search in NewsAPI - use the everything endpoint with search parameters
    const newsApiResults = await getTopHeadlinesByCategory('general', true);
    
    // Filter NewsAPI results by search term
    const filteredNewsApiResults = newsApiResults.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Search in NYTimes
    const nyTimesResults = await getTopStoriesBySection('home', true);
    
    // Filter NYTimes results by search term
    const filteredNYTimesResults = nyTimesResults.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Combine and deduplicate results
    const allResults = [...filteredNewsApiResults, ...filteredNYTimesResults];
    const uniqueResults = combineAndDeduplicate([allResults]);
    
    console.log(`[newsService] Found ${uniqueResults.length} unique articles for search: ${searchTerm}`);
    return uniqueResults;
  } catch (error) {
    console.error('[newsService] Error searching news:', error);
    return [];
  }
}; 