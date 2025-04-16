import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchSection from '../SearchSection';
import { SearchProvider } from '../../context/SearchContext';
import { ArticleProvider } from '../../context/ArticleContext';
import { AuthProvider } from '../../context/AuthContext';

// Mock the search function
const mockOnSearch = jest.fn();

const renderSearchSection = () => {
  return render(
    <AuthProvider>
      <ArticleProvider>
        <SearchProvider>
          <SearchSection onSearch={mockOnSearch} />
        </SearchProvider>
      </ArticleProvider>
    </AuthProvider>
  );
};

describe('SearchSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input', () => {
    renderSearchSection();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', async () => {
    renderSearchSection();
    
    // Get the input element
    const input = screen.getByPlaceholderText(/search/i);
    
    // Type in the search box
    await userEvent.type(input, 'test search');
    
    // Submit the form
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    // Check if onSearch was called with the input value
    expect(mockOnSearch).toHaveBeenCalledWith('test search');
  });

  it('does not submit empty searches', async () => {
    renderSearchSection();
    
    // Get the input element
    const input = screen.getByPlaceholderText(/search/i);
    
    // Submit with empty input
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    // Check that onSearch was not called
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
}); 