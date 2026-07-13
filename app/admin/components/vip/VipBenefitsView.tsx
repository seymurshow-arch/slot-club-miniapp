"use client";

import { useState } from "react";

import type {
  VipBenefit,
  VipLevel,
} from "./vipTypes";

import styles from "../../AdminPanel.module.css";

const levels: VipLevel[] = [
  {
    id: "vip-0",
    level: 0,
    name: "Standard",
    requiredPoints: 0,
    color: "#8b919b",
    icon: "♙",
    isActive: true,
  },
  {
    id: "vip-1",
    level: 1,
    name: "Bronze",
    requiredPoints: 1_000,
    color: "#b8794b",
    icon: "♛",
    isActive: true,
  },
  {
    id: "vip-2",
    level: 2,
    name: "Silver",
    requiredPoints: 5_000,
    color: "#bfc7d2",
    icon: "♛",
    isActive: true,
  },
  {
    id: "vip-3",
    level: 3,
    name: "Gold",
    requiredPoints: 15_000,
    color: "#e5bd4f",
    icon: "♛",
    isActive: true,
  },
  {
    id: "vip-4",
    level: 4,
    name: "Diamond",
    requiredPoints: 50_000,
    color: "#63d8ff",
    icon: "◆",
    isActive: true,
  },
  {
    id: "vip-5",
    level: 5,
    name: "Royal",
    requiredPoints: 150_000,
    color: "#be75ff",
    icon: "♕",
    isActive: true,
  },
];

const initialBenefits: VipBenefit[] =
  levels.map((level) => ({
    vipLevelId: level.id,

    tapMultiplier:
      level.level === 0
        ? 1
        : 1 + level.level * 0.15,

    dailyRewardMultiplier:
      level.level === 0
        ? 1
        : 1 + level.level * 0.2,

    maxEnergyBonus: level.level * 250,

    energyRecoveryMultiplier:
      level.level === 0
        ? 1
        : 1 + level.level * 0.1,

    shopDiscountPercent:
      level.level * 2,

    referralBonusPercent:
      level.level * 5,

    extraTasks:
      level.level >= 2
        ? level.level - 1
        : 0,

    extraVipPointsPercent:
      level.level * 5,
  }));

