"use client";

import styles from "./BottomNavigation.module.css";

export type NavigationTab =
  | "club"
  | "tasks"
  | "daily"
  | "vip"
  | "referrals";

const navigationItems = [
  {
    id: "club" as const,
    label: "Club",
    icon: "♣",
  },
  {
    id: "tasks" as const,
    label: "Tasks",
    icon: "✓",
  },
  {
    id: "daily" as const,
    label: "Daily",
    icon: "◆",
  },
  {
    id: "vip" as const,
    label: "VIP",
    icon: "♛",
  },
  {
    id: "referrals" as const,
    label: "Friends",
    icon: "♟",
  },
];

type BottomNavigationProps = {
  activeTab: NavigationTab;
  onChange: (tab: NavigationTab) => void;
};

export function BottomNavigation({
  activeTab,
  onChange,
}: BottomNavigationProps) {
  return (
    <nav className={styles.navigation}>
      <div className={styles.navigationInner}>
        {navigationItems.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`${styles.navigationItem} ${
                isActive ? styles.active : ""
              }`}
              aria-label={item.label}
            >
              <span className={styles.iconWrap}>
                <span className={styles.icon}>
                  {item.icon}
                </span>
              </span>

              <span className={styles.label}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}