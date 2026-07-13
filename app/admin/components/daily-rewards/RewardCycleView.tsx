"use client";

import {
  type ChangeEvent,
  useEffect,
  useState,
} from "react";

import type {
  DailyRewardDay,
  DailyRewardSettings,
  FinalDayBehavior,
  MissedDayBehavior,
} from "./dailyRewardTypes";

import styles from "../../AdminPanel.module.css";

const initialDays: DailyRewardDay[] = [
  {
    id: "day-1",
    day: 1,
    coins: 500,
    energy: 0,
    vipPoints: 0,
    itemName: "",
    imagePreview: null,
    isActive: true,
  },
  {
    id: "day-2",
    day: 2,
    coins: 750,
    energy: 0,
    vipPoints: 0,
    itemName: "",
    imagePreview: null,
    isActive: true,
  },
  {
    id: "day-3",
    day: 3,
    coins: 1000,
    energy: 100,
    vipPoints: 0,
    itemName: "",
    imagePreview: null,
    isActive: true,
  },
  {
    id: "day-4",
    day: 4,
    coins: 1500,
    energy: 0,
    vipPoints: 0,
    itemName: "",
    imagePreview: null,
    isActive: true,
  },
  {
    id: "day-5",
    day: 5,
    coins: 2000,
    energy: 250,
    vipPoints: 0,
    itemName: "",
    imagePreview: null,
    isActive: true,
  },
  {
    id: "day-6",
    day: 6,
    coins: 3000,
    energy: 0,
    vipPoints: 10,
    itemName: "",
    imagePreview: null,
    isActive: true,
  },
  {
    id: "day-7",
    day: 7,
    coins: 5000,
    energy: 500,
    vipPoints: 25,
    itemName: "",
    imagePreview: null,
    isActive: true,
  },
];

const initialSettings: DailyRewardSettings = {
  resetTime: "00:00",
  timezone: "UTC",
  missedDayBehavior: "reset",
  finalDayBehavior: "restart",
};

