import styles from './page.module.scss';
import SearchSection from './components/SearchSection';
import Divider from './components/Divider';
import Sidebar from './components/Sidebar';
import NewsGrid from './components/NewsGrid';
import LatestNews from './components/LatestNews';
import React from 'react';

const Home: React.FC = () => {
  return (
    <main className={styles.container}>
      <SearchSection />
      <Divider />
      <div className={styles.contentGrid}>
        <aside className={styles.sidebarContainer}>
          <Sidebar />
        </aside>
        <section className={styles.newsGridContainer}>
          <h2 className={styles.sectionTitle}>News</h2>
          <NewsGrid />
        </section>
        <aside className={styles.latestNewsContainer}>
          <LatestNews />
        </aside>
      </div>
    </main>
  );
};

export default Home; 