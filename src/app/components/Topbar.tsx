import styles from './Topbar.module.scss';
import React from 'react';

const Topbar: React.FC = () => {
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
        </div>
      </div>
    </header>
  );
};

export default Topbar; 