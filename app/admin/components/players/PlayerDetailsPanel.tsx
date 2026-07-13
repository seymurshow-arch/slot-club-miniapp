"use client";

import { useState } from "react";

import type {
  AdminPlayer,
  PlayerDetailsTab,
} from "./playerTypes";

import styles from "../../AdminPanel.module.css";

type PlayerDetailsPanelProps = {
  player: AdminPlayer;
  onClose: () => void;
};

const tabs: Array<{
  id: PlayerDetailsTab;
  label: string;
  icon: string;
}> = [
  { id: "overview", label: "Overview", icon: "◎" },
  { id: "economy", label: "Economy", icon: "◉" },
  { id: "tasks", label: "Tasks", icon: "✓" },
  { id: "purchases", label: "Purchases", icon: "◇" },
  { id: "daily", label: "Daily Rewards", icon: "◆" },
  { id: "referrals", label: "Referrals", icon: "↗" },
  { id: "rewards", label: "Rewards", icon: "✦" },
  { id: "notes", label: "Admin Notes", icon: "≡" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "long",
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

function NotConnected({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.playerNotConnected}>
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{description}</p>
      <small>Not connected</small>
    </div>
  );
}

export function PlayerDetailsPanel({
  player,
  onClose,
}: PlayerDetailsPanelProps) {
  const [activeTab, setActiveTab] =
    useState<PlayerDetailsTab>("overview");

  const fullName = getFullName(player);

  return (
    <div className={styles.playerPanelOverlay} onMouseDown={onClose}>
      <aside
        className={styles.playerDetailsPanel}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.playerPanelHeader}>
          <div className={styles.playerPanelIdentity}>
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={fullName}
                width={58}
                height={58}
                className={styles.playerPanelAvatar}
              />
            ) : (
              <span className={styles.playerPanelAvatarFallback}>
                {getInitials(player)}
              </span>
            )}

            <div>
              <div className={styles.playerPanelNameRow}>
                <h2>{fullName}</h2>

                <span className={styles.playerStatusBadge}>
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
            className={styles.playerPanelClose}
            onClick={onClose}
            aria-label="Закрити профіль"
          >
            ×
          </button>
        </header>

        <nav className={styles.playerDetailsTabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? styles.playerDetailsTabActive
                  : styles.playerDetailsTab
              }
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.playerPanelContent}>
          {activeTab === "overview" && (
            <div className={styles.playerTabContent}>
              <div className={styles.playerSectionTitle}>
                <div>
                  <h3>Account Overview</h3>
                  <p>Основна інформація та керування акаунтом</p>
                </div>

                <button
                  type="button"
                  className={styles.playerEditButton}
                  disabled
                >
                  Edit profile
                </button>
              </div>

              <div className={styles.playerInfoGrid}>
                <article className={styles.playerInfoCard}>
                  <span>Telegram ID</span>
                  <strong>{player.telegramId}</strong>
                </article>

                <article className={styles.playerInfoCard}>
                  <span>Username</span>
                  <strong>
                    {player.username
                      ? `@${player.username}`
                      : "Не вказано"}
                  </strong>
                </article>

                <article className={styles.playerInfoCard}>
                  <span>First name</span>
                  <strong>{player.firstName || "Не вказано"}</strong>
                </article>

                <article className={styles.playerInfoCard}>
                  <span>Last name</span>
                  <strong>{player.lastName || "Не вказано"}</strong>
                </article>

                <article className={styles.playerInfoCard}>
                  <span>Registered</span>
                  <strong>{formatDate(player.createdAt)}</strong>
                </article>

                <article className={styles.playerInfoCard}>
                  <span>Last login</span>
                  <strong>{formatDate(player.lastLoginAt)}</strong>
                </article>
              </div>

              <section className={styles.playerDangerSection}>
                <div>
                  <h3>Account access</h3>
                  <p>
                    Керування доступом гравця до Telegram Mini App
                  </p>
                </div>

                <div className={styles.playerDangerActions}>
                  <button
                    type="button"
                    className={styles.playerBlockButton}
                    disabled
                  >
                    Block player
                  </button>

                  <button
                    type="button"
                    className={styles.playerDeleteButton}
                    disabled
                  >
                    Delete account
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "economy" && (
            <div className={styles.playerTabContent}>
              <div className={styles.playerSectionTitle}>
                <div>
                  <h3>Player Economy</h3>
                  <p>
                    Баланс, енергія, Tap Power та VIP-рівень
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.playerPrimaryButton}
                  disabled
                >
                  Save changes
                </button>
              </div>

              <div className={styles.playerEconomyGrid}>
                <label className={styles.playerField}>
                  <span>Balance</span>
                  <input value="—" readOnly />
                </label>

                <label className={styles.playerField}>
                  <span>Current energy</span>
                  <input value="—" readOnly />
                </label>

                <label className={styles.playerField}>
                  <span>Maximum energy</span>
                  <input value="—" readOnly />
                </label>

                <label className={styles.playerField}>
                  <span>Tap Power</span>
                  <input value="—" readOnly />
                </label>

                <label className={styles.playerField}>
                  <span>VIP level</span>
                  <input value="—" readOnly />
                </label>

                <label className={styles.playerField}>
                  <span>Total taps</span>
                  <input value="—" readOnly />
                </label>
              </div>

              <div className={styles.playerQuickActions}>
                <button type="button" disabled>
                  + Add coins
                </button>

                <button type="button" disabled>
                  − Remove coins
                </button>

                <button type="button" disabled>
                  ⚡ Restore energy
                </button>

                <button type="button" disabled>
                  ✦ Give VIP
                </button>
              </div>

              <div className={styles.playerConnectionNotice}>
                <span>!</span>
                <p>
                  Економіка гравця ще зберігається локально у
                  Zustand. Після перенесення game state у PostgreSQL
                  ці поля почнуть працювати без зміни дизайну.
                </p>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <NotConnected
              icon="✓"
              title="Player Tasks"
              description="Тут буде список призначених, активних та виконаних завдань гравця."
            />
          )}

          {activeTab === "purchases" && (
            <NotConnected
              icon="◇"
              title="Purchase History"
              description="Тут буде історія покупок, придбаних поліпшень і косметичних предметів."
            />
          )}

          {activeTab === "daily" && (
            <NotConnected
              icon="◆"
              title="Daily Rewards"
              description="Тут буде поточна серія, отримані нагороди та історія щоденних входів."
            />
          )}

          {activeTab === "referrals" && (
            <NotConnected
              icon="↗"
              title="Player Referrals"
              description="Тут буде inviter, список запрошених гравців і отримані реферальні нагороди."
            />
          )}

          {activeTab === "rewards" && (
            <div className={styles.playerTabContent}>
              <div className={styles.playerSectionTitle}>
                <div>
                  <h3>Manual Rewards</h3>
                  <p>
                    Історія нагород, виданих адміністратором
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.playerPrimaryButton}
                  disabled
                >
                  + Give reward
                </button>
              </div>

              <NotConnected
                icon="✦"
                title="No reward history"
                description="Після створення системи ручних нагород тут з’явиться повна історія операцій."
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className={styles.playerTabContent}>
              <div className={styles.playerSectionTitle}>
                <div>
                  <h3>Admin Notes</h3>
                  <p>
                    Внутрішні примітки, які бачать тільки
                    адміністратори
                  </p>
                </div>
              </div>

              <div className={styles.playerNoteComposer}>
                <textarea
                  placeholder="Напишіть примітку про гравця..."
                  disabled
                />

                <button
                  type="button"
                  className={styles.playerPrimaryButton}
                  disabled
                >
                  Add note
                </button>
              </div>

              <NotConnected
                icon="≡"
                title="No admin notes"
                description="Після підключення моделі приміток тут зберігатиметься їхня історія."
              />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}