import { getLatestNews, getNewsByCategory, searchNews } from '../newsService';
import { getTopHeadlinesByCategory } from '../newsApi';
import { getMostPopularArticles, getTopStoriesBySection } from '../nyTimesApi';

// Mock the API services
jest.mock('../newsApi', () => ({
  getTopHeadlinesByCategory: jest.fn(),
}));

jest.mock('../nyTimesApi', () => ({
  getMostPopularArticles: jest.fn(),
  getTopStoriesBySection: jest.fn(),
  getNewswireArticles: jest.fn(),
}));

describe('NewsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestNews', () => {
    it('should return latest news from multiple sources', async () => {
      // Mock API responses
      const mockNewsAPIResponse = [
        {
          id: 'news-1',
          title: 'News API Article 1',
          description: 'Description 1',
          content: 'Content 1',
          url: 'https://example.com/1',
          imageUrl: 'https://example.com/image1.jpg',
          publishedAt: '2023-05-20T12:00:00Z',
          source: 'NewsAPI',
          category: 'general',
        },
      ];

      const mockNYTimesResponse = [
        {
          id: 'nyt-1',
          title: 'NY Times Article 1',
          description: 'Description 2',
          content: 'Content 2',
          url: 'https://nytimes.com/1',
          imageUrl: 'https://nytimes.com/image1.jpg',
          publishedAt: '2023-05-21T12:00:00Z',
          source: 'NYTimes',
          category: 'business',
        },
      ];

      // Setup mocks to return our test data
      (getTopHeadlinesByCategory as jest.Mock).mockResolvedValue(mockNewsAPIResponse);
      (getMostPopularArticles as jest.Mock).mockResolvedValue(mockNYTimesResponse);
      (getTopStoriesBySection as jest.Mock).mockResolvedValue(mockNYTimesResponse);

      // Call the method being tested
      const result = await getLatestNews(1, 10);

      // Assertions
      expect(result.length).toBeGreaterThan(0);
      expect(getTopHeadlinesByCategory).toHaveBeenCalled();
      expect(getMostPopularArticles).toHaveBeenCalled();
      expect(getTopStoriesBySection).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Setup mocks to throw errors
      (getTopHeadlinesByCategory as jest.Mock).mockRejectedValue(new Error('API Error'));
      (getMostPopularArticles as jest.Mock).mockRejectedValue(new Error('API Error'));
      (getTopStoriesBySection as jest.Mock).mockRejectedValue(new Error('API Error'));

      // Call the method being tested
      const result = await getLatestNews(1, 10);

      // Should return empty array on error
      expect(result).toEqual([]);
    });
  });

  describe('getNewsByCategory', () => {
    it('should fetch news for a specific category', async () => {
      // Mock API responses
      const mockCategoryArticles = [
        {
          id: 'tech-1',
          title: 'Technology Article 1',
          description: 'Tech Description',
          content: 'Tech Content',
          url: 'https://example.com/tech1',
          imageUrl: 'https://example.com/tech1.jpg',
          publishedAt: '2023-05-20T12:00:00Z',
          source: 'NewsAPI',
          category: 'technology',
        },
      ];

      // Setup mocks
      (getTopHeadlinesByCategory as jest.Mock).mockResolvedValue(mockCategoryArticles);
      (getTopStoriesBySection as jest.Mock).mockResolvedValue([]);

      // Call the method being tested
      const result = await getNewsByCategory('technology');

      // Assertions
      expect(result.length).toBeGreaterThan(0);
      expect(getTopHeadlinesByCategory).toHaveBeenCalledWith('technology');
    });
  });

  describe('searchNews', () => {
    it('should search for news with the given term', async () => {
      // Mock API responses for search
      const mockNewsApiResults = [
        {
          id: 'search-1',
          title: 'Search Result with test term',
          description: 'Search Description that contains test term',
          content: 'Search Content',
          url: 'https://example.com/search1',
          imageUrl: 'https://example.com/search1.jpg',
          publishedAt: '2023-05-20T12:00:00Z',
          source: 'NewsAPI',
          category: 'general',
        },
        {
          id: 'search-2',
          title: 'Another Result',
          description: 'Description without the term',
          content: 'Content',
          url: 'https://example.com/search2',
          imageUrl: 'https://example.com/search2.jpg',
          publishedAt: '2023-05-20T12:00:00Z',
          source: 'NewsAPI',
          category: 'general',
        }
      ];

      const mockNYTimesResults = [
        {
          id: 'nyt-1',
          title: 'NY Times test article',
          description: 'NY Times Description',
          content: 'Content',
          url: 'https://nytimes.com/search1',
          imageUrl: 'https://nytimes.com/search1.jpg',
          publishedAt: '2023-05-20T12:00:00Z',
          source: 'NYTimes',
          category: 'general',
        }
      ];

      // Setup mocks
      (getTopHeadlinesByCategory as jest.Mock).mockResolvedValue(mockNewsApiResults);
      (getTopStoriesBySection as jest.Mock).mockResolvedValue(mockNYTimesResults);

      // Call the method being tested
      const result = await searchNews('test');

      // Assertions
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toContain('test');
    });
  });
}); 