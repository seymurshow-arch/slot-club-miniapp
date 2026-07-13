"use client";

import {
  type ChangeEvent,
  useEffect,
  useState,
} from "react";

import type {
  TaskAudience,
  TaskFormState,
  TaskRepeatMode,
  TaskType,
  TaskVerification,
} from "./taskTypes";

import styles from "../../AdminPanel.module.css";

const initialForm: TaskFormState = {
  title: "",
  description: "",
  instructions: "",
  reward: "",

  type: "telegram-channel",
  verification: "telegram-api",
  audience: "all",
  repeatMode: "once",

  actionUrl: "",
  telegramChannelUsername: "",
  telegramChatId: "",

  targetValue: "",
  minimumVipLevel: "",
  selectedPlayerIds: "",

  startDate: "",
  endDate: "",

  imagePreview: null,
};

const taskTypeLabels: Record<TaskType, string> = {
  "telegram-channel": "Telegram Channel",
  "open-link": "Open Link",
  "daily-login": "Daily Login",
  "tap-count": "Reach Tap Count",
  referrals: "Invite Referrals",
  "vip-level": "Reach VIP Level",
  manual: "Manual Verification",
  custom: "Custom Task",
};

const verificationLabels: Record<TaskVerification, string> = {
  "telegram-api": "Telegram API",
  "game-logic": "Game Logic",
  "manual-review": "Manual Review",
  "auto-complete": "Auto Complete",
  "no-verification": "No Verification",
};

type CreateTaskViewProps = {
  onBackToTasks: () => void;
};

