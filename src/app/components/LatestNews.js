import styles from './LatestNews.module.scss';
import Link from 'next/link';

// Dummy data for latest news
const latestNewsItems = [
  { id: 1, time: '14:30', title: 'How To Write Better Advertising Copy', href: '#' },
  { id: 2, time: '14:30', title: '6 Powerful Tips To Creating Testimonials That Sell Your Products', href: '#' },
  { id: 3, time: '14:30', title: '5 Reasons To Choose A Notebook Over A Computer Desktop', href: '#' },
  { id: 4, time: '14:30', title: 'Cdc Issues Health Alert Notice For Travelers To Usa From Hon', href: '#' },
  { id: 5, time: '14:30', title: 'Use Your Reset Button', href: '#' },
  // Add more items if needed
];

export default function LatestNews() {
  return (
    <aside className={styles.latestNews}>
      <h2 className={styles.heading}>
        <span className={styles.icon}></span> Latest news
      </h2>
      <div className={styles.newsList}>
        {latestNewsItems.map((item) => (
          <div key={item.id} className={styles.newsItem}>
            <span className={styles.time}>{item.time}</span>
            <Link href={item.href} className={styles.titleLink}>
              {item.title}
            </Link>
          </div>
        ))}
      </div>
      <Link href="/all-news" className={styles.seeAllLink}>
        See all news &gt;
      </Link>
    </aside>
  );
} 