"use client";

import { useMemo, useState } from "react";

import { LeaderboardTable } from "./LeaderboardTable";

import type {
  LeaderboardPlayer,
  LeaderboardSort,
} from "./leaderboardTypes";

import styles from "../../AdminPanel.module.css";

type LeaderboardSectionProps = {
  players: LeaderboardPlayer[];
};

function getFullName(player: LeaderboardPlayer) {
  return [player.firstName, player.lastName]
    .filter(Boolean)
    .join(" ");
}

export function LeaderboardSection({
  players,
}: LeaderboardSectionProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] =
    useState<LeaderboardSort>("balance");
  const [limit, setLimit] = useState("100");

  const visiblePlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = players.filter((player) => {
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

    if (sort === "last-active") {
      filtered.sort(
        (first, second) =>
          new Date(second.lastLoginAt).getTime() -
          new Date(first.lastLoginAt).getTime(),
      );
    }

    return filtered.slice(0, Number(limit));
  }, [players, search, sort, limit]);

  return (
    <section className={styles.leaderboardSection}>
      <div className={styles.leaderboardStatsGrid}>
        <article>
          <span>Total ranked players</span>
          <strong>{players.length}</strong>
          <small>Усі зареєстровані гравці</small>
        </article>

        <article>
          <span>Top balance</span>
          <strong>—</strong>
          <small>Після підключення game state</small>
        </article>

        <article>
          <span>Top VIP</span>
          <strong>—</strong>
          <small>Після підключення VIP</small>
        </article>

        <article>
          <span>Total coins</span>
          <strong>—</strong>
          <small>Баланс усіх гравців</small>
        </article>
      </div>

      <article className={styles.leaderboardCard}>
        <header className={styles.leaderboardCardHeader}>
          <div>
            <h2>All Time Leaderboard</h2>
            <p>Загальний рейтинг усіх гравців Slot Club</p>
          </div>

          <div className={styles.leaderboardLiveBadge}>
            <i />
            All Time
          </div>
        </header>

        <div className={styles.leaderboardToolbar}>
          <label className={styles.leaderboardSearch}>
            <span>⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as LeaderboardSort)
            }
            className={styles.leaderboardSelect}
          >
            <option value="balance">Highest balance</option>
            <option value="total-earned">Total earned</option>
            <option value="total-taps">Total taps</option>
            <option value="vip">Highest VIP</option>
            <option value="last-active">Last activity</option>
          </select>

          <select
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            className={styles.leaderboardSelect}
          >
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>

          <div className={styles.leaderboardResultCount}>
            <strong>{visiblePlayers.length}</strong>
            <span>players</span>
          </div>
        </div>

        <div className={styles.leaderboardNotice}>
          <span>!</span>

          <p>
            Зараз список використовує реальних гравців із бази.
            Після перенесення балансу, VIP, тапів і заробітку в
            PostgreSQL рейтинг автоматично сортуватиметься за
            реальними показниками.
          </p>
        </div>

        <LeaderboardTable players={visiblePlayers} />
      </article>
    </section>
  );
}