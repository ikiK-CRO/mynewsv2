'use client';

import Link from 'next/link';
import styles from './Sidebar.module.scss';
import React from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  category: string;
};

// Icons from the Default.svg file with exactly 20px dimensions
const icons: Record<string, React.ReactNode> = {
  home: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M19.7557 9.16673L10.589 0L10.2636 0 9.91065 0 0.744027 9.16673C0.505846 9.40503 0.434516 9.76343 0.563409 10.0747C0.692372 10.386 0.99617 10.5891 1.33315 10.5892H2.37475C2.48985 10.5892 2.58315 10.6824 2.58315 10.7975V18.9225C2.58315 19.3827 2.95625 19.7558 3.41645 19.7558H8.2082C8.32325 19.7558 8.41655 19.6625 8.41655 19.5475V15.5892C8.41655 14.4386 9.34935 13.5058 10.4998 13.5058C11.6504 13.5058 12.5832 14.4386 12.5832 15.5892V19.5475C12.5832 19.6625 12.6765 19.7558 12.7915 19.7558H17.5832C18.0434 19.7558 18.4165 19.3827 18.4165 18.9225V10.7975C18.4165 10.6824 18.5098 10.5892 18.6248 10.5892H19.6665C20.0035 10.5891 20.3073 10.386 20.4362 10.0747C20.5652 9.76343 20.4939 9.40503 20.2557 9.16673Z" fill="currentColor"/>
    </svg>
  ),
  general: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M17.5 5.83366C18.8807 5.83366 20 6.95295 20 8.33366V16.667C20 18.2778 18.6942 19.5837 17.0833 19.5837H2.91667C1.30584 19.5837 0 18.2778 0 16.667V2.08366C0 1.16318 0.746192 0.416992 1.66667 0.416992H14.1667C15.0871 0.416992 15.8333 1.16318 15.8333 2.08366V5.83366H17.5ZM1.66667 16.667C1.66667 17.3573 2.22631 17.917 2.91667 17.917L13.855 17.9162C13.9839 17.9161 14.1054 17.8565 14.1843 17.7546C14.2632 17.6527 14.2905 17.5201 14.2583 17.3953C14.1972 17.1574 14.1664 16.9127 14.1667 16.667V2.50033C14.1667 2.27021 13.9801 2.08366 13.75 2.08366H2.08333C1.85321 2.08366 1.66667 2.27021 1.66667 2.50033V16.667ZM18.3333 16.667C18.3333 17.3573 17.7737 17.917 17.0833 17.917C16.393 17.917 15.8333 17.3573 15.8333 16.667V7.91699C15.8333 7.68687 16.0199 7.50033 16.25 7.50033H17.5C17.9602 7.50033 18.3333 7.87342 18.3333 8.33366V16.667ZM4.585 3.75033C4.0097 3.75033 3.54333 4.21669 3.54333 4.79199V8.75033C3.54333 9.32562 4.0097 9.79199 4.585 9.79199H7.29333C7.86863 9.79199 8.335 9.32562 8.335 8.75033V4.79199C8.335 4.2167 7.86863 3.75033 7.29333 3.75033H4.585ZM10.6258 5.03949H12.2925C12.6377 5.03949 12.9175 5.31931 12.9175 5.66449V6.08116C12.9175 6.42634 12.6377 6.70616 12.2925 6.70616H10.6258C10.4603 6.7066 10.3014 6.64127 10.184 6.52452C10.0666 6.40778 10.0004 6.2492 10 6.08366V5.66699C9.99956 5.50072 10.0653 5.34111 10.1827 5.22338C10.3001 5.10566 10.4596 5.03949 10.6258 5.03949ZM12.2925 8.37283H10.6258C10.4596 8.37283 10.3001 8.43899 10.1827 8.55672C10.0653 8.67444 9.99956 8.83406 10 9.00033V9.41699C10.0014 9.76152 10.2813 10.04 10.6258 10.0395H12.2925C12.6377 10.0395 12.9175 9.75967 12.9175 9.41449V8.99783C12.9175 8.65265 12.6377 8.37283 12.2925 8.37283ZM3.95917 11.7062H12.2925C12.6377 11.7062 12.9175 11.986 12.9175 12.3312V12.7478C12.9175 13.093 12.6377 13.3728 12.2925 13.3728H3.95917C3.61464 13.3733 3.33471 13.0949 3.33333 12.7503V12.3337C3.33289 12.1674 3.39863 12.0078 3.51605 11.89C3.63346 11.7723 3.7929 11.7062 3.95917 11.7062ZM10.2083 15.0395H3.95833C3.79214 15.0395 3.63279 15.1057 3.51551 15.2234C3.39822 15.3412 3.33267 15.5008 3.33333 15.667V16.0837C3.33425 16.4281 3.61394 16.7066 3.95833 16.7062H10.2083C10.5535 16.7062 10.8333 16.4263 10.8333 16.0812V15.6645C10.8333 15.3193 10.5535 15.0395 10.2083 15.0395Z" fill="currentColor"/>
    </svg>
  ),
  business: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M17.5 19H2.5C1.11929 19 0 17.8492 0 16.4286V7C0 5.57964 1.11929 4.42857 2.5 4.42857H5.75C5.85406 4.42683 5.94132 4.3467 5.95417 4.24146L6.07417 3.25276C6.23051 1.96606 7.29409 1 8.55499 1H11.445C12.7049 1.00103 13.7671 1.96748 13.9233 3.25276L14.0433 4.24146C14.0564 4.34825 14.145 4.42857 14.25 4.42857H17.5C18.8807 4.42857 20 5.57964 20 7V16.4286C20 17.8492 18.8807 19 17.5 19ZM8.55499 2.71429C8.13451 2.71429 7.77956 3.03551 7.72749 3.46458L7.63999 4.18906C7.63292 4.24886 7.65137 4.30969 7.69091 4.35604C7.73045 4.4024 7.78712 4.42857 7.84669 4.42857H12.1533C12.2129 4.42857 12.2696 4.40241 12.3091 4.35604C12.3486 4.30963 12.3672 4.24881 12.36 4.18906L12.2725 3.46458C12.2204 3.03551 11.8655 2.71429 11.445 2.71429H8.55499ZM4.375 9.14286C4.375 8.78807 4.65482 8.5 4.99999 8.5H15C15.3452 8.5 15.625 8.78807 15.625 9.14286V9.57143C15.625 9.92622 15.3452 10.2143 15 10.2143H4.99999C4.65482 10.2143 4.375 9.92622 4.375 9.57143V9.14286ZM4.99999 13.2143C4.65482 13.2143 4.375 13.5024 4.375 13.8571V14.2857C4.375 14.6405 4.65482 14.9286 4.99999 14.9286H15C15.3452 14.9286 15.625 14.6405 15.625 14.2857V13.8571C15.625 13.5024 15.3452 13.2143 15 13.2143H4.99999Z" fill="currentColor"/>
    </svg>
  ),
  health: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fillRule="evenodd" clipRule="evenodd" d="M0 10C0 4.47715 4.47715 0 10 0C15.5204 0.00597071 19.994 4.47963 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10ZM2.29167 10C2.29167 14.2572 5.74281 17.7083 10 17.7083C14.2553 17.7037 17.7037 14.2553 17.7083 10C17.7083 5.74281 14.2572 2.29167 10 2.29167C5.74281 2.29167 2.29167 5.74281 2.29167 10Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M3.54199 10.0003C3.54199 6.43349 6.43349 3.54199 10.0003 3.54199C13.5655 3.54613 16.4545 6.4352 16.4587 10.0003C16.4587 13.5672 13.5672 16.4587 10.0003 16.4587C6.43349 16.4587 3.54199 13.5672 3.54199 10.0003ZM13.3337 11.2503C13.5638 11.2503 13.7503 11.0638 13.7503 10.8337V9.16699C13.7503 8.93687 13.5638 8.75033 13.3337 8.75033H11.667C11.4369 8.75033 11.2503 8.56378 11.2503 8.33366V6.66699C11.2503 6.43687 11.0638 6.25033 10.8337 6.25033H9.16699C8.93687 6.25033 8.75033 6.43687 8.75033 6.66699V8.33366C8.75033 8.56378 8.56378 8.75033 8.33366 8.75033H6.66699C6.43687 8.75033 6.25033 8.93687 6.25033 9.16699V10.8337C6.25033 11.0638 6.43687 11.2503 6.66699 11.2503H8.33366C8.56378 11.2503 8.75033 11.4369 8.75033 11.667V13.3337C8.75033 13.5638 8.93687 13.7503 9.16699 13.7503H10.8337C11.0638 13.7503 11.2503 13.5638 11.2503 13.3337V11.667C11.2503 11.4369 11.4369 11.2503 11.667 11.2503H13.3337Z" fill="currentColor"/>
      </g>
    </svg>
  ),
  science: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fillRule="evenodd" clipRule="evenodd" d="M9.95136 6.57833C10.0799 6.50382 10.159 6.36546 10.1585 6.21583L10.1519 5.41667C10.1519 5.18655 9.96716 5 9.73923 5H7.85976C7.50889 4.99999 7.19636 5.22394 7.08057 5.55833L2.84208 17.7792C2.79795 17.9066 2.81772 18.0477 2.89511 18.1578C2.97251 18.2679 3.09795 18.3333 3.23167 18.3333H13.7904C14.2462 18.3333 14.6158 18.7064 14.6158 19.1667C14.6158 19.6269 14.2462 20 13.7904 20H2.65141C2.11657 20.0002 1.61479 19.7388 1.30505 19.2986C0.9953 18.8584 0.915973 18.294 1.0922 17.7842L6.4871 2.22417C6.63799 1.7897 7.10917 1.56099 7.5395 1.71333C7.96984 1.86567 8.19637 2.34137 8.04548 2.77583C7.99985 2.9041 8.01923 3.04678 8.09738 3.1579C8.17553 3.26903 8.30257 3.33454 8.43755 3.33333H9.74583C9.97377 3.33333 10.1585 3.14679 10.1585 2.91667V1.25C10.1585 0.559644 10.7129 0 11.3967 0H13.8729C14.5567 0 15.111 0.559644 15.111 1.25V2.91667C15.111 3.14679 15.2958 3.33333 15.5237 3.33333H16.3491C16.805 3.33333 17.1746 3.70643 17.1746 4.16667C17.1746 4.6269 16.805 5 16.3491 5H15.5237C15.2958 5 15.111 5.18655 15.111 5.41667V6.21583C15.1108 6.36563 15.1902 6.50403 15.319 6.57833C16.9807 7.53453 18.0048 9.31899 18 11.25C18 14.2415 15.5979 16.6667 12.6348 16.6667C9.67167 16.6667 7.26959 14.2415 7.26959 11.25C7.26512 9.31886 8.28946 7.53445 9.95136 6.57833ZM9.95219 11.6667C9.95219 12.0118 10.2293 12.2917 10.5712 12.2917C10.9131 12.2917 11.1903 12.0118 11.1903 11.6667C11.1903 11.3215 10.9131 11.0417 10.5712 11.0417C10.2293 11.0417 9.95219 11.3215 9.95219 11.6667ZM12.8411 14.375C12.4992 14.375 12.2221 14.0952 12.2221 13.75C12.2221 13.4048 12.4992 13.125 12.8411 13.125C13.183 13.125 13.4602 13.4048 13.4602 13.75C13.4602 13.9165 13.3944 14.0761 13.2774 14.1934C13.1604 14.3108 13.0019 14.3761 12.837 14.375H12.8411ZM13.6665 11.8275C13.6665 12.4028 14.1285 12.8692 14.6983 12.8692C15.2678 12.8682 15.7292 12.4024 15.7301 11.8275C15.7301 11.2522 15.2681 10.7858 14.6983 10.7858C14.1285 10.7858 13.6665 11.2522 13.6665 11.8275ZM11.8094 2.08333C11.8094 1.85321 11.9941 1.66667 12.2221 1.66667H13.0475C13.2754 1.66667 13.4602 1.85321 13.4602 2.08333V2.91667C13.4602 3.14679 13.2754 3.33333 13.0475 3.33333H12.2221C11.9941 3.33333 11.8094 3.14679 11.8094 2.91667V2.08333ZM13.4602 5.41667C13.4602 5.18655 13.2754 5 13.0475 5H12.2221C11.9941 5 11.8094 5.18655 11.8094 5.41667V7C11.8088 7.34367 11.5994 7.65177 11.2819 7.77583C10.3803 8.12779 9.65013 8.82074 9.24646 9.7075C9.21766 9.7721 9.22321 9.84703 9.26121 9.90659C9.29921 9.96615 9.36448 10.0022 9.43465 10.0025H15.8316C15.9018 10.0024 15.9671 9.96628 16.005 9.90662C16.0429 9.84696 16.0482 9.77195 16.019 9.7075C15.6158 8.8209 14.8858 8.12815 13.9843 7.77667C13.6679 7.65142 13.4599 7.34315 13.4602 7V5.41667Z" fill="currentColor"/>
      </g>
    </svg>
  ),
  sports: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fillRule="evenodd" clipRule="evenodd" d="M0 10C0 4.47715 4.47715 0 10 0C15.5204 0.00597071 19.994 4.47963 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10ZM11.0942 3.08583C10.9418 3.15231 10.8436 3.30296 10.8442 3.46917L10.84 5.62833C10.8397 5.76169 10.9032 5.88715 11.0108 5.96583L13.9275 8.0875C14.0568 8.18196 14.2288 8.19395 14.37 8.11833L15.9817 7.25417C16.1063 7.18731 16.1885 7.0618 16.2 6.92083L16.4325 4.29417C16.4429 4.17472 16.4013 4.0566 16.3183 3.97C15.583 3.1978 14.7133 2.56584 13.7517 2.105C13.6436 2.05326 13.5185 2.05053 13.4083 2.0975L11.0942 3.08583ZM3.69917 3.94917C4.43294 3.18332 5.29945 2.55681 6.25667 2.1C6.36471 2.04826 6.4898 2.04553 6.6 2.0925L8.92417 3.08333C9.0765 3.14981 9.17475 3.30046 9.17417 3.46667V5.62917C9.17299 5.7612 9.10931 5.88487 9.0025 5.9625L6.16917 8.0275C6.04433 8.11899 5.87907 8.13375 5.74 8.06583L4.04917 7.24C3.91787 7.17602 3.82966 7.04797 3.81667 6.9025L3.58333 4.27417C3.57317 4.15419 3.61541 4.03567 3.69917 3.94917ZM5.53417 14.81L6.47333 13.7617C6.57054 13.6518 6.60282 13.4989 6.55833 13.3592L5.49417 10.0708C5.46077 9.96854 5.38911 9.88314 5.29417 9.8325L3.54417 8.89333C3.37275 8.80111 3.16032 8.83986 3.0325 8.98667L1.42833 10.8333C1.35232 10.9231 1.31781 11.0409 1.33333 11.1575C1.47175 12.2024 1.79932 13.2133 2.3 14.1408C2.35708 14.2461 2.45665 14.3216 2.57333 14.3483L5.13 14.9375C5.27789 14.9718 5.43273 14.923 5.53417 14.81ZM13.14 16.2617L11.8575 18.4092C11.7959 18.5126 11.6926 18.5843 11.5742 18.6058C10.5436 18.7933 9.48775 18.7947 8.45667 18.61C8.33794 18.5887 8.23429 18.5169 8.1725 18.4133L6.885 16.265C6.7911 16.1082 6.81036 15.9085 6.9325 15.7725L7.87083 14.725C7.95004 14.6368 8.06309 14.5864 8.18167 14.5867H11.8425C11.9611 14.5864 12.0741 14.6368 12.1533 14.725L13.0908 15.7725C13.2126 15.9083 13.2318 16.1075 13.1383 16.2642L13.14 16.2617ZM17.4283 14.3458C17.545 14.3191 17.6446 14.2436 17.7017 14.1383L17.7 14.1408C18.2014 13.2148 18.5301 12.2053 18.67 11.1617C18.6858 11.0432 18.65 10.9236 18.5717 10.8333L16.97 8.98C16.8423 8.83361 16.6304 8.79489 16.4592 8.88667L14.7092 9.82583C14.6142 9.87647 14.5426 9.96188 14.5092 10.0642L13.445 13.3525C13.3985 13.4932 13.4302 13.6481 13.5283 13.7592L14.4675 14.8075C14.5689 14.9205 14.7238 14.9693 14.8717 14.935L17.4283 14.3458Z" fill="currentColor"/>
      </g>
    </svg>
  ),
  technology: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fillRule="evenodd" clipRule="evenodd" d="M18.125 1.45801H1.875C0.840037 1.45939 0.0013772 2.29804 0 3.33301V12.4997C0.0013772 13.5346 0.840037 14.3733 1.875 14.3747H8.54167C8.77179 14.3747 8.95833 14.5612 8.95833 14.7913V16.0413C8.95833 16.2715 8.77179 16.458 8.54167 16.458H6.04167C5.46637 16.458 5 16.9244 5 17.4997C5 18.075 5.46637 18.5413 6.04167 18.5413H13.9583C14.5336 18.5413 15 18.075 15 17.4997C15 16.9244 14.5336 16.458 13.9583 16.458H11.4583C11.2282 16.458 11.0417 16.2715 11.0417 16.0413V14.7913C11.0417 14.5612 11.2282 14.3747 11.4583 14.3747H18.125C19.16 14.3733 19.9986 13.5346 20 12.4997V3.33301C19.9986 2.29804 19.16 1.45939 18.125 1.45801ZM17.9167 11.8747C17.9167 12.1048 17.7301 12.2913 17.5 12.2913H2.5C2.26988 12.2913 2.08333 12.1048 2.08333 11.8747V3.95801C2.08333 3.72789 2.26988 3.54134 2.5 3.54134H17.5C17.7301 3.54134 17.9167 3.72789 17.9167 3.95801V11.8747Z" fill="currentColor"/>
      </g>
    </svg>
  ),
};

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: icons.home, category: 'general' },
  { href: '/category/general', label: 'General', icon: icons.general, category: 'general' },
  { href: '/category/business', label: 'Business', icon: icons.business, category: 'business' },
  { href: '/category/health', label: 'Health', icon: icons.health, category: 'health' },
  { href: '/category/science', label: 'Science', icon: icons.science, category: 'science' },
  { href: '/category/sports', label: 'Sports', icon: icons.sports, category: 'sports' },
  { href: '/category/technology', label: 'Technology', icon: icons.technology, category: 'technology' },
];

interface SidebarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory = 'general', onCategoryChange }) => {
  const handleItemClick = (category: string, e: React.MouseEvent) => {
    if (onCategoryChange) {
      e.preventDefault();
      onCategoryChange(category);
    }
  };

  return (
    <nav className={styles.sidebar}>
      {navItems.map((item) => (
        <Link
          href={item.href}
          key={item.label}
          className={`${styles.navItem} ${item.category === activeCategory ? styles.active : ''}`}
          onClick={(e) => handleItemClick(item.category, e)}
        >
          <div className={styles.iconWrapper}>{item.icon}</div>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Sidebar; 