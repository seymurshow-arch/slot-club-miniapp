"use client";

import { useState } from "react";

import type { VipRewardScaling } from "./dailyRewardTypes";

import styles from "../../AdminPanel.module.css";

const initialVipLevels: VipRewardScaling[] = [
  {
    id: "vip-0",
    level: 0,
    name: "Standard",
    coinsMultiplier: 1,
    energyMultiplier: 1,
    extraVipPoints: 0,
    isActive: true,
  },
  {
    id: "vip-1",
    level: 1,
    name: "Bronze",
    coinsMultiplier: 1.1,
    energyMultiplier: 1.05,
    extraVipPoints: 0,
    isActive: true,
  },
  {
    id: "vip-2",
    level: 2,
    name: "Silver",
    coinsMultiplier: 1.25,
    energyMultiplier: 1.1,
    extraVipPoints: 5,
    isActive: true,
  },
  {
    id: "vip-3",
    level: 3,
    name: "Gold",
    coinsMultiplier: 1.5,
    energyMultiplier: 1.2,
    extraVipPoints: 10,
    isActive: true,
  },
  {
    id: "vip-4",
    level: 4,
    name: "Diamond",
    coinsMultiplier: 2,
    energyMultiplier: 1.5,
    extraVipPoints: 20,
    isActive: true,
  },
  {
    id: "vip-5",
    level: 5,
    name: "Royal",
    coinsMultiplier: 3,
    energyMultiplier: 2,
    extraVipPoints: 50,
    isActive: true,
  },
];

const previewBaseCoins = 5000;
const previewBaseEnergy = 500;

export function VipScalingView() {
  const [levels, setLevels] =
    useState<VipRewardScaling[]>(initialVipLevels);

  function updateLevel(
    id: string,
    values: Partial<VipRewardScaling>,
  ) {
    setLevels((current) =>
      current.map((level) =>
        level.id === id
          ? {
              ...level,
              ...values,
            }
          : level,
      ),
    );
  }

  return (
    <section className={styles.vipScalingSection}>
      <div className={styles.vipScalingIntro}>
        <div>
          <h2>Automatic VIP Scaling</h2>

          <p>
            Фактична нагорода розраховується з базової
            нагороди дня та множника VIP-рівня.
          </p>
        </div>

        <button type="button" disabled>
          Save multipliers
        </button>
      </div>

      <div className={styles.vipScalingTable}>
        <div className={styles.vipScalingHeader}>
          <span>VIP Level</span>
          <span>Coins multiplier</span>
          <span>Energy multiplier</span>
          <span>Extra VIP points</span>
          <span>Day 7 preview</span>
          <span>Status</span>
        </div>

        {levels.map((level) => {
          const finalCoins = Math.floor(
            previewBaseCoins * level.coinsMultiplier,
          );

          const finalEnergy = Math.floor(
            previewBaseEnergy *
              level.energyMultiplier,
          );

          return (
            <div
              key={level.id}
              className={styles.vipScalingRow}
            >
              <div className={styles.vipScalingLevel}>
                <span>VIP {level.level}</span>

                <strong>{level.name}</strong>
              </div>

              <label>
                <span>×</span>

                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={level.coinsMultiplier}
                  onChange={(event) =>
                    updateLevel(level.id, {
                      coinsMultiplier:
                        Number(event.target.value) || 0,
                    })
                  }
                />
              </label>

              <label>
                <span>×</span>

                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={level.energyMultiplier}
                  onChange={(event) =>
                    updateLevel(level.id, {
                      energyMultiplier:
                        Number(event.target.value) || 0,
                    })
                  }
                />
              </label>

              <label>
                <span>+</span>

                <input
                  type="number"
                  min="0"
                  value={level.extraVipPoints}
                  onChange={(event) =>
                    updateLevel(level.id, {
                      extraVipPoints:
                        Number(event.target.value) || 0,
                    })
                  }
                />
              </label>

              <div className={styles.vipScalingPreview}>
                <strong>
                  {finalCoins.toLocaleString("uk-UA")} coins
                </strong>

                <span>
                  {finalEnergy.toLocaleString("uk-UA")} energy
                </span>
              </div>

              <label className={styles.dailyToggle}>
                <input
                  type="checkbox"
                  checked={level.isActive}
                  onChange={(event) =>
                    updateLevel(level.id, {
                      isActive: event.target.checked,
                    })
                  }
                />

                <span />

                <b>
                  {level.isActive
                    ? "Active"
                    : "Disabled"}
                </b>
              </label>
            </div>
          );
        })}
      </div>

      <div className={styles.vipScalingNotice}>
        <span>!</span>

        <p>
          Після підключення механіки VIP рівні й назви
          автоматично братимуться з налаштувань VIP.
          Тут залишиться лише керування множниками Daily
          Rewards.
        </p>
      </div>
    </section>
  );
}