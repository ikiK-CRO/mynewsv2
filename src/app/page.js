import styles from './page.module.scss';
import SearchSection from './components/SearchSection';
import Divider from './components/Divider';
import Sidebar from './components/Sidebar';
import NewsGrid from './components/NewsGrid';
import LatestNews from './components/LatestNews';

export default function Home() {
  return (
    <main className={styles.container}>
      <SearchSection />
      <Divider />
      <div className={styles.contentGrid}>
        <Sidebar />
        <NewsGrid />
        <LatestNews />
      </div>
    </main>
  );
}
