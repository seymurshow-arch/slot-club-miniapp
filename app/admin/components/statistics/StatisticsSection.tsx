"use client";

import { useState } from "react";

import { ContentPerformanceStats } from "./ContentPerformanceStats";
import { EconomyStats } from "./EconomyStats";
import { PlayerActivityStats } from "./PlayerActivityStats";
import { StatisticsOverview } from "./StatisticsOverview";

import type {
  StatisticsPlayer,
  StatisticsView,
} from "./statisticsTypes";

import styles from "../../AdminPanel.module.css";

type StatisticsSectionProps = {
  totalPlayers: number;
  registeredToday: number;
  activeToday: number;
  players: StatisticsPlayer[];
};

export function StatisticsSection({
  totalPlayers,
  registeredToday,
  activeToday,
  players,
}: StatisticsSectionProps) {
  const [activeView, setActiveView] =
    useState<StatisticsView>("overview");

  return (
    <section className={styles.statisticsSection}>
      <header className={styles.statisticsSectionHeader}>
        <div>
          <h2>Statistics</h2>

          <p>
            Аналітика гравців, економіки та ігрового контенту
          </p>
        </div>

        <div className={styles.statisticsViewTabs}>
          <button
            type="button"
            className={
              activeView === "overview"
                ? styles.statisticsViewTabActive
                : styles.statisticsViewTab
            }
            onClick={() => setActiveView("overview")}
          >
            <span>▦</span>
            Overview
          </button>

          <button
            type="button"
            className={
              activeView === "player-activity"
                ? styles.statisticsViewTabActive
                : styles.statisticsViewTab
            }
            onClick={() => setActiveView("player-activity")}
          >
            <span>♟</span>
            Player Activity
          </button>

          <button
            type="button"
            className={
              activeView === "economy"
                ? styles.statisticsViewTabActive
                : styles.statisticsViewTab
            }
            onClick={() => setActiveView("economy")}
          >
            <span>◉</span>
            Economy
          </button>

          <button
            type="button"
            className={
              activeView === "content"
                ? styles.statisticsViewTabActive
                : styles.statisticsViewTab
            }
            onClick={() => setActiveView("content")}
          >
            <span>⌁</span>
            Content Performance
          </button>
        </div>
      </header>

      {activeView === "overview" && (
        <StatisticsOverview
          totalPlayers={totalPlayers}
          registeredToday={registeredToday}
          activeToday={activeToday}
          players={players}
        />
      )}

      {activeView === "player-activity" && (
        <PlayerActivityStats
          players={players}
          activeToday={activeToday}
        />
      )}

      {activeView === "economy" && <EconomyStats />}

      {activeView === "content" && (
        <ContentPerformanceStats />
      )}
    </section>
  );
}