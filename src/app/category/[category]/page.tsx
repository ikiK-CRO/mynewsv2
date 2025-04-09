'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

// This page redirects to home page with the selected category
export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const { category } = params;
  
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