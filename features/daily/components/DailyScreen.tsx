"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DAILY_REWARDS,
  type DailyReward,
  useDailyStore,
} from "@/game/daily/dailyStore";
import { useGameStore } from "@/game/gameStore";
import styles from "./DailyScreen.module.css";

function formatRewardAmount(
  reward: DailyReward,
): string {
  if (reward.type === "energy") {
    return reward.amount.toLocaleString("en-US");
  }

  if (reward.amount >= 1_000) {
    return `${reward.amount / 1_000}K`;
  }

  return reward.amount.toLocaleString("en-US");
}

function formatFullReward(
  reward: DailyReward,
): string {
  const amount = reward.amount.toLocaleString(
    "en-US",
  );

  return reward.type === "energy"
    ? `${amount} Energy`
    : `${amount} Coins`;
}

function getNextUtcReset(): number {
  const now = new Date();

  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
}

function formatCountdown(
  milliseconds: number,
): string {
  const totalSeconds = Math.max(
    0,
    Math.floor(milliseconds / 1_000),
  );

  const hours = Math.floor(
    totalSeconds / 3_600,
  );
  const minutes = Math.floor(
    (totalSeconds % 3_600) / 60,
  );
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) =>
      value.toString().padStart(2, "0"),
    )
    .join(":");
}

export function DailyScreen() {
  const currentDay = useDailyStore(
    (state) => state.currentDay,
  );
  const streak = useDailyStore(
    (state) => state.streak,
  );
  const lastClaimedAt = useDailyStore(
    (state) => state.lastClaimedAt,
  );
  const isHydrated = useDailyStore(
    (state) => state.isHydrated,
  );
  const syncDaily = useDailyStore(
    (state) => state.syncDaily,
  );
  const canClaim = useDailyStore(
    (state) => state.canClaim,
  );
  const claimDaily = useDailyStore(
    (state) => state.claimDaily,
  );

  const addBalance = useGameStore(
    (state) => state.addBalance,
  );
  const addEnergy = useGameStore(
    (state) => state.addEnergy,
  );

  const [now, setNow] = useState(0);
  const [claimMessage, setClaimMessage] =
    useState<string | null>(null);

  useEffect(() => {
    syncDaily();
    setNow(Date.now());

    const intervalId = window.setInterval(
      () => {
        const timestamp = Date.now();
        setNow(timestamp);
        syncDaily(timestamp);
      },
      1_000,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [syncDaily]);

  const rewardIsAvailable =
    isHydrated && now > 0 && canClaim(now);

  const activeReward = useMemo(() => {
    return DAILY_REWARDS[currentDay - 1];
  }, [currentDay]);

  const countdown =
    now > 0
      ? formatCountdown(
          getNextUtcReset() - now,
        )
      : "--:--:--";

  function handleClaim() {
    const reward = claimDaily(Date.now());

    if (!reward) {
      return;
    }

    if (reward.type === "coins") {
      addBalance(reward.amount);
    } else {
      addEnergy(reward.amount);
    }

    setClaimMessage(
      `+${formatFullReward(reward)}`,
    );

    window.setTimeout(() => {
      setClaimMessage(null);
    }, 2_200);
  }

  return (
    <section className={styles.screen}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            Daily rewards
          </span>
          <h1 className={styles.title}>
            Come back every day
          </h1>
          <p className={styles.description}>
            Open the app daily, keep your streak and collect a bigger reward each day.
          </p>
        </div>

        <div className={styles.streakBadge}>
          <span className={styles.streakFlame}>
            🔥
          </span>
          <div>
            <strong>{streak}</strong>
            <span>day streak</span>
          </div>
        </div>
      </div>

      <article className={styles.heroCard}>
        <div className={styles.heroGlow} />
        <div className={styles.sparkleOne}>
          ✦
        </div>
        <div className={styles.sparkleTwo}>
          ✦
        </div>
        <div className={styles.sparkleThree}>
          ✧
        </div>

        <div className={styles.heroTopline}>
          <span>
            {rewardIsAvailable
              ? "Today's reward"
              : "Next reward"}
          </span>
          <span className={styles.dayPill}>
            Day {currentDay}
          </span>
        </div>

        <div className={styles.rewardVisual}>
          <div className={styles.rewardHalo} />
          <div className={styles.rewardCoin}>
            {activeReward.type === "energy"
              ? "⚡"
              : "◆"}
          </div>
        </div>

        <div className={styles.heroContent}>
          <strong>
            {formatFullReward(activeReward)}
          </strong>
          <p>
            {rewardIsAvailable
              ? "Your daily gift is ready to collect."
              : "Come back after the UTC reset."}
          </p>
        </div>

        <button
          type="button"
          className={styles.claimButton}
          onClick={handleClaim}
          disabled={!rewardIsAvailable}
        >
          <span>
            {rewardIsAvailable
              ? "Claim reward"
              : "Claimed today"}
          </span>
          <span className={styles.claimArrow}>
            {rewardIsAvailable ? "→" : "✓"}
          </span>
        </button>

        {claimMessage && (
          <div className={styles.claimToast}>
            {claimMessage}
          </div>
        )}
      </article>

      <div className={styles.sectionHeader}>
        <div>
          <span>Weekly streak</span>
          <h2>7 day rewards</h2>
        </div>

        <div className={styles.resetTime}>
          <span>Next reset</span>
          <strong>{countdown}</strong>
        </div>
      </div>

      <div className={styles.rewardGrid}>
        {DAILY_REWARDS.map((item) => {
          const isClaimedInCycle =
            lastClaimedAt !== null &&
            item.day < currentDay;

          const state = isClaimedInCycle
            ? "claimed"
            : item.day === currentDay
              ? rewardIsAvailable
                ? "active"
                : "waiting"
              : "locked";

          return (
            <article
              key={item.day}
              className={`${styles.dayCard} ${styles[state]}`}
            >
              <div className={styles.dayCardTop}>
                <span>Day {item.day}</span>

                {state === "claimed" && (
                  <span className={styles.checkMark}>
                    ✓
                  </span>
                )}

                {state === "active" && (
                  <span className={styles.activeDot} />
                )}

                {state === "waiting" && (
                  <span className={styles.waitingMark}>
                    ✓
                  </span>
                )}

                {state === "locked" && (
                  <span className={styles.lockMark}>
                    •
                  </span>
                )}
              </div>

              <div className={styles.dayRewardIcon}>
                {item.type === "energy"
                  ? "⚡"
                  : item.day === 7
                    ? "♛"
                    : "◆"}
              </div>

              <strong
                className={styles.dayRewardAmount}
              >
                {formatRewardAmount(item)}
              </strong>

              <span
                className={styles.dayRewardLabel}
              >
                {item.type === "energy"
                  ? "Energy"
                  : item.day === 7
                    ? "Grand prize"
                    : "Coins"}
              </span>
            </article>
          );
        })}
      </div>

      <div className={styles.noteCard}>
        <span className={styles.noteIcon}>
          i
        </span>
        <p>
          Visit every day to keep your streak. Missing a full UTC day restarts the cycle from Day 1.
        </p>
      </div>
    </section>
  );
}
