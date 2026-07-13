"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import { GAME_CONFIG } from "@/config/gameConfig";

export type UpgradeId =
  keyof typeof GAME_CONFIG.upgrades;

export type ServerGameStateSnapshot = {
  balance: string;
  energy: string;
  maxEnergy: string;
  lastEnergyUpdate: string;

  tapPower: string;
  energyCostPerTap: string;

  totalTaps: string;
  totalEarned: string;

  vipPoints: string;
  vipLevel: number;

  revision: number;
};

type TapResult = {
  success: boolean;
  earned: number;
};

type EnergySnapshot = {
  energy: number;
  lastEnergyUpdate: number;
};

type GameState = {
  balance: number;

  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: number;
  energyRestoreAmount: number;

  tapPower: number;
  energyCostPerTap: number;

  tapPowerUpgradeLevel: number;
  maxEnergyUpgradeLevel: number;
  energyRecoveryUpgradeLevel: number;

  totalTaps: number;
  totalEarned: number;

  vipPoints: number;
  vipLevel: number;

  serverRevision: number;
  isServerHydrated: boolean;

  applyServerState: (
    state: ServerGameStateSnapshot,
  ) => void;

  tap: () => TapResult;

  addBalance: (amount: number) => void;
  spendBalance: (amount: number) => boolean;

  addEnergy: (amount: number) => void;
  spendEnergy: (amount: number) => boolean;
  syncEnergy: () => void;

  buyUpgrade: (
    upgradeId: UpgradeId,
  ) => boolean;

  buyFullEnergy: () => boolean;

  setTapPower: (value: number) => void;
  setMaxEnergy: (value: number) => void;

  resetGame: () => void;
};

export function getUpgradePrice(
  upgradeId: UpgradeId,
  currentLevel: number,
): number {
  const upgrade =
    GAME_CONFIG.upgrades[upgradeId];

  return Math.floor(
    upgrade.basePrice *
      upgrade.growthRate ** currentLevel,
  );
}

function parseServerInteger(
  value: string,
  fieldName: string,
): number {
  if (!/^-?\d+$/.test(value)) {
    throw new Error(
      `Invalid server integer for ${fieldName}.`,
    );
  }

  const parsedValue = Number(value);

  if (!Number.isSafeInteger(parsedValue)) {
    throw new Error(
      `Server integer for ${fieldName} exceeds the safe client range.`,
    );
  }

  return parsedValue;
}

function parseServerDate(
  value: string,
): number {
  const parsedValue = Date.parse(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(
      "Invalid server lastEnergyUpdate value.",
    );
  }

  return parsedValue;
}

function calculateEnergySnapshot(
  energy: number,
  maxEnergy: number,
  lastEnergyUpdate: number,
  energyRestoreAmount: number,
  now: number,
): EnergySnapshot {
  if (energy >= maxEnergy) {
    return {
      energy: maxEnergy,
      lastEnergyUpdate: now,
    };
  }

  const elapsedTime = Math.max(
    0,
    now - lastEnergyUpdate,
  );

  const restoreIntervals = Math.floor(
    elapsedTime /
      GAME_CONFIG.energyRestoreIntervalMs,
  );

  if (restoreIntervals <= 0) {
    return {
      energy,
      lastEnergyUpdate,
    };
  }

  const restoredEnergy =
    restoreIntervals * energyRestoreAmount;

  const nextEnergy = Math.min(
    maxEnergy,
    energy + restoredEnergy,
  );

  if (nextEnergy >= maxEnergy) {
    return {
      energy: maxEnergy,
      lastEnergyUpdate: now,
    };
  }

  return {
    energy: nextEnergy,

    lastEnergyUpdate:
      lastEnergyUpdate +
      restoreIntervals *
        GAME_CONFIG.energyRestoreIntervalMs,
  };
}

