import styles from "../../AdminPanel.module.css";

const modules = [
  {
    icon: "✓",
    title: "Tasks Performance",
    description:
      "Перегляди, відкриття, виконання, completion rate і видані нагороди.",
    metrics: [
      "Task views",
      "Task starts",
      "Completions",
      "Completion rate",
    ],
  },
  {
    icon: "◇",
    title: "Shop Performance",
    description:
      "Перегляди товарів, покупки, розблокування за дії та conversion rate.",
    metrics: [
      "Item views",
      "Purchases",
      "Action unlocks",
      "Conversion",
    ],
  },
  {
    icon: "◆",
    title: "Daily Rewards",
    description:
      "Claims, активні streak, пропущені дні та середня довжина серії.",
    metrics: [
      "Claims",
      "Active streaks",
      "Average streak",
      "Missed rewards",
    ],
  },
  {
    icon: "↗",
    title: "Referral Performance",
    description:
      "Запрошення, реєстрації, активні реферали та конверсія.",
    metrics: [
      "Invites",
      "Registrations",
      "Active referrals",
      "Conversion",
    ],
  },
];

export function ContentPerformanceStats() {
  return (
    <section className={styles.contentStatistics}>
      <div className={styles.contentStatisticsGrid}>
        {modules.map((module) => (
          <article
            key={module.title}
            className={styles.contentPerformanceCard}
          >
            <header>
              <span>{module.icon}</span>

              <div>
                <h2>{module.title}</h2>
                <p>{module.description}</p>
              </div>
            </header>

            <div className={styles.contentPerformanceMetrics}>
              {module.metrics.map((metric) => (
                <div key={metric}>
                  <span>{metric}</span>
                  <strong>—</strong>
                </div>
              ))}
            </div>

            <footer>
              <span>Not connected</span>

              <small>
                Дані з’являться після підключення відповідного
                модуля.
              </small>
            </footer>
          </article>
        ))}
      </div>

      <article className={styles.contentRankingCard}>
        <header>
          <div>
            <h2>Top Performing Content</h2>

            <p>
              Найефективніші Tasks, товари та рекламні кампанії
            </p>
          </div>

          <select disabled defaultValue="tasks">
            <option value="tasks">Tasks</option>
            <option value="shop">Shop items</option>
            <option value="daily">Daily rewards</option>
            <option value="referral">Referral campaigns</option>
          </select>
        </header>

        <div className={styles.contentRankingHeader}>
          <span>Content</span>
          <span>Views</span>
          <span>Starts</span>
          <span>Completions</span>
          <span>Conversion</span>
          <span>Rewards issued</span>
        </div>

        <div className={styles.contentRankingEmpty}>
          <span>⌁</span>

          <strong>No performance data yet</strong>

          <p>
            Після підключення подій тут з’явиться рейтинг
            найефективнішого контенту.
          </p>
        </div>
      </article>
    </section>
  );
}