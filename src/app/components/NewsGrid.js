import styles from './NewsGrid.module.scss';

// Dummy data for news items
const newsItems = [
  { id: 1, category: 'TECH', title: 'V7 Digital Photo Printing', author: 'Caroline Parsons', image: 'https://via.placeholder.com/400x250/E8E8E8/AAAAAA?text=News+Image+1' },
  { id: 2, category: 'SPORT', title: 'Fta Keys', author: 'Bertie Campbell', image: 'https://via.placeholder.com/400x250/E8E8E8/AAAAAA?text=News+Image+2' },
  { id: 3, category: 'NEWS', title: 'What Is Hdcp', author: 'Jim Gonzalez', image: 'https://via.placeholder.com/400x250/E8E8E8/AAAAAA?text=News+Image+3' },
  { id: 4, category: 'BREAKING', title: 'Peace On Earth A Wonderful Wish But No Way', author: 'Bertie Campbell', image: 'https://via.placeholder.com/400x250/333333/FFFFFF?text=Breaking+News' },
];

export default function NewsGrid() {
  return (
    <div className={styles.newsGrid}>
      {newsItems.map((item) => (
        <div key={item.id} className={`${styles.newsCard} ${item.category === 'BREAKING' ? styles.breaking : ''}`}>
          <img src={item.image} alt={item.title} className={styles.newsImage} />
          <div className={styles.cardContent}>
            {item.category === 'BREAKING' ? (
              <span className={styles.breakingTag}>BREAKING</span>
            ) : (
              <span className={styles.category}>{item.category}</span>
            )}
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.author}>{item.author}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 