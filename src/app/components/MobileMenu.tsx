'use client';

import styles from './MobileMenu.module.scss';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { icons } from './icons';
import { useSearch } from '../context/SearchContext';

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
  const { clearSearch, searchNews } = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  
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
    
    // Navigate to home page with the selected category
    router.push('/');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Reset category to 'all'
    onCategoryChange('all');
    // Clear any active search
    clearSearch();
    // Navigate to home page
    router.push('/');
    // Close the mobile menu
    onClose();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchNews(searchTerm);
      onClose();
      router.push('/');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.mobileMenuWrapper}>
      <div className={styles.mobileMenuHeader}>
        <a href="/" className={styles.logoLink} onClick={handleLogoClick}>
          <div className={styles.logo}>
            <span>My</span>News
          </div>
        </a>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#1D1D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="#1D1D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 16C9.77498 16 11.4012 15.4154 12.7308 14.4355L17.2929 19L19 17.2929L14.4355 12.7308C15.4154 11.4012 16 9.77498 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
              fill="#A5A5A4"
            />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search news"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>
      
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
        
        <button 
          className={`${styles.categoryChip} ${activeCategory === 'favorites' ? styles.active : ''}`} 
          onClick={() => {
            onClose();
            router.push('/favorites');
          }}
        >
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