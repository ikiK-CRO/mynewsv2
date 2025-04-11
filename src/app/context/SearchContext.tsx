'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { UnifiedArticle } from '../types/news';
import { searchNews as searchNewsService } from '../services/newsService';

// Define the shape of our context
interface SearchContextType {
  // Search state
  searchTerm: string;
  searchResults: UnifiedArticle[];
  searchLoading: boolean;
  
  // Actions
  searchNews: (term: string) => void;
  clearSearch: () => void;
}

// Create context with a default undefined value
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Create a hook to use the context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

/**
 * Context provider for search-related state and functionality
 */
export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UnifiedArticle[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  // Search for news articles
  const searchNews = useCallback(async (term: string) => {
    if (!term.trim()) {
      clearSearch();
      return;
    }
    
    try {
      setSearchLoading(true);
      setSearchTerm(term);
      
      const results = await searchNewsService(term);
      setSearchResults(results);
    } catch (err) {
      console.error('[SearchContext] Error searching news:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchLoading(false);
  }, []);
  
  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        searchResults,
        searchLoading,
        searchNews,
        clearSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}; 