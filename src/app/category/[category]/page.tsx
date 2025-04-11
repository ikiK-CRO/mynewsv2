'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

/**
 * Category page component that redirects to home with the selected category
 * This page acts as a redirect handler for category navigation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.params - Route parameters
 * @param {string} props.params.category - The category to redirect to
 */
export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const { category } = params;
  
  /**
   * Effect to handle the redirect
   * Stores the category in localStorage and redirects to home
   */
  useEffect(() => {
    // Store the category in localStorage
    try {
      localStorage.setItem('pending_category', category);
      console.log(`[CategoryPage] Stored category ${category} in localStorage, redirecting to home`);
    } catch (err) {
      console.error('[CategoryPage] Error storing category:', err);
    }
    
    // Redirect to home page
    router.push('/');
  }, [category, router]);
  
  // Render a loading state while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>
        <h2>Redirecting to {category} news...</h2>
        <p>Please wait...</p>
      </div>
    </div>
  );
} 