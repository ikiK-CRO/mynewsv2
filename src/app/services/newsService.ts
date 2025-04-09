import { UnifiedArticle } from '../types/news';
import { getTopHeadlinesByCategory } from './newsApi';
import { 
  getMostPopularArticles, 
  getTopStoriesBySection, 
  getNewswireArticles 
} from './nyTimesApi';

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

export async function getLatestNews(page: number = 1, pageSize: number = 20): Promise<UnifiedArticle[]> {
  // Combine multiple news sources for a more comprehensive latest news feed
  try {
    // Fetch from multiple sources in parallel
    const results = await Promise.allSettled([
      // NY Times Newswire API - Latest published content (most real-time)
      getNewswireArticles('all', 'all', 20, 0),
      // NY Times - Most popular viewed in last 7 days
      getMostPopularArticles(7),
      // NY Times - Top stories from home section
      getTopStoriesBySection('home'),
      // NY Times - Top stories from world section (additional content)
      getTopStoriesBySection('world'),
      // NY Times - Additional sections for more variety
      getTopStoriesBySection('science'),
      getTopStoriesBySection('arts'),
      // NewsAPI - Top headlines (general category)
      getTopHeadlinesByCategory('general'),
      // NewsAPI - Top headlines (technology category for more variety)
      getTopHeadlinesByCategory('technology'),
      // NewsAPI - Additional categories
      getTopHeadlinesByCategory('business'),
      getTopHeadlinesByCategory('entertainment')
    ]);
    
    // Collect all successful results
    const allArticles: UnifiedArticle[] = [];
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allArticles.push(...result.value);
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
    
    // Group articles by date for better organization
    const articlesByDate = sortedArticles.reduce((groups, article) => {
      const date = new Date(article.publishedAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(article);
      return groups;
    }, {} as Record<string, UnifiedArticle[]>);
    
    // Flatten grouped articles, maintaining date order
    const dates = Object.keys(articlesByDate).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    // Ensure we have at least 10 articles per day where possible
    const flattenedArticles = dates.flatMap(date => articlesByDate[date]);
    
    // Calculate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    // For debugging
    console.log(`Fetching latest news page ${page}, items ${start}-${end} of ${flattenedArticles.length}`);
    
    // Only return empty array if we're past the total items
    if (start >= flattenedArticles.length) {
      return [];
    }
    
    // Return the paginated slice with unique IDs
    return flattenedArticles.slice(start, end).map((article, index) => {
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

export async function getNewsByCategory(category: string = 'general'): Promise<UnifiedArticle[]> {
  try {
    // Map our app categories to NYTimes sections
    const nyTimesSection = category === 'general' ? 'home' : category;
    
    // Attempt to fetch from all sources, but handle individual failures
    const results = await Promise.allSettled([
      getTopHeadlinesByCategory(category),
      getTopStoriesBySection(nyTimesSection),
      getNewswireArticles('all', nyTimesSection, 20, 0) // Add Newswire API for real-time articles
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
      console.error('NY Times Top Stories request failed:', results[1].reason);
    }
    
    if (results[2].status === 'fulfilled') {
      successfulResults.push(results[2].value);
    } else {
      console.error('NY Times Newswire request failed:', results[2].reason);
    }
    
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

export async function getBreakingNews(): Promise<UnifiedArticle[]> {
  try {
    // Fetch from all sources in parallel
    const results = await Promise.allSettled([
      getTopHeadlinesByCategory(), // NewsAPI
      getTopStoriesBySection('home'), // NY Times Top Stories
      getNewswireArticles('all', 'all', 5, 0) // NY Times Newswire for real-time breaking news
    ]);
    
    const breakingNews: UnifiedArticle[] = [];
    
    // Add top article from NewsAPI if successful
    if (results[0].status === 'fulfilled' && results[0].value.length > 0) {
      breakingNews.push({
        ...results[0].value[0],
        category: 'BREAKING'
      });
    }
    
    // Add top article from NY Times Top Stories if successful
    if (results[1].status === 'fulfilled' && results[1].value.length > 0) {
      breakingNews.push({
        ...results[1].value[0],
        category: 'BREAKING'
      });
    }
    
    // Add latest article from NY Times Newswire if successful
    if (results[2].status === 'fulfilled' && results[2].value.length > 0) {
      breakingNews.push({
        ...results[2].value[0],
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