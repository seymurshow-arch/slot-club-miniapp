"use client";

import { useState } from "react";

import styles from "../../AdminPanel.module.css";

export function PopupHistoryView() {
  const [search, setSearch] = useState("");

  return (
    <section className={styles.popupHistoryView}>
      <div className={styles.popupHistoryStats}>
        <article>
          <span>Displays today</span>
          <strong>—</strong>
          <small>Показано сьогодні</small>
        </article>

        <article>
          <span>Button clicks</span>
          <strong>—</strong>
          <small>Натискання основної кнопки</small>
        </article>

        <article>
          <span>Closed</span>
          <strong>—</strong>
          <small>Закрито без виконання дії</small>
        </article>

        <article>
          <span>Conversion</span>
          <strong>—</strong>
          <small>Від показу до дії</small>
        </article>
      </div>

      <article className={styles.popupHistoryCard}>
        <header className={styles.popupHistoryHeader}>
          <div>
            <h2>Display History</h2>

            <p>
              Історія показів попапів і дій гравців
            </p>
          </div>

          <div className={styles.popupHistoryActions}>
            <label>
              <span>⌕</span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search popup or player..."
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
              <option value="all">All events</option>
              <option value="shown">Shown</option>
              <option value="closed">Closed</option>
              <option value="clicked">Button clicked</option>
              <option value="completed">Action completed</option>
            </select>
          </div>
        </header>

        <div className={styles.popupHistoryTableHeader}>
          <span>Player</span>
          <span>Popup</span>
          <span>Trigger</span>
          <span>Related Task</span>
          <span>Result</span>
          <span>Displayed at</span>
          <span>Action</span>
        </div>

        <div className={styles.popupHistoryEmpty}>
          <span>▣</span>

          <strong>No display history yet</strong>

          <p>
            Після підключення попапів до гри тут
            відображатимуться всі покази, закриття та
            натискання кнопок.
          </p>
        </div>
      </article>
    </section>
  );
}