"use client";

import { useState } from "react";

import type {
  GameStatus,
  GeneralSettings,
} from "./settingsTypes";

import styles from "../../AdminPanel.module.css";

const initialSettings: GeneralSettings = {
  gameName: "Slot Club",
  description: "Telegram Mini App casino clicker game",
  gameStatus: "online",
  maintenanceMessage:
    "Slot Club is temporarily unavailable due to maintenance.",

  telegramBotUsername: "@slot1club_bot",
  miniAppUrl: "https://slot-club-miniapp.vercel.app",

  timezone: "Europe/Kyiv",
  defaultLanguage: "uk",
  currencyName: "Coins",
  currencySymbol: "COINS",
};

export function GeneralSettingsView() {
  const [settings, setSettings] =
    useState<GeneralSettings>(initialSettings);

  function updateSetting<
    Key extends keyof GeneralSettings,
  >(
    key: Key,
    value: GeneralSettings[Key],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <section className={styles.settingsView}>
      <article className={styles.settingsCard}>
        <header className={styles.settingsCardHeader}>
          <div>
            <h2>General Settings</h2>

            <p>
              Основні параметри Slot Club Telegram Mini App
            </p>
          </div>

          <button type="button" disabled>
            Save changes
          </button>
        </header>

        <div className={styles.settingsFormContent}>
          <div className={styles.settingsSectionTitle}>
            <span>1</span>

            <div>
              <h3>Game identity</h3>
              <p>Назва та опис застосунку</p>
            </div>
          </div>

          <div className={styles.settingsFieldsGrid}>
            <label>
              <span>Game name</span>

              <input
                type="text"
                value={settings.gameName}
                onChange={(event) =>
                  updateSetting(
                    "gameName",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className={styles.settingsFieldFull}>
              <span>Description</span>

              <textarea
                value={settings.description}
                onChange={(event) =>
                  updateSetting(
                    "description",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className={styles.settingsFormContent}>
          <div className={styles.settingsSectionTitle}>
            <span>2</span>

            <div>
              <h3>Game availability</h3>
              <p>Статус доступності гри</p>
            </div>
          </div>

          <div className={styles.gameStatusGrid}>
            {[
              {
                value: "online",
                title: "Online",
                description: "Гра доступна всім користувачам",
              },
              {
                value: "maintenance",
                title: "Maintenance",
                description:
                  "Показувати повідомлення про технічні роботи",
              },
              {
                value: "closed",
                title: "Closed",
                description:
                  "Повністю закрити доступ до Mini App",
              },
            ].map((status) => (
              <button
                key={status.value}
                type="button"
                className={
                  settings.gameStatus === status.value
                    ? styles.gameStatusButtonActive
                    : styles.gameStatusButton
                }
                onClick={() =>
                  updateSetting(
                    "gameStatus",
                    status.value as GameStatus,
                  )
                }
              >
                <i />

                <div>
                  <strong>{status.title}</strong>
                  <small>{status.description}</small>
                </div>
              </button>
            ))}
          </div>

          {settings.gameStatus !== "online" && (
            <div className={styles.settingsFieldsGrid}>
              <label className={styles.settingsFieldFull}>
                <span>Maintenance message</span>

                <textarea
                  value={settings.maintenanceMessage}
                  onChange={(event) =>
                    updateSetting(
                      "maintenanceMessage",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          )}
        </div>

        <div className={styles.settingsFormContent}>
          <div className={styles.settingsSectionTitle}>
            <span>3</span>

            <div>
              <h3>Telegram integration</h3>
              <p>Посилання та Telegram Bot</p>
            </div>
          </div>

          <div className={styles.settingsFieldsGrid}>
            <label>
              <span>Telegram Bot username</span>

              <input
                type="text"
                value={settings.telegramBotUsername}
                onChange={(event) =>
                  updateSetting(
                    "telegramBotUsername",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>Mini App URL</span>

              <input
                type="url"
                value={settings.miniAppUrl}
                onChange={(event) =>
                  updateSetting(
                    "miniAppUrl",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>

        <div className={styles.settingsFormContent}>
          <div className={styles.settingsSectionTitle}>
            <span>4</span>

            <div>
              <h3>Localization</h3>
              <p>Часова зона, мова та валюта</p>
            </div>
          </div>

          <div className={styles.settingsFieldsGrid}>
            <label>
              <span>Timezone</span>

              <select
                value={settings.timezone}
                onChange={(event) =>
                  updateSetting(
                    "timezone",
                    event.target.value,
                  )
                }
              >
                <option value="Europe/Kyiv">
                  Europe/Kyiv
                </option>

                <option value="UTC">UTC</option>

                <option value="Europe/Warsaw">
                  Europe/Warsaw
                </option>
              </select>
            </label>

            <label>
              <span>Default language</span>

              <select
                value={settings.defaultLanguage}
                onChange={(event) =>
                  updateSetting(
                    "defaultLanguage",
                    event.target.value,
                  )
                }
              >
                <option value="uk">Українська</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </label>

            <label>
              <span>Currency name</span>

              <input
                type="text"
                value={settings.currencyName}
                onChange={(event) =>
                  updateSetting(
                    "currencyName",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>Currency symbol</span>

              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(event) =>
                  updateSetting(
                    "currencySymbol",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>

        <footer className={styles.settingsFooter}>
          <span>
            Зараз зміни зберігаються тільки в стані сторінки.
          </span>

          <button type="button" disabled>
            Save general settings
          </button>
        </footer>
      </article>
    </section>
  );
}