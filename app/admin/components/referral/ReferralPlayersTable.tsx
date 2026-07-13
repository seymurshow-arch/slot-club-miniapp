import type { ReferralAdminPlayer } from "./referralTypes";

import styles from "../../AdminPanel.module.css";

type ReferralPlayersTableProps = {
  players: ReferralAdminPlayer[];
  selectedPlayerId: string | null;
  onSelectPlayer: (player: ReferralAdminPlayer) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFullName(player: ReferralAdminPlayer) {
  return (
    [player.firstName, player.lastName].filter(Boolean).join(" ") ||
    "Без імені"
  );
}

function getInitials(player: ReferralAdminPlayer) {
  const initials = [player.firstName, player.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join("");

  return initials || "P";
}

export function ReferralPlayersTable({
  players,
  selectedPlayerId,
  onSelectPlayer,
}: ReferralPlayersTableProps) {
  if (players.length === 0) {
    return (
      <div className={styles.referralEmptyState}>
        <span>↗</span>

        <strong>Гравців не знайдено</strong>

        <p>
          Змініть пошуковий запит або вибраний фільтр.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.referralTableScroll}>
      <div className={styles.referralTable}>
        <div className={styles.referralTableHeader}>
          <span>Player</span>
          <span>Telegram ID</span>
          <span>Invited by</span>
          <span>Referrals</span>
          <span>Rewards earned</span>
          <span>Registered</span>
          <span />
        </div>

        <div className={styles.referralTableBody}>
          {players.map((player) => {
            const fullName = getFullName(player);
            const isSelected = selectedPlayerId === player.id;

            return (
              <button
                key={player.id}
                type="button"
                className={`${styles.referralTableRow} ${
                  isSelected ? styles.referralTableRowSelected : ""
                }`}
                onClick={() => onSelectPlayer(player)}
              >
                <span className={styles.referralPlayerCell}>
                  {player.photoUrl ? (
                    <img
                      src={player.photoUrl}
                      alt={fullName}
                      width={42}
                      height={42}
                      className={styles.referralAvatar}
                    />
                  ) : (
                    <span className={styles.referralAvatarFallback}>
                      {getInitials(player)}
                    </span>
                  )}

                  <span className={styles.referralPlayerInfo}>
                    <strong>{fullName}</strong>

                    <small>
                      {player.username
                        ? `@${player.username}`
                        : "Без username"}
                    </small>
                  </span>
                </span>

                <span className={styles.referralTelegramId}>
                  {player.telegramId}
                </span>

                <span className={styles.referralNotConnected}>
                  Not connected
                </span>

                <span className={styles.referralMetric}>—</span>

                <span className={styles.referralMetric}>—</span>

                <span className={styles.referralDate}>
                  {formatDate(player.createdAt)}
                </span>

                <span className={styles.referralViewButton}>
                  View referrals
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