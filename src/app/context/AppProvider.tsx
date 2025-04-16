'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { ArticleProvider } from './ArticleContext';
import { SearchProvider } from './SearchContext';
import { BookmarkProvider } from './BookmarkContext';
import { TransitionProvider } from './TransitionContext';

/**
 * Main provider component that combines all context providers
 * This ensures that all contexts are available throughout the application
 */
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ArticleProvider>
        <SearchProvider>
          <BookmarkProvider>
            <TransitionProvider>
              {children}
            </TransitionProvider>
          </BookmarkProvider>
        </SearchProvider>
      </ArticleProvider>
    </AuthProvider>
  );
}; 