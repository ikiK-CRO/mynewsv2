'use client';

import React, { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from '../context/TransitionContext';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  isAuthPage?: boolean;
}

export default function PageTransition({
  children,
  className = '',
  isAuthPage = false
}: PageTransitionProps) {
  const { state, currentPath } = useTransition();
  const pathname = usePathname();

  // Add class based on current path and transition state
  const baseClass = isAuthPage ? 'auth-page' : 'page';
  const transitionClass = state ? `${baseClass}-${state}` : '';
  const combinedClassName = `${baseClass} ${transitionClass} ${className}`.trim();

  // Force page to appear if path changes but state doesn't update correctly
  useEffect(() => {
    if (pathname !== currentPath && state === 'exited') {
      console.log('Path changed but state is still exited, forcing update');
    }
  }, [pathname, currentPath, state]);

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
} 