"use client";

import { useState } from "react";

import type { NotificationSettings } from "./settingsTypes";

import styles from "../../AdminPanel.module.css";

const initialSettings: NotificationSettings = {
  newTaskEnabled: true,
  newTaskMessage:
    "New task is available in Slot Club. Complete it and collect your reward!",

  dailyRewardEnabled: true,
  dailyRewardMessage:
    "Your daily reward is ready. Open Slot Club and claim it!",

  vipLevelUpEnabled: true,
  vipLevelUpMessage:
    "Congratulations! Your VIP level has increased.",

  referralRewardEnabled: true,
  referralRewardMessage:
    "You received a reward for inviting a new player.",

  newShopItemEnabled: false,
  newShopItemMessage:
    "A new item is now available in the Slot Club shop.",
};

export function NotificationSettingsView() {
  const [settings, setSettings] =
    useState<NotificationSettings>(initialSettings);

  function updateSetting<
    Key extends keyof NotificationSettings,
  >(
    key: Key,
    value: NotificationSettings[Key],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const notifications = [
    {
      title: "New Task",
      description:
        "Повідомлення про нове доступне завдання",
      enabledKey:
        "newTaskEnabled" as keyof NotificationSettings,
      messageKey:
        "newTaskMessage" as keyof NotificationSettings,
    },
    {
      title: "Daily Reward Reminder",
      description:
        "Нагадування про доступну щоденну нагороду",
      enabledKey:
        "dailyRewardEnabled" as keyof NotificationSettings,
      messageKey:
        "dailyRewardMessage" as keyof NotificationSettings,
    },
    {
      title: "VIP Level Up",
      description:
        "Повідомлення про підвищення VIP-рівня",
      enabledKey:
        "vipLevelUpEnabled" as keyof NotificationSettings,
      messageKey:
        "vipLevelUpMessage" as keyof NotificationSettings,
    },
    {
      title: "Referral Reward",
      description:
        "Повідомлення про реферальну нагороду",
      enabledKey:
        "referralRewardEnabled" as keyof NotificationSettings,
      messageKey:
        "referralRewardMessage" as keyof NotificationSettings,
    },
    {
      title: "New Shop Item",
      description:
        "Повідомлення про новий товар у магазині",
      enabledKey:
        "newShopItemEnabled" as keyof NotificationSettings,
      messageKey:
        "newShopItemMessage" as keyof NotificationSettings,
    },
  ];

  return (
    <section className={styles.settingsView}>
      <article className={styles.settingsCard}>
        <header className={styles.settingsCardHeader}>
          <div>
            <h2>Telegram Notifications</h2>

            <p>
              Автоматичні повідомлення користувачам через бота
            </p>
          </div>

          <button type="button" disabled>
            Save notifications
          </button>
        </header>

        <div className={styles.notificationSettingsList}>
          {notifications.map((notification) => {
            const enabled = Boolean(
              settings[notification.enabledKey],
            );

            const message = String(
              settings[notification.messageKey],
            );

            return (
              <article key={notification.title}>
                <header>
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.description}</p>
                  </div>

                  <label className={styles.settingsToggle}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(event) =>
                        updateSetting(
                          notification.enabledKey,
                          event.target.checked as never,
                        )
                      }
                    />

                    <span />

                    <b>{enabled ? "Enabled" : "Disabled"}</b>
                  </label>
                </header>

                <label>
                  <span>Message text</span>

                  <textarea
                    value={message}
                    disabled={!enabled}
                    onChange={(event) =>
                      updateSetting(
                        notification.messageKey,
                        event.target.value as never,
                      )
                    }
                  />
                </label>

                <footer>
                  <button type="button" disabled>
                    Send test
                  </button>

                  <small>
                    Telegram Bot API буде підключено пізніше
                  </small>
                </footer>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}