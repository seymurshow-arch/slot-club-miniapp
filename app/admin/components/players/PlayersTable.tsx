import type { AdminPlayer } from "./playerTypes";

import styles from "../../AdminPanel.module.css";

type PlayersTableProps = {
  players: AdminPlayer[];
  selectedPlayerId: string | null;
  onSelectPlayer: (player: AdminPlayer) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFullName(player: AdminPlayer) {
  return (
    [player.firstName, player.lastName].filter(Boolean).join(" ") ||
    "Без імені"
  );
}

function getInitials(player: AdminPlayer) {
  const initials = [player.firstName, player.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join("");

  return initials || "P";
}

export function PlayersTable({
  players,
  selectedPlayerId,
  onSelectPlayer,
}: PlayersTableProps) {
  if (players.length === 0) {
    return (
      <div className={styles.playersEmptyState}>
        <span className={styles.playersEmptyIcon}>♟</span>
        <strong>Гравців не знайдено</strong>
        <p>Змініть пошуковий запит або вибрані фільтри.</p>
      </div>
    );
  }

  return (
    <div className={styles.playersTableScroll}>
      <div className={styles.playersTable}>
        <div className={styles.playersTableHeader}>
          <span>Player</span>
          <span>Telegram ID</span>
          <span>Status</span>
          <span>Last activity</span>
          <span>Registered</span>
          <span />
        </div>

        <div className={styles.playersTableBody}>
          {players.map((player) => {
            const fullName = getFullName(player);
            const isSelected = selectedPlayerId === player.id;

            return (
              <button
                key={player.id}
                type="button"
                className={`${styles.playersTableRow} ${
                  isSelected ? styles.playersTableRowSelected : ""
                }`}
                onClick={() => onSelectPlayer(player)}
              >
                <span className={styles.playersPlayerCell}>
                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={fullName}
                      width={42}
                      height={42}
                      className={styles.playersAvatar}
                    />
                  ) : (
                    <span className={styles.playersAvatarFallback}>
                      {getInitials(player)}
                    </span>
                  )}

                  <span className={styles.playersPlayerInfo}>
                    <strong>{fullName}</strong>
                    <small>
                      {player.username
                        ? `@${player.username}`
                        : "Без username"}
                    </small>
                  </span>
                </span>

                <span className={styles.playersTelegramId}>
                  {player.telegramId}
                </span>

                <span>
                  <span className={styles.playerStatusBadge}>
                    <i />
                    Active
                  </span>
                </span>

                <span className={styles.playersDate}>
                  {formatDate(player.lastLoginAt)}
                </span>

                <span className={styles.playersDate}>
                  {formatDate(player.createdAt)}
                </span>

                <span className={styles.managePlayerButton}>
                  Manage
                  <b>→</b>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}