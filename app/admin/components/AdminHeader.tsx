import styles from "../AdminPanel.module.css";

type AdminSection =
  | "dashboard"
  | "players"
  | "tasks"
  | "popups"
  | "daily-rewards"
  | "shop"
  | "vip"
  | "referral"
  | "leaderboard"
  | "statistics"
  | "settings";

type AdminHeaderProps = {
  activeSection: AdminSection;
  totalPlayers: number;
};

const sectionContent: Record<
  AdminSection,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
  }
> = {
  dashboard: {
    eyebrow: "Overview",
    title: "Dashboard",
    subtitle: "Основна інформація про Slot Club Telegram Mini App",
  },

  players: {
    eyebrow: "Management",
    title: "Players",
    subtitle: "Зареєстровані користувачі Telegram Mini App",
  },

  tasks: {
    eyebrow: "Game Management",
    title: "Tasks",
    subtitle:
      "Створення, налаштування та керування завданнями гравців",
  },
  popups: {
  eyebrow: "Communication",
  title: "Popups",
  subtitle:
    "Керування onboarding, новинами, нагородами та повідомленнями гравців",
},

  "daily-rewards": {
    eyebrow: "Retention",
    title: "Daily Rewards",
    subtitle:
      "Керування щоденними нагородами, VIP-множниками та серіями",
  },

  shop: {
    eyebrow: "Monetization",
    title: "Shop",
    subtitle:
      "Керування товарами, цінами, покупками та розблокуваннями",
  },

  vip: {
    eyebrow: "Progression",
    title: "VIP",
    subtitle:
      "Керування VIP-рівнями, бонусами та історією гравців",
  },

  referral: {
    eyebrow: "Growth",
    title: "Referral",
    subtitle:
      "Перегляд гравців, реферальних зв’язків і виданих нагород",
  },

  leaderboard: {
    eyebrow: "Competition",
    title: "Leaderboard",
    subtitle:
      "Загальний All Time рейтинг усіх гравців Slot Club",
  },

  statistics: {
    eyebrow: "Analytics",
    title: "Statistics",
    subtitle:
      "Аналітика гравців, економіки, активності та ігрового контенту",
  },
  settings: {
  eyebrow: "Configuration",
  title: "Settings",
  subtitle:
    "Глобальні налаштування гри, економіки, безпеки та системи",
},
};

export function AdminHeader({
  activeSection,
  totalPlayers,
}: AdminHeaderProps) {
  const content = sectionContent[activeSection];

  return (
    <header className={styles.topbar}>
      <div>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className={styles.subtitle}>{content.subtitle}</p>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.playerCounter}>
          <span>Всього гравців</span>
          <strong>{totalPlayers}</strong>
        </div>

        <div className={styles.headerAdmin}>
          <span className={styles.headerAvatar}>A</span>

          <div>
            <strong>Admin</strong>
            <span>Control Center</span>
          </div>
        </div>
      </div>
    </header>
  );
}