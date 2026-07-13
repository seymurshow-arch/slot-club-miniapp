import styles from "../AdminPanel.module.css";

type DashboardPlayer = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: Date;
  lastLoginAt: Date;
};

type DashboardSectionProps = {
  totalPlayers: number;
  registeredToday: number;
  activeToday: number;
  latestPlayers: DashboardPlayer[];
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getInitials(firstName: string | null, lastName: string | null) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join("");

  return initials || "P";
}

export function DashboardSection({
  totalPlayers,
  registeredToday,
  activeToday,
  latestPlayers,
}: DashboardSectionProps) {
  return (
    <section className={styles.dashboard}>
      <div className={styles.dashboardStats}>
        <article className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>♟</span>
            <span className={styles.statLabel}>Всього гравців</span>
          </div>

          <strong className={styles.statValue}>{totalPlayers}</strong>
          <p className={styles.statDescription}>
            Усі зареєстровані користувачі
          </p>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>+</span>
            <span className={styles.statLabel}>Нові сьогодні</span>
          </div>

          <strong className={styles.statValue}>{registeredToday}</strong>
          <p className={styles.statDescription}>
            Реєстрації від початку дня
          </p>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>●</span>
            <span className={styles.statLabel}>Активні сьогодні</span>
          </div>

          <strong className={styles.statValue}>{activeToday}</strong>
          <p className={styles.statDescription}>
            Заходили в Telegram Mini App
          </p>
        </article>
      </div>

      <article className={styles.dashboardCard}>
        <div className={styles.dashboardCardHeader}>
          <div>
            <h2>Останні гравці</h2>
            <p>Останні зареєстровані користувачі Mini App</p>
          </div>

          <span className={styles.liveBadge}>
            <i /> Live data
          </span>
        </div>

        {latestPlayers.length === 0 ? (
          <div className={styles.emptyState}>
            <span>♟</span>
            <strong>Гравців поки немає</strong>
            <p>Нові користувачі з’являться після входу в Mini App.</p>
          </div>
        ) : (
          <div className={styles.latestPlayersList}>
            {latestPlayers.map((player) => {
              const fullName =
                [player.firstName, player.lastName]
                  .filter(Boolean)
                  .join(" ") || "Без імені";

              return (
                <div key={player.id} className={styles.latestPlayerRow}>
                  <div className={styles.playerCell}>
                    {player.photoUrl ? (
                      <img
                        className={styles.playerAvatar}
                        src={player.photoUrl}
                        alt={fullName}
                        width={42}
                        height={42}
                      />
                    ) : (
                      <span className={styles.playerAvatarFallback}>
                        {getInitials(player.firstName, player.lastName)}
                      </span>
                    )}

                    <div className={styles.playerInfo}>
                      <strong>{fullName}</strong>
                      <span>
                        {player.username
                          ? `@${player.username}`
                          : "Без username"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.latestPlayerDates}>
                    <span>Реєстрація</span>
                    <strong>{formatDate(player.createdAt)}</strong>
                  </div>

                  <div className={styles.latestPlayerDates}>
                    <span>Останній вхід</span>
                    <strong>{formatDate(player.lastLoginAt)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}