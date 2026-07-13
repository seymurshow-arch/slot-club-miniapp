"use client";

import { useState } from "react";

import type { PopupType } from "./popupTypes";

import styles from "../../AdminPanel.module.css";

type PopupsCatalogViewProps = {
  onCreatePopup: () => void;
};

const popupTypes: Array<{
  value: "all" | PopupType;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "onboarding", label: "Onboarding" },
  { value: "news", label: "News" },
  { value: "task-reward", label: "Task Reward" },
  { value: "season", label: "Season" },
  { value: "promotion", label: "Promotion" },
  { value: "warning", label: "Warning" },
  { value: "custom", label: "Custom" },
];

export function PopupsCatalogView({
  onCreatePopup,
}: PopupsCatalogViewProps) {
  const [search, setSearch] = useState("");
  const [type, setType] =
    useState<"all" | PopupType>("all");

  return (
    <section className={styles.popupsCatalogView}>
      <div className={styles.popupsStatsGrid}>
        <article>
          <span>All popups</span>
          <strong>0</strong>
          <small>Усі створені попапи</small>
        </article>

        <article>
          <span>Active</span>
          <strong>0</strong>
          <small>Зараз доступні гравцям</small>
        </article>

        <article>
          <span>Scheduled</span>
          <strong>0</strong>
          <small>Заплановані попапи</small>
        </article>

        <article>
          <span>Total displays</span>
          <strong>—</strong>
          <small>Після підключення механіки</small>
        </article>
      </div>

      <article className={styles.popupsCatalogCard}>
        <header className={styles.popupsCatalogHeader}>
          <div>
            <h2>All Popups</h2>

            <p>
              Керування новинами, нагородами, onboarding і
              системними повідомленнями
            </p>
          </div>

          <button
            type="button"
            className={styles.popupCreateButton}
            onClick={onCreatePopup}
          >
            <span>+</span>
            Create popup
          </button>
        </header>

        <div className={styles.popupsCatalogToolbar}>
          <label className={styles.popupsSearch}>
            <span>⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search popups..."
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

          <div className={styles.popupTypeFilters}>
            {popupTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                className={
                  type === item.value
                    ? styles.popupTypeFilterActive
                    : styles.popupTypeFilter
                }
                onClick={() => setType(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select defaultValue="all" disabled>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div className={styles.popupsEmptyState}>
          <span>▣</span>

          <strong>No popups created yet</strong>

          <p>
            Тут з’являться onboarding, новини, сезонні
            повідомлення, нагороди за Tasks та інші попапи.
          </p>

          <button type="button" onClick={onCreatePopup}>
            <span>+</span>
            Create first popup
          </button>
        </div>
      </article>
    </section>
  );
}