import styles from './Divider.module.scss';
import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
}

const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal' }) => {
  return <div className={`${styles.divider} ${styles[orientation]}`} />;
};

export default Divider; 