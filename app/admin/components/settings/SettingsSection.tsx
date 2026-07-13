"use client";

import { useState } from "react";

import { EconomySettingsView } from "./EconomySettingsView";
import { GeneralSettingsView } from "./GeneralSettingsView";
import { NotificationSettingsView } from "./NotificationSettingsView";
import { SecuritySettingsView } from "./SecuritySettingsView";
import { SystemSettingsView } from "./SystemSettingsView";

import type { SettingsView } from "./settingsTypes";

import styles from "../../AdminPanel.module.css";

export function SettingsSection() {
  const [activeView, setActiveView] =
    useState<SettingsView>("general");

  return (
    <section className={styles.settingsSection}>
      <header className={styles.settingsSectionHeader}>
        <div>
          <h2>Settings</h2>

          <p>
            Глобальні налаштування гри, економіки та
            адміністративної системи
          </p>
        </div>

        <div className={styles.settingsTabs}>
          <button
            type="button"
            className={
              activeView === "general"
                ? styles.settingsTabActive
                : styles.settingsTab
            }
            onClick={() => setActiveView("general")}
          >
            <span>◇</span>
            General
          </button>

          <button
            type="button"
            className={
              activeView === "economy"
                ? styles.settingsTabActive
                : styles.settingsTab
            }
            onClick={() => setActiveView("economy")}
          >
            <span>◉</span>
            Economy
          </button>

          <button
            type="button"
            className={
              activeView === "notifications"
                ? styles.settingsTabActive
                : styles.settingsTab
            }
            onClick={() =>
              setActiveView("notifications")
            }
          >
            <span>◆</span>
            Notifications
          </button>

          <button
            type="button"
            className={
              activeView === "security"
                ? styles.settingsTabActive
                : styles.settingsTab
            }
            onClick={() => setActiveView("security")}
          >
            <span>◎</span>
            Security
          </button>

          <button
            type="button"
            className={
              activeView === "system"
                ? styles.settingsTabActive
                : styles.settingsTab
            }
            onClick={() => setActiveView("system")}
          >
            <span>⚙</span>
            System
          </button>
        </div>
      </header>

      {activeView === "general" && (
        <GeneralSettingsView />
      )}

      {activeView === "economy" && (
        <EconomySettingsView />
      )}

      {activeView === "notifications" && (
        <NotificationSettingsView />
      )}

      {activeView === "security" && (
        <SecuritySettingsView />
      )}

      {activeView === "system" && (
        <SystemSettingsView />
      )}
    </section>
  );
}