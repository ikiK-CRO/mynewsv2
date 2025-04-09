'use client';

import styles from './Topbar.module.scss';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Topbar: React.FC = () => {
  const router = useRouter();
  const { user, logOut } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await logOut();
      router.push('/');
    } else {
      router.push('/signin');
    }
  };

  return (
    <header className={styles.topbar}>
      <div className="container">
        <div className={styles.topbarContent}>
          <h1 className={styles.title}>Make MyNews your homepage</h1>
          <p className={styles.subtitle}>Every day discover what's trending on the internet!</p>
          <div className={styles.rightContent}>
            <a href="#" className={styles.noThanks}>No, thanks</a>
            <button className={styles.getButton}>GET</button>
          </div>
          <button onClick={handleAuthAction} className={styles.authButton}>
            {user ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7Z" fill="currentColor"/>
                <path d="M4 19H12V21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H12V5H4V19Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7Z" fill="currentColor"/>
                <path d="M20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar; 