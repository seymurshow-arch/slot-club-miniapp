"use client";

import { useMemo, useState } from "react";

import type {
  StatisticsPeriod,
  StatisticsPlayer,
} from "./statisticsTypes";

import styles from "../../AdminPanel.module.css";

type PlayerActivityStatsProps = {
  players: StatisticsPlayer[];
  activeToday: number;
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

export function PlayerActivityStats({
  players,
  activeToday,
}: PlayerActivityStatsProps) {
  const [period, setPeriod] =
    useState<StatisticsPeriod>("today");

  const [search, setSearch] = useState("");

  const visiblePlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...players]
      .filter((player) => {
        if (!query) {
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
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort(
        (first, second) =>
          new Date(second.lastLoginAt).getTime() -
          new Date(first.lastLoginAt).getTime(),
      );
  }, [players, search]);

  return (
    <section className={styles.playerActivityStatistics}>
      <div className={styles.statisticsMetricsGrid}>
        <article>
          <span>DAU</span>
          <strong>{activeToday}</strong>
          <small>Активні гравці сьогодні</small>
        </article>

        <article>
          <span>WAU</span>
          <strong>—</strong>
          <small>Активні за останні 7 днів</small>
        </article>

        <article>
          <span>MAU</span>
          <strong>—</strong>
          <small>Активні за останні 30 днів</small>
        </article>

        <article>
          <span>Average session</span>
          <strong>—</strong>
          <small>Після підключення сесій</small>
        </article>
      </div>

      <article className={styles.statisticsActivityDetails}>
        <header>
          <div>
            <h2>Player Activity</h2>

            <p>
              Входи, сесії та майбутня ігрова активність гравців
            </p>
          </div>

          <div className={styles.statisticsPeriodTabs}>
            {[
              ["today", "Today"],
              ["7-days", "7 days"],
              ["30-days", "30 days"],
              ["all-time", "All time"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  period === value
                    ? styles.statisticsPeriodActive
                    : styles.statisticsPeriodButton
                }
                onClick={() =>
                  setPeriod(value as StatisticsPeriod)
                }
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className={styles.statisticsActivityToolbar}>
          <label>
            <span>⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search player..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </label>

          <select disabled defaultValue="all">
            <option value="all">All players</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new">New players</option>
          </select>

          <div>
            <strong>{visiblePlayers.length}</strong>
            <span>players</span>
          </div>
        </div>

        <div className={styles.statisticsPlayerTableHeader}>
          <span>Player</span>
          <span>Last login</span>
          <span>Sessions</span>
          <span>Total taps</span>
          <span>Coins earned</span>
          <span>Energy spent</span>
          <span>Status</span>
        </div>

        <div className={styles.statisticsPlayerRows}>
          {visiblePlayers.map((player) => (
            <div key={player.id}>
              <span>
                <strong>{getFullName(player)}</strong>

                <small>
                  {player.username
                    ? `@${player.username}`
                    : player.telegramId}
                </small>
              </span>

              <span>{formatDate(player.lastLoginAt)}</span>

              <span>—</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>

              <span className={styles.statisticsPlayerStatus}>
                <i />
                Registered
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}