function createInitialState() {
  return {
    balance: GAME_CONFIG.initialBalance,

    energy: GAME_CONFIG.initialEnergy,
    maxEnergy:
      GAME_CONFIG.initialMaxEnergy,

    lastEnergyUpdate: Date.now(),

    energyRestoreAmount:
      GAME_CONFIG.energyRestoreAmount,

    tapPower:
      GAME_CONFIG.initialTapPower,

    energyCostPerTap:
      GAME_CONFIG.energyCostPerTap,

    tapPowerUpgradeLevel: 0,
    maxEnergyUpgradeLevel: 0,
    energyRecoveryUpgradeLevel: 0,

    totalTaps: 0,
    totalEarned: 0,

    vipPoints: 0,
    vipLevel: 0,

    serverRevision: 0,
    isServerHydrated: false,
  };
}

export const useGameStore =
  create<GameState>()(
    persist(
      (set, get) => ({
        ...createInitialState(),

        applyServerState: (
          serverState,
        ) => {
          const balance =
            parseServerInteger(
              serverState.balance,
              "balance",
            );

          const energy =
            parseServerInteger(
              serverState.energy,
              "energy",
            );

          const maxEnergy =
            parseServerInteger(
              serverState.maxEnergy,
              "maxEnergy",
            );

          const tapPower =
            parseServerInteger(
              serverState.tapPower,
              "tapPower",
            );

          const energyCostPerTap =
            parseServerInteger(
              serverState.energyCostPerTap,
              "energyCostPerTap",
            );

          const totalTaps =
            parseServerInteger(
              serverState.totalTaps,
              "totalTaps",
            );

          const totalEarned =
            parseServerInteger(
              serverState.totalEarned,
              "totalEarned",
            );

          const vipPoints =
            parseServerInteger(
              serverState.vipPoints,
              "vipPoints",
            );

          const lastEnergyUpdate =
            parseServerDate(
              serverState.lastEnergyUpdate,
            );

          if (balance < 0) {
            throw new Error(
              "Server balance cannot be negative.",
            );
          }

          if (energy < 0) {
            throw new Error(
              "Server energy cannot be negative.",
            );
          }

          if (maxEnergy <= 0) {
            throw new Error(
              "Server maxEnergy must be greater than zero.",
            );
          }

          if (energy > maxEnergy) {
            throw new Error(
              "Server energy cannot exceed maxEnergy.",
            );
          }

          if (tapPower <= 0) {
            throw new Error(
              "Server tapPower must be greater than zero.",
            );
          }

          if (energyCostPerTap <= 0) {
            throw new Error(
              "Server energyCostPerTap must be greater than zero.",
            );
          }

          if (
            totalTaps < 0 ||
            totalEarned < 0 ||
            vipPoints < 0
          ) {
            throw new Error(
              "Server counters cannot be negative.",
            );
          }

          if (
            !Number.isInteger(
              serverState.vipLevel,
            ) ||
            serverState.vipLevel < 0
          ) {
            throw new Error(
              "Invalid server vipLevel.",
            );
          }

          if (
            !Number.isInteger(
              serverState.revision,
            ) ||
            serverState.revision < 0
          ) {
            throw new Error(
              "Invalid server revision.",
            );
          }

          set({
            balance,

            energy,
            maxEnergy,
            lastEnergyUpdate,

            tapPower,
            energyCostPerTap,

            totalTaps,
            totalEarned,

            vipPoints,
            vipLevel:
              serverState.vipLevel,

            serverRevision:
              serverState.revision,

            isServerHydrated: true,
          });
        },

        syncEnergy: () => {
          const state = get();
          const now = Date.now();

          const snapshot =
            calculateEnergySnapshot(
              state.energy,
              state.maxEnergy,
              state.lastEnergyUpdate,
              state.energyRestoreAmount,
              now,
            );

          if (
            snapshot.energy ===
              state.energy &&
            snapshot.lastEnergyUpdate ===
              state.lastEnergyUpdate
          ) {
            return;
          }

          set({
            energy: snapshot.energy,

            lastEnergyUpdate:
              snapshot.lastEnergyUpdate,
          });
        },

        tap: () => {
          const state = get();
          const now = Date.now();

          const snapshot =
            calculateEnergySnapshot(
              state.energy,
              state.maxEnergy,
              state.lastEnergyUpdate,
              state.energyRestoreAmount,
              now,
            );

          if (
            snapshot.energy <
            state.energyCostPerTap
          ) {
            set({
              energy: snapshot.energy,

              lastEnergyUpdate:
                snapshot.lastEnergyUpdate,
            });

            return {
              success: false,
              earned: 0,
            };
          }

          const nextEnergy =
            snapshot.energy -
            state.energyCostPerTap;

          set({
            balance:
              state.balance +
              state.tapPower,

            energy: nextEnergy,

            lastEnergyUpdate:
              snapshot.energy >=
              state.maxEnergy
                ? now
                : snapshot.lastEnergyUpdate,

            totalTaps:
              state.totalTaps + 1,

            totalEarned:
              state.totalEarned +
              state.tapPower,
          });

          return {
            success: true,
            earned: state.tapPower,
          };
        },

        addBalance: (amount) => {
          if (amount <= 0) {
            return;
          }

          set((state) => ({
            balance:
              state.balance + amount,
          }));
        },

        spendBalance: (amount) => {
          if (amount <= 0) {
            return false;
          }

          const { balance } = get();

          if (balance < amount) {
            return false;
          }

          set((state) => ({
            balance:
              state.balance - amount,
          }));

          return true;
        },

        addEnergy: (amount) => {
          if (amount <= 0) {
            return;
          }

          const state = get();
          const now = Date.now();

          const snapshot =
            calculateEnergySnapshot(
              state.energy,
              state.maxEnergy,
              state.lastEnergyUpdate,
              state.energyRestoreAmount,
              now,
            );

          const nextEnergy = Math.min(
            state.maxEnergy,
            snapshot.energy + amount,
          );

          set({
            energy: nextEnergy,

            lastEnergyUpdate:
              nextEnergy >=
              state.maxEnergy
                ? now
                : snapshot.lastEnergyUpdate,
          });
        },

        spendEnergy: (amount) => {
          if (amount <= 0) {
            return false;
          }

          const state = get();
          const now = Date.now();

          const snapshot =
            calculateEnergySnapshot(
              state.energy,
              state.maxEnergy,
              state.lastEnergyUpdate,
              state.energyRestoreAmount,
              now,
            );

          if (
            snapshot.energy < amount
          ) {
            set({
              energy: snapshot.energy,

              lastEnergyUpdate:
                snapshot.lastEnergyUpdate,
            });

            return false;
          }

          set({
            energy:
              snapshot.energy - amount,

            lastEnergyUpdate:
              snapshot.energy >=
              state.maxEnergy
                ? now
                : snapshot.lastEnergyUpdate,
          });

          return true;
        },

        buyUpgrade: (
          upgradeId,
        ) => {
          const state = get();
          const now = Date.now();

          const snapshot =
            calculateEnergySnapshot(
              state.energy,
              state.maxEnergy,
              state.lastEnergyUpdate,
              state.energyRestoreAmount,
              now,
            );

          if (
            upgradeId ===
            "tapPower"
          ) {
            const upgrade =
              GAME_CONFIG.upgrades
                .tapPower;

            const currentLevel =
              state.tapPowerUpgradeLevel;

            if (
              currentLevel >=
              upgrade.maxLevel
            ) {
              return false;
            }

            const price =
              getUpgradePrice(
                upgradeId,
                currentLevel,
              );

            if (
              state.balance < price
            ) {
              return false;
            }

            set({
              balance:
                state.balance -
                price,

              energy:
                snapshot.energy,

              lastEnergyUpdate:
                snapshot.lastEnergyUpdate,

              tapPowerUpgradeLevel:
                currentLevel + 1,

              tapPower:
                state.tapPower +
                upgrade.valuePerLevel,
            });

            return true;
          }

          if (
            upgradeId ===
            "maxEnergy"
          ) {
            const upgrade =
              GAME_CONFIG.upgrades
                .maxEnergy;

            const currentLevel =
              state.maxEnergyUpgradeLevel;

            if (
              currentLevel >=
              upgrade.maxLevel
            ) {
              return false;
            }

            const price =
              getUpgradePrice(
                upgradeId,
                currentLevel,
              );

            if (
              state.balance < price
            ) {
              return false;
            }

            const nextMaxEnergy =
              state.maxEnergy +
              upgrade.valuePerLevel;

            const nextEnergy =
              Math.min(
                nextMaxEnergy,
                snapshot.energy +
                  upgrade.valuePerLevel,
              );

            set({
              balance:
                state.balance -
                price,

              maxEnergy:
                nextMaxEnergy,

              energy: nextEnergy,

              lastEnergyUpdate:
                nextEnergy >=
                nextMaxEnergy
                  ? now
                  : snapshot.lastEnergyUpdate,

              maxEnergyUpgradeLevel:
                currentLevel + 1,
            });

            return true;
          }

          if (
            upgradeId ===
            "energyRecovery"
          ) {
            const upgrade =
              GAME_CONFIG.upgrades
                .energyRecovery;

            const currentLevel =
              state.energyRecoveryUpgradeLevel;

            if (
              currentLevel >=
              upgrade.maxLevel
            ) {
              return false;
            }

            const price =
              getUpgradePrice(
                upgradeId,
                currentLevel,
              );

            if (
              state.balance < price
            ) {
              return false;
            }

            set({
              balance:
                state.balance -
                price,

              energy:
                snapshot.energy,

              lastEnergyUpdate:
                snapshot.lastEnergyUpdate,

              energyRecoveryUpgradeLevel:
                currentLevel + 1,

              energyRestoreAmount:
                state.energyRestoreAmount +
                upgrade.valuePerLevel,
            });

            return true;
          }

          return false;
        },

        buyFullEnergy: () => {
          const state = get();
          const now = Date.now();

          const snapshot =
            calculateEnergySnapshot(
              state.energy,
              state.maxEnergy,
              state.lastEnergyUpdate,
              state.energyRestoreAmount,
              now,
            );

          if (
            snapshot.energy >=
            state.maxEnergy
          ) {
            if (
              snapshot.energy !==
                state.energy ||
              snapshot.lastEnergyUpdate !==
                state.lastEnergyUpdate
            ) {
              set({
                energy:
                  snapshot.energy,

                lastEnergyUpdate:
                  snapshot.lastEnergyUpdate,
              });
            }

            return false;
          }

          const price =
            GAME_CONFIG.consumables
              .fullEnergy.price;

          if (
            state.balance < price
          ) {
            set({
              energy:
                snapshot.energy,

              lastEnergyUpdate:
                snapshot.lastEnergyUpdate,
            });

            return false;
          }

          set({
            balance:
              state.balance - price,

            energy:
              state.maxEnergy,

            lastEnergyUpdate: now,
          });

          return true;
        },

        setTapPower: (value) => {
          if (value < 1) {
            return;
          }

          set({
            tapPower: value,
          });
        },

        setMaxEnergy: (value) => {
          if (value < 1) {
            return;
          }

          const state = get();
          const now = Date.now();

          const snapshot =
            calculateEnergySnapshot(
              state.energy,
              state.maxEnergy,
              state.lastEnergyUpdate,
              state.energyRestoreAmount,
              now,
            );

          const nextEnergy =
            Math.min(
              snapshot.energy,
              value,
            );

          set({
            maxEnergy: value,
            energy: nextEnergy,

            lastEnergyUpdate:
              nextEnergy >= value
                ? now
                : snapshot.lastEnergyUpdate,
          });
        },

        resetGame: () => {
          set(createInitialState());
        },
      }),
      {
        name: GAME_CONFIG.saveKey,

        storage:
          createJSONStorage(
            () => localStorage,
          ),

        partialize: (state) => ({
          balance: state.balance,

          energy: state.energy,
          maxEnergy:
            state.maxEnergy,

          lastEnergyUpdate:
            state.lastEnergyUpdate,

          energyRestoreAmount:
            state.energyRestoreAmount,

          tapPower:
            state.tapPower,

          energyCostPerTap:
            state.energyCostPerTap,

          tapPowerUpgradeLevel:
            state.tapPowerUpgradeLevel,

          maxEnergyUpgradeLevel:
            state.maxEnergyUpgradeLevel,

          energyRecoveryUpgradeLevel:
            state.energyRecoveryUpgradeLevel,

          totalTaps:
            state.totalTaps,

          totalEarned:
            state.totalEarned,

          vipPoints:
            state.vipPoints,

          vipLevel:
            state.vipLevel,

          serverRevision:
            state.serverRevision,

          isServerHydrated:
            state.isServerHydrated,
        }),
      },
    ),
  );