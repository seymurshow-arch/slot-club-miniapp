"use client";

import { useState } from "react";

import { PlayerClaimsView } from "./PlayerClaimsView";
import { RewardCycleView } from "./RewardCycleView";
import { VipScalingView } from "./VipScalingView";

import type { DailyRewardsView } from "./dailyRewardTypes";

import styles from "../../AdminPanel.module.css";

export function DailyRewardsSection() {
  const [activeView, setActiveView] =
    useState<DailyRewardsView>("cycle");

  return (
    <section className={styles.dailyRewardsSection}>
      <header className={styles.dailyRewardsSectionHeader}>
        <div>
          <h2>Daily Rewards</h2>

          <p>
            Цикл нагород, VIP-множники та історія
            отримання
          </p>
        </div>

        <div className={styles.dailyRewardsTabs}>
          <button
            type="button"
            className={
              activeView === "cycle"
                ? styles.dailyRewardsTabActive
                : styles.dailyRewardsTab
            }
            onClick={() => setActiveView("cycle")}
          >
            <span>◆</span>
            Reward Cycle
          </button>

          <button
            type="button"
            className={
              activeView === "vip-scaling"
                ? styles.dailyRewardsTabActive
                : styles.dailyRewardsTab
            }
            onClick={() =>
              setActiveView("vip-scaling")
            }
          >
            <span>♛</span>
            VIP Scaling
          </button>

          <button
            type="button"
            className={
              activeView === "claims"
                ? styles.dailyRewardsTabActive
                : styles.dailyRewardsTab
            }
            onClick={() => setActiveView("claims")}
          >
            <span>✓</span>
            Player Claims
          </button>
        </div>
      </header>

      {activeView === "cycle" && <RewardCycleView />}

      {activeView === "vip-scaling" && (
        <VipScalingView />
      )}

      {activeView === "claims" && (
        <PlayerClaimsView />
      )}
    </section>
  );
}