export function CreateTaskView({
  onBackToTasks,
}: CreateTaskViewProps) {
  const [form, setForm] = useState<TaskFormState>(initialForm);

  useEffect(() => {
    return () => {
      if (form.imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(form.imagePreview);
      }
    };
  }, [form.imagePreview]);

  function updateField<Key extends keyof TaskFormState>(
    key: Key,
    value: TaskFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (form.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

    updateField("imagePreview", URL.createObjectURL(file));
  }

  function resetForm() {
    if (form.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

    setForm(initialForm);
  }

  function handleTaskTypeChange(type: TaskType) {
    let verification: TaskVerification = "no-verification";

    if (type === "telegram-channel") {
      verification = "telegram-api";
    }

    if (
      type === "daily-login" ||
      type === "tap-count" ||
      type === "referrals" ||
      type === "vip-level"
    ) {
      verification = "game-logic";
    }

    if (type === "manual") {
      verification = "manual-review";
    }

    if (type === "open-link") {
      verification = "auto-complete";
    }

    if (type === "custom") {
      verification = "no-verification";
    }

    setForm((current) => ({
      ...current,
      type,
      verification,
    }));
  }

  const taskType = form.type;
  const isTelegramTask = taskType === "telegram-channel";
  const isCustomTask = taskType === "custom";

  const needsActionUrl =
    taskType === "open-link" || isTelegramTask;

  const needsTargetValue =
    taskType === "tap-count" ||
    taskType === "referrals" ||
    taskType === "vip-level";

  return (
    <div className={styles.createTaskLayout}>
      <section className={styles.taskBuilder}>
        <div className={styles.taskBuilderHeader}>
          <div>
            <h2>Create New Task</h2>
            <p>
              Налаштуйте вигляд, умови, аудиторію та перевірку
              завдання
            </p>
          </div>

          <button
            type="button"
            className={styles.taskResetButton}
            onClick={resetForm}
          >
            Reset form
          </button>
        </div>

        <section className={styles.taskFormSection}>
          <div className={styles.taskFormSectionHeading}>
            <span>1</span>

            <div>
              <h3>Task appearance</h3>
              <p>Інформація, яку побачить гравець</p>
            </div>
          </div>

          <div className={styles.taskImageField}>
            <div className={styles.taskImageUpload}>
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Task preview"
                />
              ) : (
                <span>◇</span>
              )}
            </div>

            <div className={styles.taskImageControls}>
              <strong>Task image</strong>

              <p>
                Рекомендований квадратний PNG або JPG. Зображення
                буде показане у списку завдань.
              </p>

              <label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />

                <span>Choose image</span>
              </label>

              {form.imagePreview && (
                <button
                  type="button"
                  onClick={() =>
                    updateField("imagePreview", null)
                  }
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className={styles.taskFieldsGrid}>
            <label className={styles.taskFieldFull}>
              <span>Task title</span>

              <input
                type="text"
                value={form.title}
                maxLength={80}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="Наприклад: Join our Telegram channel"
              />

              <small>{form.title.length}/80</small>
            </label>

            <label className={styles.taskFieldFull}>
              <span>Description</span>

              <textarea
                value={form.description}
                maxLength={240}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                placeholder="Коротко опишіть завдання..."
              />

              <small>{form.description.length}/240</small>
            </label>

            <label>
              <span>Reward amount</span>

              <div className={styles.taskInputWithSuffix}>
                <input
                  type="number"
                  min="0"
                  value={form.reward}
                  onChange={(event) =>
                    updateField("reward", event.target.value)
                  }
                  placeholder="1000"
                />

                <b>COINS</b>
              </div>
            </label>

            <label>
              <span>Repeat mode</span>

              <select
                value={form.repeatMode}
                onChange={(event) =>
                  updateField(
                    "repeatMode",
                    event.target.value as TaskRepeatMode,
                  )
                }
              >
                <option value="once">One time</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
              </select>
            </label>
          </div>
        </section>

        <section className={styles.taskFormSection}>
          <div className={styles.taskFormSectionHeading}>
            <span>2</span>

            <div>
              <h3>Task action and verification</h3>
              <p>
                Що виконує користувач і як система це перевіряє
              </p>
            </div>
          </div>

          <div className={styles.taskTypeGrid}>
            {(
              Object.entries(taskTypeLabels) as Array<
                [TaskType, string]
              >
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  form.type === value
                    ? styles.taskTypeButtonActive
                    : styles.taskTypeButton
                }
                onClick={() => handleTaskTypeChange(value)}
              >
                <span>
                  {value === "telegram-channel"
                    ? "✈"
                    : value === "open-link"
                      ? "↗"
                      : value === "daily-login"
                        ? "◆"
                        : value === "tap-count"
                          ? "♣"
                          : value === "referrals"
                            ? "♟"
                            : value === "vip-level"
                              ? "♛"
                              : value === "manual"
                                ? "◎"
                                : "✎"}
                </span>

                <strong>{label}</strong>
              </button>
            ))}
          </div>

          {isCustomTask && (
            <div className={styles.taskFieldsGrid}>
              <label className={styles.taskFieldFull}>
                <span>Instructions for player</span>

                <textarea
                  value={form.instructions}
                  maxLength={600}
                  onChange={(event) =>
                    updateField(
                      "instructions",
                      event.target.value,
                    )
                  }
                  placeholder="Наприклад: Залиш коментар під відео, після цього повернись у гру та натисни кнопку «Я виконав»."
                />

                <small>{form.instructions.length}/600</small>
              </label>
            </div>
          )}

          <div className={styles.taskFieldsGrid}>
            <label className={styles.taskFieldFull}>
              <span>Verification method</span>

              <select
                value={form.verification}
                onChange={(event) =>
                  updateField(
                    "verification",
                    event.target.value as TaskVerification,
                  )
                }
              >
                <option value="telegram-api">
                  Telegram API
                </option>

                <option value="game-logic">
                  Game Logic
                </option>

                <option value="manual-review">
                  Manual Review
                </option>

                <option value="auto-complete">
                  Auto Complete
                </option>

                <option value="no-verification">
                  No Verification
                </option>
              </select>
            </label>
          </div>

          {form.verification === "telegram-api" && (
            <div className={styles.telegramTaskSettings}>
              <div className={styles.telegramSettingsHeader}>
                <span>✈</span>

                <div>
                  <strong>Telegram membership verification</strong>

                  <p>
                    Дані каналу, які сервер використає для
                    автоматичної перевірки підписки.
                  </p>
                </div>
              </div>

              <div className={styles.taskFieldsGrid}>
                <label>
                  <span>Channel username</span>

                  <input
                    type="text"
                    value={form.telegramChannelUsername}
                    onChange={(event) =>
                      updateField(
                        "telegramChannelUsername",
                        event.target.value,
                      )
                    }
                    placeholder="@slotclub"
                  />
                </label>

                <label>
                  <span>Telegram Chat ID</span>

                  <input
                    type="text"
                    value={form.telegramChatId}
                    onChange={(event) =>
                      updateField(
                        "telegramChatId",
                        event.target.value,
                      )
                    }
                    placeholder="-1001234567890"
                  />
                </label>

                <label className={styles.taskFieldFull}>
                  <span>Channel or invite link</span>

                  <input
                    type="url"
                    value={form.actionUrl}
                    onChange={(event) =>
                      updateField(
                        "actionUrl",
                        event.target.value,
                      )
                    }
                    placeholder="https://t.me/slotclub"
                  />
                </label>
              </div>
            </div>
          )}

          {needsActionUrl &&
            form.verification !== "telegram-api" && (
              <div className={styles.taskFieldsGrid}>
                <label className={styles.taskFieldFull}>
                  <span>Action URL</span>

                  <input
                    type="url"
                    value={form.actionUrl}
                    onChange={(event) =>
                      updateField(
                        "actionUrl",
                        event.target.value,
                      )
                    }
                    placeholder="https://example.com"
                  />
                </label>
              </div>
            )}

          {needsTargetValue && (
            <div className={styles.taskFieldsGrid}>
              <label>
                <span>
                  {taskType === "tap-count"
                    ? "Required taps"
                    : taskType === "referrals"
                      ? "Required referrals"
                      : "Required VIP level"}
                </span>

                <input
                  type="number"
                  min="1"
                  value={form.targetValue}
                  onChange={(event) =>
                    updateField(
                      "targetValue",
                      event.target.value,
                    )
                  }
                  placeholder="1"
                />
              </label>
            </div>
          )}

          {form.verification === "manual-review" && (
            <div className={styles.taskInformationNotice}>
              <span>!</span>

              <p>
                Гравець подасть завдання на перевірку. Нагорода
                буде видана тільки після підтвердження
                адміністратором.
              </p>
            </div>
          )}

          {form.verification === "auto-complete" && (
            <div className={styles.taskInformationNotice}>
              <span>!</span>

              <p>
                Завдання буде автоматично завершене після виконання
                дії, наприклад після відкриття посилання.
              </p>
            </div>
          )}

          {form.verification === "no-verification" && (
            <div className={styles.taskInformationNotice}>
              <span>!</span>

              <p>
                Гравець сам натисне кнопку «Я виконав» і одразу
                отримає нагороду. Система не перевірятиме дію.
              </p>
            </div>
          )}

          {form.verification === "game-logic" && (
            <div className={styles.taskInformationNotice}>
              <span>!</span>

              <p>
                Виконання буде перевірятися за даними гри:
                кількістю тапів, VIP-рівнем, рефералами або іншими
                показниками.
              </p>
            </div>
          )}
        </section>

        <section className={styles.taskFormSection}>
          <div className={styles.taskFormSectionHeading}>
            <span>3</span>

            <div>
              <h3>Audience targeting</h3>
              <p>Оберіть, кому буде доступне завдання</p>
            </div>
          </div>

          <div className={styles.taskAudienceGrid}>
            {[
              {
                value: "all",
                title: "All players",
                description: "Усі зареєстровані користувачі",
              },
              {
                value: "vip",
                title: "VIP players",
                description: "Гравці від обраного VIP-рівня",
              },
              {
                value: "selected",
                title: "Selected players",
                description: "Конкретні Telegram ID",
              },
              {
                value: "registered-after",
                title: "New players",
                description: "Зареєстровані після дати",
              },
              {
                value: "active-players",
                title: "Active players",
                description: "Активні за останній період",
              },
            ].map((audience) => (
              <button
                key={audience.value}
                type="button"
                className={
                  form.audience === audience.value
                    ? styles.taskAudienceButtonActive
                    : styles.taskAudienceButton
                }
                onClick={() =>
                  updateField(
                    "audience",
                    audience.value as TaskAudience,
                  )
                }
              >
                <span />

                <div>
                  <strong>{audience.title}</strong>
                  <small>{audience.description}</small>
                </div>
              </button>
            ))}
          </div>

          {form.audience === "vip" && (
            <div className={styles.taskFieldsGrid}>
              <label>
                <span>Minimum VIP level</span>

                <input
                  type="number"
                  min="1"
                  value={form.minimumVipLevel}
                  onChange={(event) =>
                    updateField(
                      "minimumVipLevel",
                      event.target.value,
                    )
                  }
                  placeholder="1"
                />
              </label>
            </div>
          )}

          {form.audience === "selected" && (
            <div className={styles.taskFieldsGrid}>
              <label className={styles.taskFieldFull}>
                <span>Telegram IDs</span>

                <textarea
                  value={form.selectedPlayerIds}
                  onChange={(event) =>
                    updateField(
                      "selectedPlayerIds",
                      event.target.value,
                    )
                  }
                  placeholder="123456789, 987654321..."
                />

                <small>
                  Вводь Telegram ID через кому або з нового рядка
                </small>
              </label>
            </div>
          )}

          {form.audience === "registered-after" && (
            <div className={styles.taskFieldsGrid}>
              <label>
                <span>Registered after</span>

                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField(
                      "startDate",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          )}

          {form.audience === "active-players" && (
            <div className={styles.taskFieldsGrid}>
              <label>
                <span>Active during last days</span>

                <input
                  type="number"
                  min="1"
                  value={form.targetValue}
                  onChange={(event) =>
                    updateField(
                      "targetValue",
                      event.target.value,
                    )
                  }
                  placeholder="7"
                />
              </label>
            </div>
          )}
        </section>

        <section className={styles.taskFormSection}>
          <div className={styles.taskFormSectionHeading}>
            <span>4</span>

            <div>
              <h3>Schedule</h3>
              <p>
                Період, протягом якого завдання буде доступним
              </p>
            </div>
          </div>

          <div className={styles.taskFieldsGrid}>
            <label>
              <span>Start date</span>

              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
              />
            </label>

            <label>
              <span>End date</span>

              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(event) =>
                  updateField("endDate", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        <footer className={styles.taskBuilderFooter}>
          <button
            type="button"
            className={styles.taskCancelButton}
            onClick={onBackToTasks}
          >
            Cancel
          </button>

          <div>
            <button
              type="button"
              className={styles.taskDraftButton}
              disabled
            >
              Save draft
            </button>

            <button
              type="button"
              className={styles.taskPublishButton}
              disabled
            >
              Publish task
            </button>
          </div>
        </footer>
      </section>

      <aside className={styles.taskPreviewColumn}>
        <div className={styles.taskPreviewSticky}>
          <div className={styles.taskPreviewHeading}>
            <span>Live preview</span>
            <small>Player view</small>
          </div>

          <article className={styles.taskPreviewCard}>
            <div className={styles.taskPreviewImage}>
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Task preview"
                />
              ) : (
                <span>✓</span>
              )}
            </div>

            <div className={styles.taskPreviewContent}>
              <div className={styles.taskPreviewType}>
                {taskTypeLabels[form.type]}
              </div>

              <h3>{form.title || "Task title"}</h3>

              <p>
                {form.instructions ||
                  form.description ||
                  "Task description will appear here."}
              </p>

              <div className={styles.taskPreviewReward}>
                <span>Reward</span>

                <strong>
                  +{form.reward || "0"} COINS
                </strong>
              </div>

              <button type="button">
                {form.verification === "no-verification"
                  ? "I completed"
                  : form.verification === "manual-review"
                    ? "Submit for review"
                    : form.type === "telegram-channel"
                      ? "Open channel"
                      : form.type === "open-link"
                        ? "Open link"
                        : "Start task"}
              </button>
            </div>
          </article>

          <div className={styles.taskPreviewSummary}>
            <div>
              <span>Audience</span>
              <strong>
                {form.audience === "all"
                  ? "All players"
                  : form.audience === "vip"
                    ? "VIP players"
                    : form.audience === "selected"
                      ? "Selected players"
                      : form.audience === "registered-after"
                        ? "New players"
                        : "Active players"}
              </strong>
            </div>

            <div>
              <span>Repeat</span>
              <strong>{form.repeatMode}</strong>
            </div>

            <div>
              <span>Verification</span>
              <strong>
                {verificationLabels[form.verification]}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}