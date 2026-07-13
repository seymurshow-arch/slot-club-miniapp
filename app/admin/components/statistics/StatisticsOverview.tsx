import type { StatisticsPlayer } from "./statisticsTypes";

import styles from "../../AdminPanel.module.css";

type StatisticsOverviewProps = {
  totalPlayers: number;
  registeredToday: number;
  activeToday: number;
  players: StatisticsPlayer[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFullName(player: StatisticsPlayer) {
  return (
    [player.firstName, player.lastName].filter(Boolean).join(" ") ||
    "Без імені"
  );
}

function getInitials(player: StatisticsPlayer) {
  const initials = [player.firstName, player.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join("");

  return initials || "P";
}

export function StatisticsOverview({
  totalPlayers,
  registeredToday,
  activeToday,
  players,
}: StatisticsOverviewProps) {
  const recentPlayers = [...players]
    .sort(
      (first, second) =>
        new Date(second.lastLoginAt).getTime() -
        new Date(first.lastLoginAt).getTime(),
    )
    .slice(0, 8);

  return (
    <section className={styles.statisticsOverview}>
      <div className={styles.statisticsMetricsGrid}>
        <article>
          <span>Total players</span>
          <strong>{totalPlayers}</strong>
          <small>Усі зареєстровані гравці</small>
        </article>

        <article>
          <span>Registered today</span>
          <strong>{registeredToday}</strong>
          <small>Нові акаунти від початку дня</small>
        </article>

        <article>
          <span>Active today</span>
          <strong>{activeToday}</strong>
          <small>Заходили в Telegram Mini App</small>
        </article>

        <article>
          <span>Retention</span>
          <strong>—</strong>
          <small>Після підключення історії сесій</small>
        </article>

        <article>
          <span>Tasks completed</span>
          <strong>—</strong>
          <small>Після підключення Tasks</small>
        </article>

        <article>
          <span>Daily claims</span>
          <strong>—</strong>
          <small>Після підключення Daily Rewards</small>
        </article>

        <article>
          <span>Shop purchases</span>
          <strong>—</strong>
          <small>Після підключення Shop</small>
        </article>

        <article>
          <span>Total referrals</span>
          <strong>—</strong>
          <small>Після підключення Referral</small>
        </article>
      </div>

      <div className={styles.statisticsOverviewGrid}>
        <article className={styles.statisticsChartCard}>
          <header>
            <div>
              <h2>Player Growth</h2>
              <p>Реєстрації гравців за вибраний період</p>
            </div>

            <span className={styles.statisticsPendingBadge}>
              Event tracking required
            </span>
          </header>

          <div className={styles.statisticsChartPlaceholder}>
            <span>⌁</span>

            <strong>Growth chart is not connected</strong>

            <p>
              Після підключення серверної аналітики тут буде графік
              реєстрацій за днями, тижнями та місяцями.
            </p>
          </div>
        </article>

        <article className={styles.statisticsHealthCard}>
          <header>
            <div>
              <h2>System Coverage</h2>
              <p>Стан підключення аналітичних модулів</p>
            </div>
          </header>

          <div className={styles.statisticsCoverageList}>
            <div>
              <span className={styles.statisticsCoverageReady}>✓</span>

              <div>
                <strong>Players</strong>
                <small>Базові реєстрації та входи</small>
              </div>

              <b>Connected</b>
            </div>

            <div>
              <span>○</span>

              <div>
                <strong>Game Economy</strong>
                <small>Монети, енергія, тапи</small>
              </div>

              <b>Pending</b>
            </div>

            <div>
              <span>○</span>

              <div>
                <strong>Tasks</strong>
                <small>Перегляди та виконання</small>
              </div>

              <b>Pending</b>
            </div>

            <div>
              <span>○</span>

              <div>
                <strong>Shop</strong>
                <small>Перегляди та покупки</small>
              </div>

              <b>Pending</b>
            </div>

            <div>
              <span>○</span>

              <div>
                <strong>Referral</strong>
                <small>Запрошення та конверсія</small>
              </div>

              <b>Pending</b>
            </div>
          </div>
        </article>
      </div>

      <article className={styles.statisticsActivityCard}>
        <header>
          <div>
            <h2>Recent Player Activity</h2>

            <p>Останні входи реальних користувачів Mini App</p>
          </div>

          <span className={styles.statisticsLiveBadge}>
            <i />
            Live data
          </span>
        </header>

        <div className={styles.statisticsActivityHeader}>
          <span>Player</span>
          <span>Telegram ID</span>
          <span>Registered</span>
          <span>Last login</span>
        </div>

        <div>
          {recentPlayers.map((player) => {
            const fullName = getFullName(player);

            return (
              <div
                key={player.id}
                className={styles.statisticsActivityRow}
              >
                <div className={styles.statisticsPlayerCell}>
                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={fullName}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <span>{getInitials(player)}</span>
                  )}

                  <div>
                    <strong>{fullName}</strong>

                    <small>
                      {player.username
                        ? `@${player.username}`
                        : "Без username"}
                    </small>
                  </div>
                </div>

                <span className={styles.statisticsTelegramId}>
                  {player.telegramId}
                </span>

                <span>{formatDate(player.createdAt)}</span>

                <span>{formatDate(player.lastLoginAt)}</span>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}