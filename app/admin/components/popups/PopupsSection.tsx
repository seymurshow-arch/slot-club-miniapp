"use client";

import { useState } from "react";

import { CreatePopupView } from "./CreatePopupView";
import { PopupHistoryView } from "./PopupHistoryView";
import { PopupsCatalogView } from "./PopupsCatalogView";

import type { PopupsView } from "./popupTypes";

import styles from "../../AdminPanel.module.css";

export function PopupsSection() {
  const [activeView, setActiveView] =
    useState<PopupsView>("catalog");

  return (
    <section className={styles.popupsSection}>
      <header className={styles.popupsSectionHeader}>
        <div>
          <h2>Popups</h2>

          <p>
            Onboarding, новини, сезонні повідомлення та
            нагороди за виконання дій
          </p>
        </div>

        <div className={styles.popupsViewTabs}>
          <button
            type="button"
            className={
              activeView === "catalog"
                ? styles.popupsViewTabActive
                : styles.popupsViewTab
            }
            onClick={() => setActiveView("catalog")}
          >
            <span>▣</span>
            All Popups
          </button>

          <button
            type="button"
            className={
              activeView === "create"
                ? styles.popupsViewTabActive
                : styles.popupsViewTab
            }
            onClick={() => setActiveView("create")}
          >
            <span>+</span>
            Create Popup
          </button>

          <button
            type="button"
            className={
              activeView === "history"
                ? styles.popupsViewTabActive
                : styles.popupsViewTab
            }
            onClick={() => setActiveView("history")}
          >
            <span>≡</span>
            Display History
          </button>
        </div>
      </header>

      {activeView === "catalog" && (
        <PopupsCatalogView
          onCreatePopup={() =>
            setActiveView("create")
          }
        />
      )}

      {activeView === "create" && (
        <CreatePopupView
          onBackToCatalog={() =>
            setActiveView("catalog")
          }
        />
      )}

      {activeView === "history" && (
        <PopupHistoryView />
      )}
    </section>
  );
}