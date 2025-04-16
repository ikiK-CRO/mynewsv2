'use client';

import styles from './MobileMenu.module.scss';
import React from 'react';
import { useRouter } from 'next/navigation';
import { icons } from './icons';

interface MobileMenuProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  activeCategory, 
  onCategoryChange,
  isOpen,
  onClose
}) => {
  const router = useRouter();
  
  const categoryItems = [
    { id: 'all', label: 'Home', icon: icons.home },
    { id: 'general', label: 'General', icon: icons.general },
    { id: 'business', label: 'Business', icon: icons.business },
    { id: 'health', label: 'Health', icon: icons.health },
    { id: 'science', label: 'Science', icon: icons.science },
    { id: 'sports', label: 'Sports', icon: icons.sports },
    { id: 'technology', label: 'Technology', icon: icons.technology }
  ];

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.mobileMenuWrapper}>
      <div className={styles.mobileMenuHeader}>
        <div className={styles.logo}>
          <span>My</span>News
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#1D1D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="#1D1D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className={styles.categoryGrid}>
        {categoryItems.map((item) => (
          <button
            key={`${item.id}-${item.label}`}
            className={`${styles.categoryChip} ${activeCategory === item.id ? styles.active : ''}`}
            onClick={() => handleCategoryClick(item.id)}
          >
            <div className={styles.iconWrapper}>
              {item.icon}
            </div>
            <span className={styles.chipLabel}>{item.label}</span>
          </button>
        ))}
        
        <button className={styles.categoryChip} onClick={() => router.push('/favorites')}>
          <div className={styles.iconWrapper}>
            {icons.favorites}
          </div>
          <span className={styles.chipLabel}>Favorites</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu; 