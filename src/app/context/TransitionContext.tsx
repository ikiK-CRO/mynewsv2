'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

interface TransitionContextType {
  state: TransitionState;
  navigate: (href: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};

interface TransitionProviderProps {
  children: React.ReactNode;
  exitDuration?: number;
  enterDuration?: number;
}

export const TransitionProvider: React.FC<TransitionProviderProps> = ({
  children,
  exitDuration = 300,
  enterDuration = 300,
}) => {
  const [state, setState] = useState<TransitionState>('entered');
  const [nextPath, setNextPath] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // When component mounts, set to entered state
    setState('entered');
  }, []);

  useEffect(() => {
    // When pathname changes, we've completed the navigation
    if (state === 'entering') {
      const timeout = setTimeout(() => {
        setState('entered');
      }, enterDuration);
      
      return () => clearTimeout(timeout);
    }
  }, [pathname, state, enterDuration]);

  // Execute the navigation after exit animation completes
  useEffect(() => {
    if (state === 'exiting' && nextPath) {
      const timeout = setTimeout(() => {
        setState('exited');
        router.push(nextPath);
        
        // Reset nextPath
        setNextPath(null);
        
        // Set to entering state after navigation
        setState('entering');
      }, exitDuration);
      
      return () => clearTimeout(timeout);
    }
  }, [state, nextPath, router, exitDuration]);

  const navigate = useCallback((href: string) => {
    if (href === pathname) return;
    setNextPath(href);
    setState('exiting');
  }, [pathname]);

  const isTransitioning = state === 'exiting' || state === 'entering';

  return (
    <TransitionContext.Provider value={{ state, navigate, isTransitioning }}>
      {children}
    </TransitionContext.Provider>
  );
}; 