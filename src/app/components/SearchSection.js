import styles from './SearchSection.module.css';

export default function SearchSection() {
  return (
    <div className={styles.searchSection}>
      <div className={styles.logo}>
        <span style={{ color: '#C81A1A' }}>My</span>News
      </div>
      <div className={styles.searchWrapper}>
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
        />
        <button className={styles.searchButton}>
          SEARCH
        </button>
      </div>
    </div>
  );
} 