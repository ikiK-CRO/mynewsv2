'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './signin.module.scss';
import { useArticles } from '../context/ArticleContext';
import { useSearch } from '../context/SearchContext';
import SearchSection from '../components/SearchSection';
import Divider from '../components/Divider';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();
  const { setActiveCategory } = useArticles();
  const { clearSearch } = useSearch();

  useEffect(() => {
    if (user && user.emailVerified) {
      // Mark return navigation in localStorage for better persistence
      try {
        localStorage.setItem('news_navigation_state', JSON.stringify({
          from_signin: true,
          timestamp: Date.now()
        }));
        console.log('[SignIn] Setting navigation flag in localStorage before redirect');
      } catch (err) {
        console.error('[SignIn] Error setting localStorage:', err);
      }
      
      // Navigate to home page
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      const userCredential = await signIn(email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
        return;
      }
      
      // Login is successful - the useEffect above will handle redirect
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (err.message.includes('verify your email')) {
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Reset category to 'all'
    setActiveCategory('all');
    // Clear any active search
    clearSearch();
    // Navigate to home page
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <SearchSection hideSearch={true} />
        <Divider />
      </div>
      
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Welcome back! Sign in to access your account</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>
        </form>
        
        <div className={styles.links}>
          Don't have an account? <Link href="/signup" className={styles.link}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 