import Link from "next/link";

import type { AdminSection } from "../adminTypes";
import styles from "../AdminPanel.module.css";

type AdminSidebarProps = {
  activeSection: AdminSection;
};

type NavigationItem = {
  id: AdminSection;
  label: string;
  icon: string;
  href: string;
  enabled: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "▦",
    href: "/admin?section=dashboard",
    enabled: true,
  },
  {
    id: "players",
    label: "Players",
    icon: "♟",
    href: "/admin?section=players",
    enabled: true,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: "✓",
    href: "/admin?section=tasks",
    enabled: true,
  },
  {
    id: "popups",
    label: "Popups",
    icon: "▣",
    href: "/admin?section=popups",
    enabled: true,
  },
  {
    id: "daily-rewards",
    label: "Daily Rewards",
    icon: "◆",
    href: "/admin?section=daily-rewards",
    enabled: true,
  },
  {
    id: "shop",
    label: "Shop",
    icon: "◇",
    href: "/admin?section=shop",
    enabled: true,
  },
  {
    id: "referral",
    label: "Referral",
    icon: "↗",
    href: "/admin?section=referral",
    enabled: true,
  },
  {
    id: "vip",
    label: "VIP",
    icon: "♛",
    href: "/admin?section=vip",
    enabled: true,
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: "♜",
    href: "/admin?section=leaderboard",
    enabled: true,
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: "⌁",
    href: "/admin?section=statistics",
    enabled: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙",
    href: "/admin?section=settings",
    enabled: true,
  },
];

export function AdminSidebar({
  activeSection,
}: AdminSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>♣</span>

        <div>
          <strong>Slot Club</strong>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav
        className={styles.navigation}
        aria-label="Admin navigation"
      >
        {navigationItems.map((item) => {
          const isActive = item.id === activeSection;

          if (!item.enabled) {
            return (
              <button
                key={item.id}
                type="button"
                className={styles.navButton}
                disabled
                title={`${item.label} — coming soon`}
              >
                <span className={styles.navIcon}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <small>Soon</small>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navButton} ${
                isActive ? styles.navButtonActive : ""
              }`}
              aria-current={
                isActive ? "page" : undefined
              }
            >
              <span className={styles.navIcon}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarBottom}>
        <div className={styles.adminProfile}>
          <span className={styles.adminAvatar}>A</span>

          <div>
            <strong>Administrator</strong>

            <span>
              <i /> Online
            </span>
          </div>
        </div>

        <form
          action="/api/admin/logout"
          method="post"
        >
          <button
            className={styles.logoutButton}
            type="submit"
          >
            <span>↪</span>
            <span>Log out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}