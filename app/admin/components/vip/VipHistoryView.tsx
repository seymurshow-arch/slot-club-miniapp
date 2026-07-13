"use client";

import { useState } from "react";

import styles from "../../AdminPanel.module.css";

export function VipHistoryView() {
  const [search, setSearch] = useState("");

  return (
    <section className={styles.vipHistorySection}>
      <div className={styles.vipHistoryStats}>
        <article>
          <span>VIP players</span>
          <strong>—</strong>
          <small>Після підключення бази</small>
        </article>

        <article>
          <span>Level ups today</span>
          <strong>—</strong>
          <small>Підвищення за сьогодні</small>
        </article>

        <article>
          <span>VIP points issued</span>
          <strong>—</strong>
          <small>Загальна кількість балів</small>
        </article>

        <article>
          <span>Manual changes</span>
          <strong>—</strong>
          <small>Зміни адміністратора</small>
        </article>
      </div>

      <article className={styles.vipHistoryCard}>
        <header className={styles.vipHistoryHeader}>
          <div>
            <h2>Player VIP History</h2>

            <p>
              Історія рівнів, VIP points і
              ручних змін
            </p>
          </div>

          <div className={styles.vipHistoryActions}>
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
              <option value="all">
                All events
              </option>

              <option value="level-up">
                Level up
              </option>

              <option value="level-down">
                Level down
              </option>

              <option value="points">
                VIP points
              </option>

              <option value="manual">
                Manual changes
              </option>
            </select>
          </div>
        </header>

        <div
          className={styles.vipHistoryTableHeader}
        >
          <span>Player</span>
          <span>Previous VIP</span>
          <span>New VIP</span>
          <span>VIP points</span>
          <span>Reason</span>
          <span>Changed by</span>
          <span>Date</span>
        </div>

        <div className={styles.vipHistoryEmpty}>
          <span>♛</span>

          <strong>No VIP history yet</strong>

          <p>
            Після підключення VIP-механіки
            тут з’являться всі зміни рівнів,
            VIP points і ручні операції.
          </p>
        </div>
      </article>

      <div className={styles.vipHistoryTools}>
        <div>
          <h3>Manual VIP management</h3>

          <p>
            Ручна зміна VIP-рівня або видача
            VIP points конкретному гравцю.
          </p>
        </div>

        <div>
          <button type="button" disabled>
            Give VIP points
          </button>

          <button type="button" disabled>
            Change VIP level
          </button>
        </div>
      </div>
    </section>
  );
}