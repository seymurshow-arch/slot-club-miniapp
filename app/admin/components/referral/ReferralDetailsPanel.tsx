"use client";

import { useMemo, useState } from "react";

import type {
  ReferralAdminPlayer,
  ReferralDetailsFilter,
} from "./referralTypes";

import styles from "../../AdminPanel.module.css";

type ReferralDetailsPanelProps = {
  player: ReferralAdminPlayer;
  onClose: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "long",
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

export function ReferralDetailsPanel({
  player,
  onClose,
}: ReferralDetailsPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ReferralDetailsFilter>("all");

  const referrals = useMemo(() => {
    return [];
  }, []);

  const fullName = getFullName(player);

  return (
    <div
      className={styles.referralPanelOverlay}
      onMouseDown={onClose}
    >
      <aside
        className={styles.referralDetailsPanel}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.referralPanelHeader}>
          <div className={styles.referralPanelIdentity}>
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={fullName}
                width={58}
                height={58}
                className={styles.referralPanelAvatar}
              />
            ) : (
              <span className={styles.referralPanelAvatarFallback}>
                {getInitials(player)}
              </span>
            )}

            <div>
              <div className={styles.referralPanelNameRow}>
                <h2>{fullName}</h2>

                <span className={styles.referralStatusBadge}>
                  <i />
                  Active
                </span>
              </div>

              <p>
                {player.username
                  ? `@${player.username}`
                  : "Без username"}
              </p>

              <small>Telegram ID: {player.telegramId}</small>
            </div>
          </div>

          <button
            type="button"
            className={styles.referralPanelClose}
            onClick={onClose}
            aria-label="Закрити панель"
          >
            ×
          </button>
        </header>

        <div className={styles.referralPanelContent}>
          <section className={styles.referralSummaryGrid}>
            <article>
              <span>Total referrals</span>
              <strong>—</strong>
              <small>Усі запрошені гравці</small>
            </article>

            <article>
              <span>Active referrals</span>
              <strong>—</strong>
              <small>Активні запрошені гравці</small>
            </article>

            <article>
              <span>Rewards earned</span>
              <strong>—</strong>
              <small>Зароблено з рефералів</small>
            </article>

            <article>
              <span>Invited by</span>
              <strong>—</strong>
              <small>Хто запросив гравця</small>
            </article>
          </section>

          <section className={styles.referralProfileCard}>
            <header>
              <div>
                <h3>Referral Information</h3>

                <p>
                  Основна інформація про реферальний акаунт
                </p>
              </div>
            </header>

            <div className={styles.referralProfileGrid}>
              <article>
                <span>Referral code</span>
                <strong>Not connected</strong>
              </article>

              <article>
                <span>Referral link</span>
                <strong>Not connected</strong>
              </article>

              <article>
                <span>Registered</span>
                <strong>{formatDate(player.createdAt)}</strong>
              </article>

              <article>
                <span>Last login</span>
                <strong>{formatDate(player.lastLoginAt)}</strong>
              </article>
            </div>
          </section>

          <section className={styles.referralListCard}>
            <header className={styles.referralListHeader}>
              <div>
                <h3>Player Referrals</h3>

                <p>
                  Список усіх гравців, запрошених цим користувачем
                </p>
              </div>

              <span className={styles.referralNotConnectedBadge}>
                Not connected
              </span>
            </header>

            <div className={styles.referralPanelToolbar}>
              <label>
                <span>⌕</span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search referral..."
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Очистити пошук"
                  >
                    ×
                  </button>
                )}
              </label>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as ReferralDetailsFilter,
                  )
                }
                disabled
              >
                <option value="all">All referrals</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="rewarded">Rewarded</option>
              </select>
            </div>

            <div className={styles.referralListTableHeader}>
              <span>Player</span>
              <span>Telegram ID</span>
              <span>Status</span>
              <span>Reward</span>
              <span>Registered</span>
              <span />
            </div>

            {referrals.length === 0 && (
              <div className={styles.referralPanelEmpty}>
                <span>↗</span>

                <strong>No referrals connected yet</strong>

                <p>
                  Після створення referral-моделі тут з’являться
                  всі запрошені гравці, їхні статуси та отримані
                  винагороди.
                </p>
              </div>
            )}
          </section>

          <div className={styles.referralAdminTools}>
            <div>
              <h3>Referral management</h3>

              <p>
                Ручне керування зв’язками та реферальними
                нагородами.
              </p>
            </div>

            <div>
              <button type="button" disabled>
                Change inviter
              </button>

              <button type="button" disabled>
                Give referral reward
              </button>

              <button type="button" disabled>
                Remove referral link
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}