"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

export type DailyRewardType =
  | "coins"
  | "energy";

export type DailyReward = {
  day: number;
  type: DailyRewardType;
  amount: number;
};

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, type: "coins", amount: 5_000 },
  { day: 2, type: "coins", amount: 10_000 },
  { day: 3, type: "coins", amount: 15_000 },
  { day: 4, type: "energy", amount: 25 },
  { day: 5, type: "coins", amount: 25_000 },
  { day: 6, type: "energy", amount: 50 },
  { day: 7, type: "coins", amount: 100_000 },
];

const DAY_MS = 24 * 60 * 60 * 1_000;

function getUtcDayStart(timestamp = Date.now()): number {
  const date = new Date(timestamp);

  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

function getUtcDayDifference(
  fromTimestamp: number,
  toTimestamp: number,
): number {
  return Math.floor(
    (getUtcDayStart(toTimestamp) -
      getUtcDayStart(fromTimestamp)) /
      DAY_MS,
  );
}

type DailyState = {
  currentDay: number;
  streak: number;
  lastClaimedAt: number | null;
  isHydrated: boolean;

  setHydrated: (value: boolean) => void;
  syncDaily: (now?: number) => void;
  canClaim: (now?: number) => boolean;
  claimDaily: (
    now?: number,
  ) => DailyReward | null;
};

export const useDailyStore =
  create<DailyState>()(
    persist(
      (set, get) => ({
        currentDay: 1,
        streak: 0,
        lastClaimedAt: null,
        isHydrated: false,

        setHydrated: (value) => {
          set({ isHydrated: value });
        },

        syncDaily: (now = Date.now()) => {
          const state = get();

          if (state.lastClaimedAt === null) {
            return;
          }

          const dayDifference =
            getUtcDayDifference(
              state.lastClaimedAt,
              now,
            );

          if (dayDifference > 1) {
            set({
              currentDay: 1,
              streak: 0,
              lastClaimedAt: null,
            });
          }
        },

        canClaim: (now = Date.now()) => {
          const state = get();

          if (state.lastClaimedAt === null) {
            return true;
          }

          return (
            getUtcDayDifference(
              state.lastClaimedAt,
              now,
            ) >= 1
          );
        },

        claimDaily: (now = Date.now()) => {
          const state = get();

          if (!state.canClaim(now)) {
            return null;
          }

          let rewardDay = state.currentDay;
          let nextStreak = state.streak + 1;

          if (state.lastClaimedAt !== null) {
            const dayDifference =
              getUtcDayDifference(
                state.lastClaimedAt,
                now,
              );

            if (dayDifference > 1) {
              rewardDay = 1;
              nextStreak = 1;
            }
          }

          const reward =
            DAILY_REWARDS[rewardDay - 1];

          const nextDay =
            rewardDay >= DAILY_REWARDS.length
              ? 1
              : rewardDay + 1;

          set({
            currentDay: nextDay,
            streak: nextStreak,
            lastClaimedAt: now,
          });

          return reward;
        },
      }),
      {
        name: "slot-club-daily",
        storage: createJSONStorage(
          () => localStorage,
        ),
        partialize: (state) => ({
          currentDay: state.currentDay,
          streak: state.streak,
          lastClaimedAt:
            state.lastClaimedAt,
        }),
        onRehydrateStorage: () =>
          (state) => {
            state?.setHydrated(true);
            state?.syncDaily();
          },
      },
    ),
  );
