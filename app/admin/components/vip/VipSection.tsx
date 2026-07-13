"use client";

import { useState } from "react";

import { VipBenefitsView } from "./VipBenefitsView";
import { VipHistoryView } from "./VipHistoryView";
import { VipLevelsView } from "./VipLevelsView";

import type { VipView } from "./vipTypes";

import styles from "../../AdminPanel.module.css";

export function VipSection() {
  const [activeView, setActiveView] =
    useState<VipView>("levels");

  return (
    <section className={styles.vipSection}>
      <header className={styles.vipSectionHeader}>
        <div>
          <h2>VIP</h2>

          <p>
            Рівні, бонуси та історія VIP-системи
          </p>
        </div>

        <div className={styles.vipViewTabs}>
          <button
            type="button"
            className={
              activeView === "levels"
                ? styles.vipViewTabActive
                : styles.vipViewTab
            }
            onClick={() =>
              setActiveView("levels")
            }
          >
            <span>♛</span>
            VIP Levels
          </button>

          <button
            type="button"
            className={
              activeView === "benefits"
                ? styles.vipViewTabActive
                : styles.vipViewTab
            }
            onClick={() =>
              setActiveView("benefits")
            }
          >
            <span>✦</span>
            Benefits
          </button>

          <button
            type="button"
            className={
              activeView === "history"
                ? styles.vipViewTabActive
                : styles.vipViewTab
            }
            onClick={() =>
              setActiveView("history")
            }
          >
            <span>≡</span>
            Player History
          </button>
        </div>
      </header>

      {activeView === "levels" && (
        <VipLevelsView />
      )}

      {activeView === "benefits" && (
        <VipBenefitsView />
      )}

      {activeView === "history" && (
        <VipHistoryView />
      )}
    </section>
  );
}