'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * A hook that redirects unauthenticated users to the sign-in page,
 * but only if they're not coming from a logout action
 */
export default function useAuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) return;
    
    // If there's no user and we're not coming from a logout action
    if (!user) {
      const isFromLogout = sessionStorage.getItem('is_logging_out') === 'true';
      
      if (!isFromLogout) {
        // Only redirect to signin if we're not in the process of logging out
        console.log('[useAuthRedirect] User not authenticated, redirecting to sign in');
        router.push('/signin');
      } else {
        // Clear the logout flag
        console.log('[useAuthRedirect] User logged out, not redirecting to sign in');
        sessionStorage.removeItem('is_logging_out');
      }
    }
  }, [user, loading, router]);
  
  return { user, loading };
} 