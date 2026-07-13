"use client";

import { useState } from "react";

import type { VipLevel } from "./vipTypes";

import styles from "../../AdminPanel.module.css";

const initialLevels: VipLevel[] = [
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

export function VipLevelsView() {
  const [levels, setLevels] =
    useState<VipLevel[]>(initialLevels);

  const [selectedLevelId, setSelectedLevelId] =
    useState("vip-0");

  const selectedLevel =
    levels.find(
      (level) => level.id === selectedLevelId,
    ) ?? levels[0];

  function updateLevel(
    id: string,
    values: Partial<VipLevel>,
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

  function addLevel() {
    const lastLevel =
      levels[levels.length - 1];

    const nextLevel = lastLevel.level + 1;

    const newLevel: VipLevel = {
      id: `vip-${Date.now()}`,
      level: nextLevel,
      name: `VIP ${nextLevel}`,
      requiredPoints:
        lastLevel.requiredPoints + 100_000,
      color: "#78f661",
      icon: "♛",
      isActive: true,
    };

    setLevels((current) => [
      ...current,
      newLevel,
    ]);

    setSelectedLevelId(newLevel.id);
  }

  function deleteSelectedLevel() {
    if (
      selectedLevel.level === 0 ||
      levels.length <= 1
    ) {
      return;
    }

    const filtered = levels
      .filter(
        (level) =>
          level.id !== selectedLevel.id,
      )
      .map((level, index) => ({
        ...level,
        level: index,
      }));

    setLevels(filtered);
    setSelectedLevelId(filtered[0].id);
  }

  return (
    <div className={styles.vipLevelsLayout}>
      <section className={styles.vipLevelsMain}>
        <article className={styles.vipLevelsCard}>
          <header className={styles.vipCardHeader}>
            <div>
              <h2>VIP Levels</h2>

              <p>
                Рівні, вимоги та статуси VIP-системи
              </p>
            </div>

            <button
              type="button"
              className={styles.vipAddButton}
              onClick={addLevel}
            >
              <span>+</span>
              Add level
            </button>
          </header>

          <div className={styles.vipLevelCards}>
            {levels.map((level) => (
              <button
                key={level.id}
                type="button"
                className={
                  level.id === selectedLevelId
                    ? styles.vipLevelCardActive
                    : styles.vipLevelCard
                }
                onClick={() =>
                  setSelectedLevelId(level.id)
                }
              >
                <div
                  className={styles.vipLevelIcon}
                  style={{
                    color: level.color,
                    borderColor: `${level.color}55`,
                    background: `${level.color}12`,
                  }}
                >
                  {level.icon}
                </div>

                <div className={styles.vipLevelCardInfo}>
                  <span>VIP {level.level}</span>
                  <strong>{level.name}</strong>

                  <small>
                    {level.requiredPoints.toLocaleString(
                      "uk-UA",
                    )}{" "}
                    points
                  </small>
                </div>

                <i
                  className={
                    level.isActive
                      ? styles.vipLevelActiveDot
                      : styles.vipLevelDisabledDot
                  }
                />
              </button>
            ))}
          </div>
        </article>

        <article className={styles.vipEditorCard}>
          <header className={styles.vipCardHeader}>
            <div>
              <h2>
                Edit VIP {selectedLevel.level}
              </h2>

              <p>
                Основні налаштування рівня
              </p>
            </div>

            <label className={styles.vipToggle}>
              <input
                type="checkbox"
                checked={selectedLevel.isActive}
                onChange={(event) =>
                  updateLevel(selectedLevel.id, {
                    isActive:
                      event.target.checked,
                  })
                }
              />

              <span />

              <b>
                {selectedLevel.isActive
                  ? "Active"
                  : "Disabled"}
              </b>
            </label>
          </header>

          <div className={styles.vipEditorContent}>
            <div className={styles.vipFieldsGrid}>
              <label>
                <span>Level name</span>

                <input
                  type="text"
                  value={selectedLevel.name}
                  onChange={(event) =>
                    updateLevel(selectedLevel.id, {
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>Required VIP points</span>

                <input
                  type="number"
                  min="0"
                  value={
                    selectedLevel.requiredPoints
                  }
                  onChange={(event) =>
                    updateLevel(selectedLevel.id, {
                      requiredPoints:
                        Number(
                          event.target.value,
                        ) || 0,
                    })
                  }
                  disabled={
                    selectedLevel.level === 0
                  }
                />
              </label>

              <label>
                <span>Level color</span>

                <div
                  className={
                    styles.vipColorInput
                  }
                >
                  <input
                    type="color"
                    value={selectedLevel.color}
                    onChange={(event) =>
                      updateLevel(
                        selectedLevel.id,
                        {
                          color:
                            event.target.value,
                        },
                      )
                    }
                  />

                  <input
                    type="text"
                    value={selectedLevel.color}
                    onChange={(event) =>
                      updateLevel(
                        selectedLevel.id,
                        {
                          color:
                            event.target.value,
                        },
                      )
                    }
                  />
                </div>
              </label>

              <label>
                <span>Icon</span>

                <input
                  type="text"
                  value={selectedLevel.icon}
                  maxLength={4}
                  onChange={(event) =>
                    updateLevel(selectedLevel.id, {
                      icon: event.target.value,
                    })
                  }
                  placeholder="♛"
                />
              </label>
            </div>

            <div className={styles.vipEditorActions}>
              <button
                type="button"
                className={styles.vipDeleteButton}
                onClick={deleteSelectedLevel}
                disabled={
                  selectedLevel.level === 0 ||
                  levels.length <= 1
                }
              >
                Delete level
              </button>

              <button
                type="button"
                className={styles.vipSaveButton}
                disabled
                title="Підключимо після створення VIP API"
              >
                Save changes
              </button>
            </div>
          </div>
        </article>
      </section>

      <aside className={styles.vipPreviewColumn}>
        <div className={styles.vipPreviewSticky}>
          <div className={styles.vipPreviewHeading}>
            <span>Player preview</span>
            <small>VIP card</small>
          </div>

          <article
            className={styles.vipPreviewCard}
            style={{
              borderColor:
                `${selectedLevel.color}55`,
              background: `radial-gradient(circle at 100% 0%, ${selectedLevel.color}22, transparent 48%), #101319`,
            }}
          >
            <div
              className={
                styles.vipPreviewMainIcon
              }
              style={{
                color: selectedLevel.color,
                borderColor:
                  `${selectedLevel.color}55`,
                background:
                  `${selectedLevel.color}12`,
              }}
            >
              {selectedLevel.icon}
            </div>

            <span>
              VIP {selectedLevel.level}
            </span>

            <h3>{selectedLevel.name}</h3>

            <p>
              Exclusive rewards and benefits
            </p>

            <div
              className={styles.vipPreviewPoints}
            >
              <span>Required points</span>

              <strong>
                {selectedLevel.requiredPoints.toLocaleString(
                  "uk-UA",
                )}
              </strong>
            </div>

            <div
              className={
                styles.vipPreviewProgress
              }
            >
              <i
                style={{
                  width:
                    selectedLevel.level === 0
                      ? "100%"
                      : "62%",
                  background:
                    selectedLevel.color,
                }}
              />
            </div>
          </article>

          <div className={styles.vipPreviewInfo}>
            <div>
              <span>Status</span>
              <strong>
                {selectedLevel.isActive
                  ? "Active"
                  : "Disabled"}
              </strong>
            </div>

            <div>
              <span>Level</span>
              <strong>
                VIP {selectedLevel.level}
              </strong>
            </div>

            <div>
              <span>Color</span>
              <strong>
                {selectedLevel.color}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}