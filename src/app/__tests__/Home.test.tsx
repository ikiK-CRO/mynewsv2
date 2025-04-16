import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import { AppProvider } from '../context/AppProvider';
import * as newsService from '../services/newsService';

// Mock the newsService methods
jest.mock('../services/newsService', () => ({
  getNewsByCategory: jest.fn(),
  getLatestNews: jest.fn(),
  getBreakingNews: jest.fn(),
  searchNews: jest.fn(),
}));

// Mock articles data
const mockArticles = [
  {
    id: '1',
    title: 'Test Article 1',
    description: 'Test Description 1',
    content: 'Test Content 1',
    url: 'https://example.com/1',
    imageUrl: 'https://example.com/image1.jpg',
    publishedAt: '2023-05-20T12:00:00Z',
    source: 'Test Source',
    category: 'general',
  },
  {
    id: '2',
    title: 'Test Article 2',
    description: 'Test Description 2',
    content: 'Test Content 2',
    url: 'https://example.com/2',
    imageUrl: 'https://example.com/image2.jpg',
    publishedAt: '2023-05-19T12:00:00Z',
    source: 'Test Source',
    category: 'business',
  },
];

const renderHomePage = () => {
  return render(
    <AppProvider>
      <Home />
    </AppProvider>
  );
};

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    (newsService.getNewsByCategory as jest.Mock).mockResolvedValue(mockArticles);
    (newsService.getLatestNews as jest.Mock).mockResolvedValue(mockArticles);
    (newsService.getBreakingNews as jest.Mock).mockResolvedValue([]);
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    });
  });

  it('renders the main sections of the home page', async () => {
    renderHomePage();
    
    // Wait for data to load
    await waitFor(() => {
      expect(newsService.getNewsByCategory).toHaveBeenCalled();
    });
    
    // Check that main components render
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('changes category when sidebar item is clicked', async () => {
    renderHomePage();
    
    // Wait for initial data load
    await waitFor(() => {
      expect(newsService.getNewsByCategory).toHaveBeenCalled();
    });
    
    // Reset mock to check for the second call with the business category
    jest.clearAllMocks();
    (newsService.getNewsByCategory as jest.Mock).mockResolvedValue(mockArticles);
    
    // Find and click a category in the sidebar - use more specific selector
    const businessCategoryLinks = screen.getAllByText(/business/i);
    const sidebarLink = businessCategoryLinks.find(element => 
      element.closest('a') && element.closest('a')?.className.includes('navItem')
    );
    
    if (sidebarLink) {
      await userEvent.click(sidebarLink);
    }
    
    // Check that getNewsByCategory was called with the business category
    await waitFor(() => {
      expect(newsService.getNewsByCategory).toHaveBeenCalledWith('business');
    });
  });

  it('displays search results when search is performed', async () => {
    const mockSearchResults = [
      {
        id: 'search-1',
        title: 'Search Result Article',
        description: 'Search Result Description',
        content: 'Search Result Content',
        url: 'https://example.com/search1',
        imageUrl: 'https://example.com/search1.jpg',
        publishedAt: '2023-05-20T12:00:00Z',
        source: 'Test Source',
        category: 'general',
      },
    ];
    
    (newsService.searchNews as jest.Mock).mockResolvedValue(mockSearchResults);
    
    renderHomePage();
    
    // Find search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Type and submit search
    await userEvent.type(searchInput, 'test search');
    const form = searchInput.closest('form');
    if (form) {
      await userEvent.click(form.querySelector('button[type="submit"]') as HTMLElement);
    }
    
    // Verify search was called
    await waitFor(() => {
      expect(newsService.searchNews).toHaveBeenCalledWith('test search');
    });
    
    // Check that search results are displayed (looking for specific text in a heading)
    await waitFor(() => {
      expect(screen.getByText(/test search/i)).toBeInTheDocument();
    });
  });
}); 