export function RewardCycleView() {
  const [days, setDays] =
    useState<DailyRewardDay[]>(initialDays);

  const [settings, setSettings] =
    useState<DailyRewardSettings>(initialSettings);

  const [selectedDayId, setSelectedDayId] =
    useState<string>("day-1");

  const selectedDay =
    days.find((day) => day.id === selectedDayId) ?? days[0];

  useEffect(() => {
    return () => {
      days.forEach((day) => {
        if (day.imagePreview?.startsWith("blob:")) {
          URL.revokeObjectURL(day.imagePreview);
        }
      });
    };
  }, [days]);

  function updateDay(
    id: string,
    values: Partial<DailyRewardDay>,
  ) {
    setDays((current) =>
      current.map((day) =>
        day.id === id
          ? {
              ...day,
              ...values,
            }
          : day,
      ),
    );
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file || !selectedDay) {
      return;
    }

    if (selectedDay.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedDay.imagePreview);
    }

    updateDay(selectedDay.id, {
      imagePreview: URL.createObjectURL(file),
    });
  }

  function addDay() {
    const nextDay = days.length + 1;

    const newDay: DailyRewardDay = {
      id: `day-${Date.now()}`,
      day: nextDay,
      coins: 0,
      energy: 0,
      vipPoints: 0,
      itemName: "",
      imagePreview: null,
      isActive: true,
    };

    setDays((current) => [...current, newDay]);
    setSelectedDayId(newDay.id);
  }

  function removeSelectedDay() {
    if (days.length <= 1) {
      return;
    }

    setDays((current) => {
      const filtered = current
        .filter((day) => day.id !== selectedDayId)
        .map((day, index) => ({
          ...day,
          day: index + 1,
        }));

      setSelectedDayId(filtered[0].id);

      return filtered;
    });
  }

  if (!selectedDay) {
    return null;
  }

  return (
    <div className={styles.dailyCycleLayout}>
      <section className={styles.dailyCycleMain}>
        <article className={styles.dailyRulesCard}>
          <header className={styles.dailyCardHeader}>
            <div>
              <h2>Global Rules</h2>
              <p>
                Основні правила щоденного циклу нагород
              </p>
            </div>

            <span className={styles.dailyNotConnectedBadge}>
              Local preview
            </span>
          </header>

          <div className={styles.dailyRulesGrid}>
            <label>
              <span>Claim reset time</span>

              <input
                type="time"
                value={settings.resetTime}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    resetTime: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Timezone</span>

              <select
                value={settings.timezone}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    timezone: event.target.value,
                  }))
                }
              >
                <option value="UTC">UTC</option>
                <option value="Europe/Kyiv">
                  Europe/Kyiv
                </option>
                <option value="Europe/Warsaw">
                  Europe/Warsaw
                </option>
              </select>
            </label>

            <label>
              <span>After missed day</span>

              <select
                value={settings.missedDayBehavior}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    missedDayBehavior:
                      event.target
                        .value as MissedDayBehavior,
                  }))
                }
              >
                <option value="reset">
                  Reset to Day 1
                </option>
                <option value="keep">
                  Keep current day
                </option>
                <option value="step-back">
                  Move back one day
                </option>
              </select>
            </label>

            <label>
              <span>After final day</span>

              <select
                value={settings.finalDayBehavior}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    finalDayBehavior:
                      event.target
                        .value as FinalDayBehavior,
                  }))
                }
              >
                <option value="restart">
                  Restart from Day 1
                </option>
                <option value="stay-final">
                  Stay on final reward
                </option>
              </select>
            </label>
          </div>
        </article>

        <article className={styles.dailyRewardsCard}>
          <header className={styles.dailyCardHeader}>
            <div>
              <h2>Reward Cycle</h2>
              <p>
                Базові нагороди до застосування VIP-множників
              </p>
            </div>

            <button
              type="button"
              className={styles.dailyAddButton}
              onClick={addDay}
            >
              <span>+</span>
              Add day
            </button>
          </header>

          <div className={styles.dailyDaysGrid}>
            {days.map((day) => (
              <button
                key={day.id}
                type="button"
                className={
                  day.id === selectedDayId
                    ? styles.dailyDayCardActive
                    : styles.dailyDayCard
                }
                onClick={() => setSelectedDayId(day.id)}
              >
                <div className={styles.dailyDayCardTop}>
                  <span>Day {day.day}</span>

                  <i
                    className={
                      day.isActive
                        ? styles.dailyStatusActive
                        : styles.dailyStatusDisabled
                    }
                  />
                </div>

                <div className={styles.dailyDayImage}>
                  {day.imagePreview ? (
                    <img
                      src={day.imagePreview}
                      alt={`Day ${day.day}`}
                    />
                  ) : (
                    <span>◆</span>
                  )}
                </div>

                <strong>
                  {day.coins.toLocaleString("uk-UA")} coins
                </strong>

                <small>
                  {day.energy > 0
                    ? `+ ${day.energy} energy`
                    : "Coins reward"}
                </small>
              </button>
            ))}
          </div>
        </article>

        <article className={styles.dailyEditorCard}>
          <header className={styles.dailyCardHeader}>
            <div>
              <h2>Edit Day {selectedDay.day}</h2>
              <p>
                Налаштування базової нагороди цього дня
              </p>
            </div>

            <label className={styles.dailyToggle}>
              <input
                type="checkbox"
                checked={selectedDay.isActive}
                onChange={(event) =>
                  updateDay(selectedDay.id, {
                    isActive: event.target.checked,
                  })
                }
              />

              <span />

              <b>
                {selectedDay.isActive
                  ? "Active"
                  : "Disabled"}
              </b>
            </label>
          </header>

          <div className={styles.dailyEditorContent}>
            <div className={styles.dailyImageEditor}>
              <div className={styles.dailyEditorImage}>
                {selectedDay.imagePreview ? (
                  <img
                    src={selectedDay.imagePreview}
                    alt={`Day ${selectedDay.day}`}
                  />
                ) : (
                  <span>◆</span>
                )}
              </div>

              <div>
                <strong>Reward image</strong>

                <p>
                  Картинка, яку гравець побачить у Daily
                  Rewards.
                </p>

                <label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                  />

                  <span>Choose image</span>
                </label>

                {selectedDay.imagePreview && (
                  <button
                    type="button"
                    onClick={() =>
                      updateDay(selectedDay.id, {
                        imagePreview: null,
                      })
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className={styles.dailyEditorFields}>
              <label>
                <span>Coins</span>

                <input
                  type="number"
                  min="0"
                  value={selectedDay.coins}
                  onChange={(event) =>
                    updateDay(selectedDay.id, {
                      coins:
                        Number(event.target.value) || 0,
                    })
                  }
                />
              </label>

              <label>
                <span>Energy</span>

                <input
                  type="number"
                  min="0"
                  value={selectedDay.energy}
                  onChange={(event) =>
                    updateDay(selectedDay.id, {
                      energy:
                        Number(event.target.value) || 0,
                    })
                  }
                />
              </label>

              <label>
                <span>VIP Points</span>

                <input
                  type="number"
                  min="0"
                  value={selectedDay.vipPoints}
                  onChange={(event) =>
                    updateDay(selectedDay.id, {
                      vipPoints:
                        Number(event.target.value) || 0,
                    })
                  }
                />
              </label>

              <label>
                <span>Shop item</span>

                <input
                  type="text"
                  value={selectedDay.itemName}
                  onChange={(event) =>
                    updateDay(selectedDay.id, {
                      itemName: event.target.value,
                    })
                  }
                  placeholder="Optional item name"
                />
              </label>
            </div>

            <div className={styles.dailyEditorActions}>
              <button
                type="button"
                className={styles.dailyDeleteButton}
                onClick={removeSelectedDay}
                disabled={days.length <= 1}
              >
                Delete day
              </button>

              <button
                type="button"
                className={styles.dailySaveButton}
                disabled
                title="Підключимо після створення API"
              >
                Save changes
              </button>
            </div>
          </div>
        </article>
      </section>

      <aside className={styles.dailyPreviewColumn}>
        <div className={styles.dailyPreviewSticky}>
          <div className={styles.dailyPreviewHeading}>
            <span>Player preview</span>
            <small>VIP 0</small>
          </div>

          <article className={styles.dailyPreviewCard}>
            <div className={styles.dailyPreviewImage}>
              {selectedDay.imagePreview ? (
                <img
                  src={selectedDay.imagePreview}
                  alt={`Day ${selectedDay.day}`}
                />
              ) : (
                <span>◆</span>
              )}
            </div>

            <div className={styles.dailyPreviewContent}>
              <small>DAILY REWARD</small>

              <h3>Day {selectedDay.day}</h3>

              <div className={styles.dailyPreviewRewards}>
                <div>
                  <span>Coins</span>
                  <strong>
                    +
                    {selectedDay.coins.toLocaleString(
                      "uk-UA",
                    )}
                  </strong>
                </div>

                {selectedDay.energy > 0 && (
                  <div>
                    <span>Energy</span>
                    <strong>
                      +{selectedDay.energy}
                    </strong>
                  </div>
                )}

                {selectedDay.vipPoints > 0 && (
                  <div>
                    <span>VIP Points</span>
                    <strong>
                      +{selectedDay.vipPoints}
                    </strong>
                  </div>
                )}

                {selectedDay.itemName && (
                  <div>
                    <span>Item</span>
                    <strong>
                      {selectedDay.itemName}
                    </strong>
                  </div>
                )}
              </div>

              <button type="button">Claim Reward</button>
            </div>
          </article>

          <div className={styles.dailyPreviewInfo}>
            <div>
              <span>Cycle length</span>
              <strong>{days.length} days</strong>
            </div>

            <div>
              <span>Reset time</span>
              <strong>
                {settings.resetTime} {settings.timezone}
              </strong>
            </div>

            <div>
              <span>Missed day</span>
              <strong>
                {settings.missedDayBehavior}
              </strong>
            </div>

            <div>
              <span>After final day</span>
              <strong>
                {settings.finalDayBehavior}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}