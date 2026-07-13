"use client";

import { useState } from "react";

import type { SecuritySettings } from "./settingsTypes";

import styles from "../../AdminPanel.module.css";

const initialSettings: SecuritySettings = {
  sessionDurationHours: 24,
  automaticLogoutEnabled: true,
  confirmDangerousActions: true,
  doubleConfirmDeletion: true,

  maximumBalanceChange: 1_000_000,
  maximumEnergyChange: 100_000,
  maximumVipPointsChange: 100_000,
};

export function SecuritySettingsView() {
  const [settings, setSettings] =
    useState<SecuritySettings>(initialSettings);

  function updateSetting<
    Key extends keyof SecuritySettings,
  >(
    key: Key,
    value: SecuritySettings[Key],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <section className={styles.settingsView}>
      <div className={styles.securitySettingsGrid}>
        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Administrator Password</h2>

              <p>Зміна пароля доступу до адмін-панелі</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label className={styles.settingsFieldFull}>
                <span>Current password</span>

                <input
                  type="password"
                  placeholder="Current password"
                  disabled
                />
              </label>

              <label>
                <span>New password</span>

                <input
                  type="password"
                  placeholder="New password"
                  disabled
                />
              </label>

              <label>
                <span>Confirm password</span>

                <input
                  type="password"
                  placeholder="Repeat password"
                  disabled
                />
              </label>
            </div>

            <button
              type="button"
              className={styles.securityPrimaryButton}
              disabled
            >
              Change password
            </button>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Session Security</h2>

              <p>Тривалість та завершення admin session</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Session duration</span>

                <div className={styles.settingsInputSuffix}>
                  <input
                    type="number"
                    min="1"
                    value={settings.sessionDurationHours}
                    onChange={(event) =>
                      updateSetting(
                        "sessionDurationHours",
                        Number(event.target.value) || 1,
                      )
                    }
                  />

                  <b>HOURS</b>
                </div>
              </label>
            </div>

            <label className={styles.settingsSwitchRow}>
              <input
                type="checkbox"
                checked={settings.automaticLogoutEnabled}
                onChange={(event) =>
                  updateSetting(
                    "automaticLogoutEnabled",
                    event.target.checked,
                  )
                }
              />

              <span />

              <div>
                <strong>Automatic logout</strong>
                <small>
                  Завершувати сесію після завершення терміну
                </small>
              </div>
            </label>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Dangerous Actions</h2>

              <p>Захист важливих адміністративних операцій</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <label className={styles.settingsSwitchRow}>
              <input
                type="checkbox"
                checked={settings.confirmDangerousActions}
                onChange={(event) =>
                  updateSetting(
                    "confirmDangerousActions",
                    event.target.checked,
                  )
                }
              />

              <span />

              <div>
                <strong>Confirmation dialogs</strong>
                <small>
                  Підтверджувати блокування, зміну економіки
                  та масові операції
                </small>
              </div>
            </label>

            <label className={styles.settingsSwitchRow}>
              <input
                type="checkbox"
                checked={settings.doubleConfirmDeletion}
                onChange={(event) =>
                  updateSetting(
                    "doubleConfirmDeletion",
                    event.target.checked,
                  )
                }
              />

              <span />

              <div>
                <strong>Double confirmation</strong>
                <small>
                  Подвійне підтвердження видалення даних
                </small>
              </div>
            </label>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Manual Change Limits</h2>

              <p>
                Максимальні зміни за одну адміністративну
                операцію
              </p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Maximum balance change</span>

                <input
                  type="number"
                  min="0"
                  value={settings.maximumBalanceChange}
                  onChange={(event) =>
                    updateSetting(
                      "maximumBalanceChange",
                      Number(event.target.value) || 0,
                    )
                  }
                />
              </label>

              <label>
                <span>Maximum energy change</span>

                <input
                  type="number"
                  min="0"
                  value={settings.maximumEnergyChange}
                  onChange={(event) =>
                    updateSetting(
                      "maximumEnergyChange",
                      Number(event.target.value) || 0,
                    )
                  }
                />
              </label>

              <label>
                <span>Maximum VIP points change</span>

                <input
                  type="number"
                  min="0"
                  value={
                    settings.maximumVipPointsChange
                  }
                  onChange={(event) =>
                    updateSetting(
                      "maximumVipPointsChange",
                      Number(event.target.value) || 0,
                    )
                  }
                />
              </label>
            </div>
          </div>
        </article>
      </div>

      <article className={styles.activeSessionsCard}>
        <header>
          <div>
            <h2>Active Admin Sessions</h2>
            <p>Список активних сесій адміністратора</p>
          </div>

          <button type="button" disabled>
            End all other sessions
          </button>
        </header>

        <div className={styles.activeSessionsHeader}>
          <span>Device</span>
          <span>IP address</span>
          <span>Started</span>
          <span>Last activity</span>
          <span>Status</span>
          <span />
        </div>

        <div className={styles.activeSessionsEmpty}>
          <span>◎</span>
          <strong>Session tracking is not connected</strong>
          <p>
            Після підключення журналу сесій тут можна буде
            переглядати й завершувати активні входи.
          </p>
        </div>
      </article>
    </section>
  );
}