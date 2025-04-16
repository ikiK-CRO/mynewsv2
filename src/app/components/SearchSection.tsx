import Link from 'next/link';
import styles from './SearchSection.module.scss';
import React, { useState } from 'react';
import { useSearch } from '../context/SearchContext';
import MobileMenu from './MobileMenu';
import { useArticles } from '../context/ArticleContext';
import { useRouter } from 'next/navigation';

interface SearchSectionProps {
  onSearch?: (searchTerm: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { searchNews: contextSearch, searchTerm: contextSearchTerm, clearSearch } = useSearch();
  const { activeCategory, setActiveCategory } = useArticles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Use the context search function if no onSearch prop is provided
      if (onSearch) {
        onSearch(searchTerm.trim());
      } else {
        contextSearch(searchTerm.trim());
      }
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    <div className={styles.searchSection}>
      <div className={styles.headerRow}>
        <a href="/" className={styles.logoLink} onClick={handleLogoClick}>
          <div className={styles.logo}>
            <span>My</span>News
          </div>
        </a>
        <button className={styles.mobileMenuButton} onClick={handleMobileMenuToggle}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </button>
      </div>
      
      <form className={styles.searchWrapper} onSubmit={handleSearchSubmit}>
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
          onChange={handleSearchChange}
        />
        <button type="submit" className={styles.searchButton}>
          SEARCH
        </button>
      </form>

      {isMobileMenuOpen && (
        <MobileMenu 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchSection; 