import React from 'react';
import styles from './AdCard.module.scss';

interface AdCardProps {
  title?: string;
  author?: string;
  imageUrl?: string;
}

const AdCard: React.FC<AdCardProps> = ({
  title = "Compare Prices Find The Best Computer Accessory",
  author = "Gary Weber",
  imageUrl = "/adPlaceholder.png" // Using the provided adPlaceholder.png
}) => {
  return (
    <div className={styles.adCard}>
      <div className={styles.imageContainer}>
        <span className={styles.adLabel}>AD</span>
        <img 
          src={imageUrl} 
          alt="Advertisement" 
          className={styles.adImage}
        />
      </div>
      <div className={styles.adContent}>
        <span className={styles.adType}>PROGRAMMATIC/NATIVE AD</span>
        <h3 className={styles.adTitle}>{title}</h3>
        <p className={styles.adAuthor}>{author}</p>
      </div>
    </div>
  );
};

export default AdCard; 