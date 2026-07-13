"use client";

import { useState } from "react";

import type { EconomySettings } from "./settingsTypes";

import styles from "../../AdminPanel.module.css";

const initialSettings: EconomySettings = {
  initialBalance: 10_000,
  initialEnergy: 3_000,
  initialMaxEnergy: 3_000,

  baseTapReward: 1,
  energyCostPerTap: 1,

  energyRestoreAmount: 2,
  energyRestoreIntervalSeconds: 60,

  maximumTapsPerSecond: 10,
  maximumBalance: 1_000_000_000_000,

  tapPowerBasePrice: 1_000,
  tapPowerGrowthRate: 1.35,

  maxEnergyBasePrice: 2_000,
  maxEnergyGrowthRate: 1.4,

  energyRecoveryBasePrice: 5_000,
  energyRecoveryGrowthRate: 1.55,

  manualRewardLimit: 1_000_000,
};

export function EconomySettingsView() {
  const [settings, setSettings] =
    useState<EconomySettings>(initialSettings);

  function updateNumber(
    key: keyof EconomySettings,
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  }

  return (
    <section className={styles.settingsView}>
      <div className={styles.economySettingsHeader}>
        <div>
          <h2>Economy Configuration</h2>

          <p>
            Глобальні параметри економіки, які пізніше
            використовуватиме гра
          </p>
        </div>

        <div>
          <button type="button" disabled>
            View change history
          </button>

          <button type="button" disabled>
            Save economy
          </button>
        </div>
      </div>

      <div className={styles.economySettingsGrid}>
        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>New Player Defaults</h2>
              <p>Початкові значення нового акаунта</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Initial balance</span>

                <input
                  type="number"
                  min="0"
                  value={settings.initialBalance}
                  onChange={(event) =>
                    updateNumber(
                      "initialBalance",
                      event.target.value,
                    )
                  }
                />

                <small>
                  Застосовується тільки до нових гравців
                </small>
              </label>

              <label>
                <span>Initial energy</span>

                <input
                  type="number"
                  min="0"
                  value={settings.initialEnergy}
                  onChange={(event) =>
                    updateNumber(
                      "initialEnergy",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Initial maximum energy</span>

                <input
                  type="number"
                  min="1"
                  value={settings.initialMaxEnergy}
                  onChange={(event) =>
                    updateNumber(
                      "initialMaxEnergy",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Tap Economy</h2>
              <p>Нагорода та витрата енергії</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Base reward per tap</span>

                <input
                  type="number"
                  min="0"
                  value={settings.baseTapReward}
                  onChange={(event) =>
                    updateNumber(
                      "baseTapReward",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Energy cost per tap</span>

                <input
                  type="number"
                  min="0"
                  value={settings.energyCostPerTap}
                  onChange={(event) =>
                    updateNumber(
                      "energyCostPerTap",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Maximum taps per second</span>

                <input
                  type="number"
                  min="1"
                  value={settings.maximumTapsPerSecond}
                  onChange={(event) =>
                    updateNumber(
                      "maximumTapsPerSecond",
                      event.target.value,
                    )
                  }
                />

                <small>Антибот-обмеження</small>
              </label>
            </div>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Energy Recovery</h2>
              <p>Глобальна швидкість відновлення енергії</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Restore amount</span>

                <input
                  type="number"
                  min="0"
                  value={settings.energyRestoreAmount}
                  onChange={(event) =>
                    updateNumber(
                      "energyRestoreAmount",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Restore interval</span>

                <div className={styles.settingsInputSuffix}>
                  <input
                    type="number"
                    min="1"
                    value={
                      settings.energyRestoreIntervalSeconds
                    }
                    onChange={(event) =>
                      updateNumber(
                        "energyRestoreIntervalSeconds",
                        event.target.value,
                      )
                    }
                  />

                  <b>SECONDS</b>
                </div>
              </label>
            </div>

            <div className={styles.economyCalculation}>
              <span>Current recovery rate</span>

              <strong>
                {settings.energyRestoreAmount} energy every{" "}
                {settings.energyRestoreIntervalSeconds} seconds
              </strong>
            </div>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Tap Power Upgrade</h2>
              <p>Формула вартості покращення Tap Power</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Base price</span>

                <input
                  type="number"
                  min="0"
                  value={settings.tapPowerBasePrice}
                  onChange={(event) =>
                    updateNumber(
                      "tapPowerBasePrice",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Growth multiplier</span>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={settings.tapPowerGrowthRate}
                  onChange={(event) =>
                    updateNumber(
                      "tapPowerGrowthRate",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <div className={styles.economyCalculation}>
              <span>Price formula</span>
              <strong>
                base price × growth multiplier ^ current level
              </strong>
            </div>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Maximum Energy Upgrade</h2>
              <p>Формула вартості збільшення енергії</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Base price</span>

                <input
                  type="number"
                  min="0"
                  value={settings.maxEnergyBasePrice}
                  onChange={(event) =>
                    updateNumber(
                      "maxEnergyBasePrice",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Growth multiplier</span>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={settings.maxEnergyGrowthRate}
                  onChange={(event) =>
                    updateNumber(
                      "maxEnergyGrowthRate",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Energy Recovery Upgrade</h2>
              <p>Формула вартості прискорення відновлення</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Base price</span>

                <input
                  type="number"
                  min="0"
                  value={settings.energyRecoveryBasePrice}
                  onChange={(event) =>
                    updateNumber(
                      "energyRecoveryBasePrice",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Growth multiplier</span>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={
                    settings.energyRecoveryGrowthRate
                  }
                  onChange={(event) =>
                    updateNumber(
                      "energyRecoveryGrowthRate",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </div>
        </article>

        <article className={styles.settingsCard}>
          <header className={styles.settingsCardHeader}>
            <div>
              <h2>Safety Limits</h2>
              <p>Глобальні обмеження економіки</p>
            </div>
          </header>

          <div className={styles.settingsFormContent}>
            <div className={styles.settingsFieldsGrid}>
              <label>
                <span>Maximum player balance</span>

                <input
                  type="number"
                  min="0"
                  value={settings.maximumBalance}
                  onChange={(event) =>
                    updateNumber(
                      "maximumBalance",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>Manual reward limit</span>

                <input
                  type="number"
                  min="0"
                  value={settings.manualRewardLimit}
                  onChange={(event) =>
                    updateNumber(
                      "manualRewardLimit",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </div>
        </article>
      </div>

      <div className={styles.economySettingsWarning}>
        <span>!</span>

        <div>
          <strong>
            Зміна економіки впливатиме на реальну гру
          </strong>

          <p>
            Після підключення PostgreSQL кожна зміна буде
            перевірятися сервером і записуватися в журнал.
            Початкові параметри застосовуються лише до нових
            гравців, якщо адміністратор окремо не запустить
            масове оновлення існуючих акаунтів.
          </p>
        </div>
      </div>
    </section>
  );
}