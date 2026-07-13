import type { LeaderboardPlayer } from "./leaderboardTypes";

import styles from "../../AdminPanel.module.css";

type LeaderboardTableProps = {
  players: LeaderboardPlayer[];
};

function getFullName(player: LeaderboardPlayer) {
  return (
    [player.firstName, player.lastName].filter(Boolean).join(" ") ||
    "Без імені"
  );
}

function getInitials(player: LeaderboardPlayer) {
  const initials = [player.firstName, player.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join("");

  return initials || "P";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getRankIcon(rank: number) {
  if (rank === 1) return "♛";
  if (rank === 2) return "◆";
  if (rank === 3) return "♜";

  return rank.toString();
}

export function LeaderboardTable({
  players,
}: LeaderboardTableProps) {
  if (players.length === 0) {
    return (
      <div className={styles.leaderboardEmpty}>
        <span>♜</span>
        <strong>Гравців не знайдено</strong>
        <p>Змініть пошуковий запит або налаштування таблиці.</p>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardTableScroll}>
      <div className={styles.leaderboardTable}>
        <div className={styles.leaderboardTableHeader}>
          <span>Rank</span>
          <span>Player</span>
          <span>Telegram ID</span>
          <span>Balance</span>
          <span>VIP</span>
          <span>Total taps</span>
          <span>Total earned</span>
          <span>Last activity</span>
          <span />
        </div>

        <div className={styles.leaderboardTableBody}>
          {players.map((player, index) => {
            const rank = index + 1;
            const fullName = getFullName(player);

            return (
              <div
                key={player.id}
                className={`${styles.leaderboardRow} ${
                  rank <= 3 ? styles.leaderboardTopRow : ""
                }`}
              >
                <span
                  className={`${styles.leaderboardRank} ${
                    rank === 1
                      ? styles.leaderboardRankOne
                      : rank === 2
                        ? styles.leaderboardRankTwo
                        : rank === 3
                          ? styles.leaderboardRankThree
                          : ""
                  }`}
                >
                  {getRankIcon(rank)}
                </span>

                <span className={styles.leaderboardPlayerCell}>
                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={fullName}
                      width={42}
                      height={42}
                      className={styles.leaderboardAvatar}
                    />
                  ) : (
                    <span className={styles.leaderboardAvatarFallback}>
                      {getInitials(player)}
                    </span>
                  )}

                  <span className={styles.leaderboardPlayerInfo}>
                    <strong>{fullName}</strong>
                    <small>
                      {player.username
                        ? `@${player.username}`
                        : "Без username"}
                    </small>
                  </span>
                </span>

                <span className={styles.leaderboardTelegramId}>
                  {player.telegramId}
                </span>

                <span className={styles.leaderboardNotConnected}>—</span>

                <span className={styles.leaderboardVipBadge}>
                  Not connected
                </span>

                <span className={styles.leaderboardNotConnected}>—</span>

                <span className={styles.leaderboardNotConnected}>—</span>

                <span className={styles.leaderboardDate}>
                  {formatDate(player.lastLoginAt)}
                </span>

                <a
                  href={`/admin?section=players`}
                  className={styles.leaderboardManageButton}
                >
                  Manage
                  <b>→</b>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}