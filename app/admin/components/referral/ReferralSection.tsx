"use client";

import { useMemo, useState } from "react";

import { ReferralDetailsPanel } from "./ReferralDetailsPanel";
import { ReferralPlayersTable } from "./ReferralPlayersTable";

import type {
  ReferralAdminPlayer,
  ReferralFilter,
} from "./referralTypes";

import styles from "../../AdminPanel.module.css";

type ReferralSectionProps = {
  players: ReferralAdminPlayer[];
};

function getFullName(player: ReferralAdminPlayer) {
  return [player.firstName, player.lastName]
    .filter(Boolean)
    .join(" ");
}

export function ReferralSection({
  players,
}: ReferralSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ReferralFilter>("all");

  const [selectedPlayer, setSelectedPlayer] =
    useState<ReferralAdminPlayer | null>(null);

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return players.filter((player) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        player.telegramId,
        player.username,
        player.firstName,
        player.lastName,
        getFullName(player),
      ]
        .filter(Boolean)
        .some((value) =>
          value?.toLowerCase().includes(normalizedSearch),
        );
    });
  }, [players, search]);

  return (
    <>
      <section className={styles.referralSection}>
        <div className={styles.referralStatsGrid}>
          <article>
            <span>Total players</span>
            <strong>{players.length}</strong>
            <small>Усі зареєстровані гравці</small>
          </article>

          <article>
            <span>Total referrals</span>
            <strong>—</strong>
            <small>Після підключення referral-моделі</small>
          </article>

          <article>
            <span>Active referrers</span>
            <strong>—</strong>
            <small>Гравці з рефералами</small>
          </article>

          <article>
            <span>Rewards issued</span>
            <strong>—</strong>
            <small>Видані реферальні нагороди</small>
          </article>
        </div>

        <article className={styles.referralCard}>
          <header className={styles.referralCardHeader}>
            <div>
              <h2>Referral Players</h2>

              <p>
                Перегляд усіх гравців та їхніх реферальних зв’язків
              </p>
            </div>

            <span className={styles.referralNotConnectedBadge}>
              Referral logic not connected
            </span>
          </header>

          <div className={styles.referralToolbar}>
            <label className={styles.referralSearch}>
              <span>⌕</span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, username or Telegram ID..."
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
                setFilter(event.target.value as ReferralFilter)
              }
              disabled
              className={styles.referralFilter}
            >
              <option value="all">All players</option>
              <option value="with-referrals">
                With referrals
              </option>
              <option value="without-referrals">
                Without referrals
              </option>
              <option value="invited">
                Invited players
              </option>
            </select>

            <div className={styles.referralResultCount}>
              <strong>{filteredPlayers.length}</strong>
              <span>players</span>
            </div>
          </div>

          <ReferralPlayersTable
            players={filteredPlayers}
            selectedPlayerId={selectedPlayer?.id || null}
            onSelectPlayer={setSelectedPlayer}
          />
        </article>
      </section>

      {selectedPlayer && (
        <ReferralDetailsPanel
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  );
}