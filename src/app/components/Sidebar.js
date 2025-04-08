import Link from 'next/link';
import styles from './Sidebar.module.scss';

// Extracted icons from the provided SVG
const icons = {
  home: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M16.5647 4.53425L10.2314 -1.79909C10.079 -1.95149 9.82902 -1.95149 9.67663 -1.79909L3.34329 4.53425C3.24801 4.62953 3.21947 4.77288 3.27105 4.89723C3.32264 5.02158 3.44416 5.10292 3.57895 5.10292H4.00604C4.05208 5.10292 4.08938 5.14022 4.08938 5.18626V11.1667C4.08938 11.3508 4.23862 11.5 4.42272 11.5H7.5344C7.58045 11.5 7.61775 11.4627 7.61775 11.4167V8.83333C7.61775 8.37312 7.99085 8 8.45109 8H11.457C11.9172 8 12.2903 8.37312 12.2903 8.83333V11.4167C12.2903 11.4627 12.3276 11.5 12.3736 11.5H15.4854C15.6695 11.5 15.8187 11.3508 15.8187 11.1667V5.18626C15.8187 5.14022 15.856 5.10292 15.9021 5.10292H16.3292C16.464 5.10292 16.5855 5.02158 16.6371 4.89723C16.6887 4.77288 16.6601 4.62953 16.5647 4.53425Z" fill="currentColor"/>
    </svg>
  ),
  general: (
    <svg viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.83325 1.66663H14.1666C14.6268 1.66663 14.9999 2.03972 14.9999 2.49996V15.8333C14.9999 16.2935 14.6268 16.6666 14.1666 16.6666H5.83325C5.37301 16.6666 4.99992 16.2935 4.99992 15.8333V2.49996C4.99992 2.03972 5.37301 1.66663 5.83325 1.66663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.16675 14.1666H10.8334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  business: (
    <svg viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.1667 5.83333H5.83341C5.37318 5.83333 5.00008 6.20643 5.00008 6.66667V14.1667C5.00008 14.6269 5.37318 15 5.83341 15H14.1667C14.627 15 15.0001 14.6269 15.0001 14.1667V6.66667C15.0001 6.20643 14.627 5.83333 14.1667 5.83333Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 15V4.16667C12.5 3.70643 12.1269 3.33333 11.6667 3.33333H8.33333C7.8731 3.33333 7.5 3.70643 7.5 4.16667V15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  health: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.3333C14.6024 18.3333 18.3334 14.6023 18.3334 9.99996C18.3334 5.39759 14.6024 1.66663 10 1.66663C5.39765 1.66663 1.66669 5.39759 1.66669 9.99996C1.66669 14.6023 5.39765 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3334 10H10.0001V6.66663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 13.3334H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  science: (
     <svg viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.4167 19.1667H2.58333C2.1231 19.1667 1.75 18.7936 1.75 18.3333V7.08333C1.75 6.6231 2.1231 6.25 2.58333 6.25H15.4167C15.8769 6.25 16.25 6.6231 16.25 7.08333V18.3333C16.25 18.7936 15.8769 19.1667 15.4167 19.1667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.08325 6.25V3.75C5.08325 2.13043 6.44698 0.833336 8.12492 0.833336H9.87492C11.5529 0.833336 12.9166 2.13043 12.9166 3.75V6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 10H9.00833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.0833 10H12.0916" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 13.3334H9.00833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.0833 13.3334H12.0916" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  sports: (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 18.3333C14.6024 18.3333 18.3334 14.6023 18.3334 9.99996C18.3334 5.39759 14.6024 1.66663 10 1.66663C5.39765 1.66663 1.66669 5.39759 1.66669 9.99996C1.66669 14.6023 5.39765 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M3.54199 10C3.54199 6.43333 6.43349 3.54163 10.0002 3.54163C13.5669 3.54163 16.4585 6.43333 16.4585 10C16.4585 13.5667 13.5669 16.4583 10.0002 16.4583C6.43349 16.4583 3.54199 13.5667 3.54199 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1.79761 14.1158L6.57317 15.8058" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.3333 5.62496L13.4583 4.16663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.625 1.66663L4.16667 6.54163" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.375 18.3334L15.8333 13.4584" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  technology: (
    <svg viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.125 15.8334H1.875C0.839916 15.8334 0 15.0119 0 14.0001V3.00008C0 2.01268 0.839916 1.16675 1.875 1.16675H18.125C19.1601 1.16675 20 2.01268 20 3.00008V14.0001C20 15.0119 19.1601 15.8334 18.125 15.8334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.45825 18.3334H13.5416" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 15.8334V18.3334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const navItems = [
  { href: '/', label: 'Home', icon: icons.home, active: true }, // Assuming Home is active based on image
  { href: '/general', label: 'General', icon: icons.general },
  { href: '/business', label: 'Business', icon: icons.business },
  { href: '/health', label: 'Health', icon: icons.health },
  { href: '/science', label: 'Science', icon: icons.science },
  { href: '/sports', label: 'Sports', icon: icons.sports },
  { href: '/technology', label: 'Technology', icon: icons.technology },
];

export default function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      {navItems.map((item) => (
        <Link
          href={item.href}
          key={item.label}
          className={`${styles.navItem} ${item.active ? styles.active : ''}`}
        >
          <div className={styles.iconWrapper}>{item.icon}</div>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
} 