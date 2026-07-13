"use client";

import { useMemo, useState } from "react";

import { PlayerDetailsPanel } from "./PlayerDetailsPanel";
import { PlayersTable } from "./PlayersTable";

import type {
  AdminPlayer,
  PlayerSort,
  PlayerStatusFilter,
} from "./playerTypes";

import styles from "../../AdminPanel.module.css";

type PlayersSectionProps = {
  players: AdminPlayer[];
};

function getFullName(player: AdminPlayer) {
  return [player.firstName, player.lastName]
    .filter(Boolean)
    .join(" ");
}

export function PlayersSection({
  players,
}: PlayersSectionProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<PlayerStatusFilter>("all");
  const [sort, setSort] = useState<PlayerSort>("newest");
  const [selectedPlayer, setSelectedPlayer] =
    useState<AdminPlayer | null>(null);

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = players.filter((player) => {
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

    return [...result].sort((first, second) => {
      if (sort === "oldest") {
        return (
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
        );
      }

      if (sort === "last-active") {
        return (
          new Date(second.lastLoginAt).getTime() -
          new Date(first.lastLoginAt).getTime()
        );
      }

      if (sort === "name") {
        return getFullName(first).localeCompare(
          getFullName(second),
          "uk",
        );
      }

      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
    });
  }, [players, search, sort]);

  return (
    <>
      <section className={styles.playersManagement}>
        <div className={styles.playersSummaryGrid}>
          <article>
            <span>Total players</span>
            <strong>{players.length}</strong>
            <small>Усі зареєстровані акаунти</small>
          </article>

          <article>
            <span>Active accounts</span>
            <strong>{players.length}</strong>
            <small>Блокування ще не підключено</small>
          </article>

          <article>
            <span>Blocked</span>
            <strong>0</strong>
            <small>Модель статусів буде підключена</small>
          </article>

          <article>
            <span>VIP players</span>
            <strong>—</strong>
            <small>VIP-механіка ще не в базі</small>
          </article>
        </div>

        <article className={styles.playersCard}>
          <div className={styles.playersToolbar}>
            <div className={styles.playersToolbarTitle}>
              <h2>Player Accounts</h2>
              <p>
                Пошук, перегляд і керування акаунтами гравців
              </p>
            </div>

            <button
              type="button"
              className={styles.addPlayerButton}
              disabled
              title="Підключимо після створення API"
            >
              <span>+</span>
              Add player
            </button>
          </div>

          <div className={styles.playersFilters}>
            <label className={styles.playersSearch}>
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
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as PlayerStatusFilter,
                )
              }
              disabled={statusFilter !== "all"}
              className={styles.playersSelect}
              title="Фільтри статусу запрацюють після додавання поля status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="vip">VIP players</option>
            </select>

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as PlayerSort)
              }
              className={styles.playersSelect}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="last-active">
                Last activity
              </option>
              <option value="name">Player name</option>
            </select>

            <div className={styles.playersResultCount}>
              <strong>{filteredPlayers.length}</strong>
              <span>results</span>
            </div>
          </div>

          <PlayersTable
            players={filteredPlayers}
            selectedPlayerId={selectedPlayer?.id || null}
            onSelectPlayer={setSelectedPlayer}
          />
        </article>
      </section>

      {selectedPlayer && (
        <PlayerDetailsPanel
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  );
}