export function VipBenefitsView() {
  const [benefits, setBenefits] =
    useState<VipBenefit[]>(
      initialBenefits,
    );

  const [selectedLevelId, setSelectedLevelId] =
    useState("vip-0");

  const selectedLevel =
    levels.find(
      (level) =>
        level.id === selectedLevelId,
    ) ?? levels[0];

  const selectedBenefits =
    benefits.find(
      (benefit) =>
        benefit.vipLevelId ===
        selectedLevelId,
    ) ?? benefits[0];

  function updateBenefits(
    values: Partial<VipBenefit>,
  ) {
    setBenefits((current) =>
      current.map((benefit) =>
        benefit.vipLevelId ===
        selectedLevelId
          ? {
              ...benefit,
              ...values,
            }
          : benefit,
      ),
    );
  }

  return (
    <div className={styles.vipBenefitsLayout}>
      <section className={styles.vipBenefitsMain}>
        <article
          className={styles.vipBenefitsCard}
        >
          <header className={styles.vipCardHeader}>
            <div>
              <h2>VIP Benefits</h2>

              <p>
                Бонуси, які отримує гравець
                на кожному рівні
              </p>
            </div>

            <button type="button" disabled>
              Save benefits
            </button>
          </header>

          <div
            className={
              styles.vipBenefitsLevelTabs
            }
          >
            {levels.map((level) => (
              <button
                key={level.id}
                type="button"
                className={
                  selectedLevelId === level.id
                    ? styles.vipBenefitsLevelActive
                    : styles.vipBenefitsLevel
                }
                onClick={() =>
                  setSelectedLevelId(level.id)
                }
              >
                <span
                  style={{
                    color: level.color,
                  }}
                >
                  {level.icon}
                </span>

                <strong>
                  VIP {level.level}
                </strong>

                <small>{level.name}</small>
              </button>
            ))}
          </div>

          <div
            className={
              styles.vipBenefitsEditor
            }
          >
            <div className={styles.vipBenefitsTitle}>
              <div
                style={{
                  color:
                    selectedLevel.color,
                  borderColor:
                    `${selectedLevel.color}44`,
                  background:
                    `${selectedLevel.color}10`,
                }}
              >
                {selectedLevel.icon}
              </div>

              <span>
                <strong>
                  VIP {selectedLevel.level} —{" "}
                  {selectedLevel.name}
                </strong>

                <small>
                  Налаштування бонусів рівня
                </small>
              </span>
            </div>

            <div
              className={styles.vipBenefitsGrid}
            >
              <label>
                <span>Tap multiplier</span>

                <div>
                  <b>×</b>

                  <input
                    type="number"
                    min="1"
                    step="0.05"
                    value={
                      selectedBenefits.tapMultiplier
                    }
                    onChange={(event) =>
                      updateBenefits({
                        tapMultiplier:
                          Number(
                            event.target.value,
                          ) || 1,
                      })
                    }
                  />
                </div>

                <small>
                  Множник монет за один тап
                </small>
              </label>

              <label>
                <span>
                  Daily reward multiplier
                </span>

                <div>
                  <b>×</b>

                  <input
                    type="number"
                    min="1"
                    step="0.05"
                    value={
                      selectedBenefits.dailyRewardMultiplier
                    }
                    onChange={(event) =>
                      updateBenefits({
                        dailyRewardMultiplier:
                          Number(
                            event.target.value,
                          ) || 1,
                      })
                    }
                  />
                </div>

                <small>
                  Множник Daily Rewards
                </small>
              </label>

              <label>
                <span>Max energy bonus</span>

                <div>
                  <b>+</b>

                  <input
                    type="number"
                    min="0"
                    value={
                      selectedBenefits.maxEnergyBonus
                    }
                    onChange={(event) =>
                      updateBenefits({
                        maxEnergyBonus:
                          Number(
                            event.target.value,
                          ) || 0,
                      })
                    }
                  />
                </div>

                <small>
                  Додаткова максимальна енергія
                </small>
              </label>

              <label>
                <span>
                  Energy recovery multiplier
                </span>

                <div>
                  <b>×</b>

                  <input
                    type="number"
                    min="1"
                    step="0.05"
                    value={
                      selectedBenefits.energyRecoveryMultiplier
                    }
                    onChange={(event) =>
                      updateBenefits({
                        energyRecoveryMultiplier:
                          Number(
                            event.target.value,
                          ) || 1,
                      })
                    }
                  />
                </div>

                <small>
                  Швидкість відновлення енергії
                </small>
              </label>

              <label>
                <span>Shop discount</span>

                <div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      selectedBenefits.shopDiscountPercent
                    }
                    onChange={(event) =>
                      updateBenefits({
                        shopDiscountPercent:
                          Number(
                            event.target.value,
                          ) || 0,
                      })
                    }
                  />

                  <b>%</b>
                </div>

                <small>
                  Знижка на покупки за монети
                </small>
              </label>

              <label>
                <span>Referral bonus</span>

                <div>
                  <input
                    type="number"
                    min="0"
                    value={
                      selectedBenefits.referralBonusPercent
                    }
                    onChange={(event) =>
                      updateBenefits({
                        referralBonusPercent:
                          Number(
                            event.target.value,
                          ) || 0,
                      })
                    }
                  />

                  <b>%</b>
                </div>

                <small>
                  Додатковий реферальний бонус
                </small>
              </label>

              <label>
                <span>Extra tasks</span>

                <div>
                  <b>+</b>

                  <input
                    type="number"
                    min="0"
                    value={
                      selectedBenefits.extraTasks
                    }
                    onChange={(event) =>
                      updateBenefits({
                        extraTasks:
                          Number(
                            event.target.value,
                          ) || 0,
                      })
                    }
                  />
                </div>

                <small>
                  Додаткові VIP-завдання
                </small>
              </label>

              <label>
                <span>Extra VIP points</span>

                <div>
                  <input
                    type="number"
                    min="0"
                    value={
                      selectedBenefits.extraVipPointsPercent
                    }
                    onChange={(event) =>
                      updateBenefits({
                        extraVipPointsPercent:
                          Number(
                            event.target.value,
                          ) || 0,
                      })
                    }
                  />

                  <b>%</b>
                </div>

                <small>
                  Бонус до отриманих VIP points
                </small>
              </label>
            </div>
          </div>
        </article>
      </section>

      <aside className={styles.vipBenefitPreview}>
        <div className={styles.vipPreviewSticky}>
          <div className={styles.vipPreviewHeading}>
            <span>Benefits preview</span>
            <small>
              VIP {selectedLevel.level}
            </small>
          </div>

          <article
            className={
              styles.vipBenefitsPreviewCard
            }
            style={{
              borderColor:
                `${selectedLevel.color}44`,
            }}
          >
            <div
              className={
                styles.vipBenefitsPreviewHeader
              }
            >
              <span
                style={{
                  color:
                    selectedLevel.color,
                }}
              >
                {selectedLevel.icon}
              </span>

              <div>
                <small>
                  VIP {selectedLevel.level}
                </small>

                <strong>
                  {selectedLevel.name}
                </strong>
              </div>
            </div>

            <div
              className={
                styles.vipBenefitsPreviewList
              }
            >
              <div>
                <span>Tap reward</span>

                <strong>
                  ×
                  {selectedBenefits.tapMultiplier}
                </strong>
              </div>

              <div>
                <span>Daily reward</span>

                <strong>
                  ×
                  {
                    selectedBenefits.dailyRewardMultiplier
                  }
                </strong>
              </div>

              <div>
                <span>Max energy</span>

                <strong>
                  +
                  {
                    selectedBenefits.maxEnergyBonus
                  }
                </strong>
              </div>

              <div>
                <span>Shop discount</span>

                <strong>
                  {
                    selectedBenefits.shopDiscountPercent
                  }
                  %
                </strong>
              </div>

              <div>
                <span>Referral bonus</span>

                <strong>
                  +
                  {
                    selectedBenefits.referralBonusPercent
                  }
                  %
                </strong>
              </div>

              <div>
                <span>Extra tasks</span>

                <strong>
                  +
                  {selectedBenefits.extraTasks}
                </strong>
              </div>
            </div>
          </article>

          <div className={styles.vipNotice}>
            <span>!</span>

            <p>
              Після підключення механіки ці
              значення використовуватимуться
              грою, Shop, Daily Rewards,
              Tasks і Referral.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}