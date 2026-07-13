"use client";

import { useState } from "react";

import styles from "../../AdminPanel.module.css";

export function PlayerClaimsView() {
  const [search, setSearch] = useState("");

  return (
    <section className={styles.dailyClaimsSection}>
      <div className={styles.dailyClaimsStats}>
        <article>
          <span>Claims today</span>
          <strong>—</strong>
          <small>Після підключення бази</small>
        </article>

        <article>
          <span>Active streaks</span>
          <strong>—</strong>
          <small>Гравці з активною серією</small>
        </article>

        <article>
          <span>Rewards issued</span>
          <strong>—</strong>
          <small>Загальна сума нагород</small>
        </article>

        <article>
          <span>Missed today</span>
          <strong>—</strong>
          <small>Не отримали нагороду</small>
        </article>
      </div>

      <article className={styles.dailyClaimsCard}>
        <header className={styles.dailyClaimsHeader}>
          <div>
            <h2>Player Claims</h2>

            <p>
              Історія отримання щоденних нагород гравцями
            </p>
          </div>

          <div className={styles.dailyClaimsActions}>
            <label>
              <span>⌕</span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
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

            <select defaultValue="all" disabled>
              <option value="all">All days</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
        </header>

        <div className={styles.dailyClaimsTableHeader}>
          <span>Player</span>
          <span>VIP</span>
          <span>Cycle day</span>
          <span>Base reward</span>
          <span>Final reward</span>
          <span>Claimed at</span>
          <span>Actions</span>
        </div>

        <div className={styles.dailyClaimsEmpty}>
          <span>◆</span>

          <strong>No claims yet</strong>

          <p>
            Після підключення Daily Rewards до бази тут
            з’являться всі отримання, VIP-множники та
            фактичні нагороди.
          </p>
        </div>
      </article>

      <div className={styles.dailyClaimAdminTools}>
        <div>
          <h3>Player streak management</h3>

          <p>
            Ручне керування Daily Rewards конкретного
            гравця.
          </p>
        </div>

        <div>
          <button type="button" disabled>
            Set cycle day
          </button>

          <button type="button" disabled>
            Reset streak
          </button>

          <button type="button" disabled>
            Give reward
          </button>
        </div>
      </div>
    </section>
  );
}