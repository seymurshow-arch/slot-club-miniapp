"use client";

import {
  type ChangeEvent,
  useEffect,
  useState,
} from "react";

import type {
  PopupAudience,
  PopupButtonAction,
  PopupFormState,
  PopupStyle,
  PopupTrigger,
  PopupType,
} from "./popupTypes";

import styles from "../../AdminPanel.module.css";

const initialForm: PopupFormState = {
  internalName: "",
  type: "onboarding",
  style: "standard",

  title: "",
  subtitle: "",
  body: "",

  accentColor: "#78f661",
  imagePreview: null,

  primaryButtonEnabled: true,
  primaryButtonText: "Continue",
  primaryButtonAction: "close",
  primaryButtonTarget: "",

  secondaryButtonEnabled: false,
  secondaryButtonText: "Close",
  secondaryButtonAction: "close",
  secondaryButtonTarget: "",

  audience: "all",
  selectedPlayerIds: "",
  minimumVipLevel: "",
  activeDuringDays: "7",
  relatedAudienceTaskId: "",
  leaderboardMaximumPosition: "",

  trigger: "once-per-player",
  relatedTriggerTaskId: "",

  startDate: "",
  endDate: "",

  priority: "50",
  delaySeconds: "0",
  maximumDisplays: "1",

  allowClose: true,
  closeOnBackdrop: true,
  hideAfterClose: true,
  hideAfterAction: true,
  isActive: true,
};

const popupTypeLabels: Record<PopupType, string> = {
  onboarding: "Onboarding",
  news: "News",
  "task-reward": "Task Reward",
  season: "Season",
  promotion: "Promotion",
  warning: "Warning",
  custom: "Custom",
};

const popupStyleLabels: Record<PopupStyle, string> = {
  standard: "Standard",
  reward: "Reward",
  news: "News",
  season: "Season",
  warning: "Warning",
  premium: "Premium",
};

const triggerLabels: Record<PopupTrigger, string> = {
  "first-login": "First Login",
  "every-login": "Every Login",
  "once-per-player": "Once Per Player",
  "once-per-day": "Once Per Day",
  "task-completion": "After Task Completion",
  "daily-reward": "After Daily Reward",
  purchase: "After Purchase",
  "vip-level-up": "After VIP Level Up",
  "referral-reward": "After Referral Reward",
  "date-range": "During Date Range",
  manual: "Manual Trigger",
};

const buttonActionLabels: Record<
  PopupButtonAction,
  string
> = {
  close: "Close Popup",
  "open-task": "Open Task",
  "open-shop": "Open Shop Item",
  "open-leaderboard": "Open Leaderboard",
  "open-daily": "Open Daily Rewards",
  "open-vip": "Open VIP",
  "open-referral": "Open Referral",
  "telegram-link": "Open Telegram Link",
  "external-url": "Open External URL",
};

type CreatePopupViewProps = {
  onBackToCatalog: () => void;
};

export function CreatePopupView({
  onBackToCatalog,
}: CreatePopupViewProps) {
  const [form, setForm] =
    useState<PopupFormState>(initialForm);

  useEffect(() => {
    return () => {
      if (form.imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(form.imagePreview);
      }
    };
  }, [form.imagePreview]);

  function updateField<
    Key extends keyof PopupFormState,
  >(
    key: Key,
    value: PopupFormState[Key],
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

    updateField(
      "imagePreview",
      URL.createObjectURL(file),
    );
  }

  function resetForm() {
    if (form.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

    setForm(initialForm);
  }

  function handleTypeChange(type: PopupType) {
    let trigger: PopupTrigger = "once-per-player";
    let style: PopupStyle = "standard";

    if (type === "onboarding") {
      trigger = "first-login";
      style = "standard";
    }

    if (type === "news") {
      trigger = "once-per-player";
      style = "news";
    }

    if (type === "task-reward") {
      trigger = "task-completion";
      style = "reward";
    }

    if (type === "season") {
      trigger = "once-per-player";
      style = "season";
    }

    if (type === "promotion") {
      trigger = "once-per-day";
      style = "premium";
    }

    if (type === "warning") {
      trigger = "every-login";
      style = "warning";
    }

    setForm((current) => ({
      ...current,
      type,
      trigger,
      style,
    }));
  }

  function needsButtonTarget(
    action: PopupButtonAction,
  ) {
    return action !== "close";
  }

  return (
    <div className={styles.createPopupLayout}>
      <section className={styles.popupBuilder}>
        <header className={styles.popupBuilderHeader}>
          <div>
            <h2>Create Popup</h2>

            <p>
              Налаштуйте вигляд, аудиторію та умови показу
            </p>
          </div>

          <button type="button" onClick={resetForm}>
            Reset form
          </button>
        </header>

        <section className={styles.popupFormSection}>
          <div className={styles.popupFormHeading}>
            <span>1</span>

            <div>
              <h3>Popup type</h3>
              <p>Призначення та стиль попапа</p>
            </div>
          </div>

          <div className={styles.popupTypeGrid}>
            {(
              Object.entries(popupTypeLabels) as Array<
                [PopupType, string]
              >
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  form.type === value
                    ? styles.popupTypeButtonActive
                    : styles.popupTypeButton
                }
                onClick={() => handleTypeChange(value)}
              >
                <span>
                  {value === "onboarding"
                    ? "◎"
                    : value === "news"
                      ? "◆"
                      : value === "task-reward"
                        ? "✓"
                        : value === "season"
                          ? "♛"
                          : value === "promotion"
                            ? "✦"
                            : value === "warning"
                              ? "!"
                              : "▣"}
                </span>

                <strong>{label}</strong>
              </button>
            ))}
          </div>

          <div className={styles.popupFieldsGrid}>
            <label className={styles.popupFieldFull}>
              <span>Internal name</span>

              <input
                type="text"
                value={form.internalName}
                onChange={(event) =>
                  updateField(
                    "internalName",
                    event.target.value,
                  )
                }
                placeholder="Наприклад: Season 1 welcome popup"
              />

              <small>
                Цю назву бачить тільки адміністратор
              </small>
            </label>

            <label>
              <span>Visual style</span>

              <select
                value={form.style}
                onChange={(event) =>
                  updateField(
                    "style",
                    event.target.value as PopupStyle,
                  )
                }
              >
                {Object.entries(popupStyleLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>Accent color</span>

              <div className={styles.popupColorField}>
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(event) =>
                    updateField(
                      "accentColor",
                      event.target.value,
                    )
                  }
                />

                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(event) =>
                    updateField(
                      "accentColor",
                      event.target.value,
                    )
                  }
                />
              </div>
            </label>
          </div>
        </section>

        <section className={styles.popupFormSection}>
          <div className={styles.popupFormHeading}>
            <span>2</span>

            <div>
              <h3>Popup content</h3>
              <p>Текст і зображення для гравця</p>
            </div>
          </div>

          <div className={styles.popupImageField}>
            <div className={styles.popupImagePreview}>
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Popup preview"
                />
              ) : (
                <span>▣</span>
              )}
            </div>

            <div>
              <strong>Popup image</strong>

              <p>
                PNG, JPG або WEBP. Для мобільного попапа
                краще горизонтальне зображення.
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

          <div className={styles.popupFieldsGrid}>
            <label className={styles.popupFieldFull}>
              <span>Title</span>

              <input
                type="text"
                value={form.title}
                maxLength={80}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="Welcome to Slot Club"
              />

              <small>{form.title.length}/80</small>
            </label>

            <label className={styles.popupFieldFull}>
              <span>Subtitle</span>

              <input
                type="text"
                value={form.subtitle}
                maxLength={120}
                onChange={(event) =>
                  updateField(
                    "subtitle",
                    event.target.value,
                  )
                }
                placeholder="Compete for the season prize"
              />
            </label>

            <label className={styles.popupFieldFull}>
              <span>Main text</span>

              <textarea
                value={form.body}
                maxLength={1000}
                onChange={(event) =>
                  updateField("body", event.target.value)
                }
                placeholder="Поясніть правила, нагороду, сезон або новину..."
              />

              <small>{form.body.length}/1000</small>
            </label>
          </div>
        </section>

        <section className={styles.popupFormSection}>
          <div className={styles.popupFormHeading}>
            <span>3</span>

            <div>
              <h3>Buttons</h3>
              <p>Кнопки та їхні дії</p>
            </div>
          </div>

          <article className={styles.popupButtonEditor}>
            <header>
              <div>
                <strong>Primary button</strong>
                <small>Головна дія попапа</small>
              </div>

              <label className={styles.popupToggle}>
                <input
                  type="checkbox"
                  checked={form.primaryButtonEnabled}
                  onChange={(event) =>
                    updateField(
                      "primaryButtonEnabled",
                      event.target.checked,
                    )
                  }
                />
                <span />
              </label>
            </header>

            {form.primaryButtonEnabled && (
              <div className={styles.popupFieldsGrid}>
                <label>
                  <span>Button text</span>

                  <input
                    type="text"
                    value={form.primaryButtonText}
                    onChange={(event) =>
                      updateField(
                        "primaryButtonText",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Button action</span>

                  <select
                    value={form.primaryButtonAction}
                    onChange={(event) =>
                      updateField(
                        "primaryButtonAction",
                        event.target
                          .value as PopupButtonAction,
                      )
                    }
                  >
                    {Object.entries(
                      buttonActionLabels,
                    ).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                {needsButtonTarget(
                  form.primaryButtonAction,
                ) && (
                  <label className={styles.popupFieldFull}>
                    <span>Action target</span>

                    <input
                      type="text"
                      value={form.primaryButtonTarget}
                      onChange={(event) =>
                        updateField(
                          "primaryButtonTarget",
                          event.target.value,
                        )
                      }
                      placeholder="Task ID, Shop Item ID або URL"
                    />
                  </label>
                )}
              </div>
            )}
          </article>

          <article className={styles.popupButtonEditor}>
            <header>
              <div>
                <strong>Secondary button</strong>
                <small>Додаткова необов’язкова дія</small>
              </div>

              <label className={styles.popupToggle}>
                <input
                  type="checkbox"
                  checked={form.secondaryButtonEnabled}
                  onChange={(event) =>
                    updateField(
                      "secondaryButtonEnabled",
                      event.target.checked,
                    )
                  }
                />
                <span />
              </label>
            </header>

            {form.secondaryButtonEnabled && (
              <div className={styles.popupFieldsGrid}>
                <label>
                  <span>Button text</span>

                  <input
                    type="text"
                    value={form.secondaryButtonText}
                    onChange={(event) =>
                      updateField(
                        "secondaryButtonText",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Button action</span>

                  <select
                    value={form.secondaryButtonAction}
                    onChange={(event) =>
                      updateField(
                        "secondaryButtonAction",
                        event.target
                          .value as PopupButtonAction,
                      )
                    }
                  >
                    {Object.entries(
                      buttonActionLabels,
                    ).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                {needsButtonTarget(
                  form.secondaryButtonAction,
                ) && (
                  <label className={styles.popupFieldFull}>
                    <span>Action target</span>

                    <input
                      type="text"
                      value={form.secondaryButtonTarget}
                      onChange={(event) =>
                        updateField(
                          "secondaryButtonTarget",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                )}
              </div>
            )}
          </article>
        </section>

        <section className={styles.popupFormSection}>
          <div className={styles.popupFormHeading}>
            <span>4</span>

            <div>
              <h3>Audience</h3>
              <p>Кому показувати цей попап</p>
            </div>
          </div>

          <div className={styles.popupAudienceGrid}>
            {[
              ["all", "All players", "Усі гравці"],
              [
                "new-players",
                "New players",
                "Нові користувачі",
              ],
              [
                "selected",
                "Selected players",
                "Конкретні Telegram ID",
              ],
              ["vip", "VIP players", "Від обраного VIP"],
              [
                "active",
                "Active players",
                "Активні за останні дні",
              ],
              [
                "inactive",
                "Inactive players",
                "Давно не заходили",
              ],
              [
                "completed-task",
                "Completed Task",
                "Виконали вибрану Task",
              ],
              [
                "not-completed-task",
                "Did not complete Task",
                "Не виконали вибрану Task",
              ],
              [
                "purchased-item",
                "Purchased Item",
                "Купили певний товар",
              ],
              [
                "leaderboard-position",
                "Leaderboard position",
                "Гравці в заданому Top",
              ],
            ].map(([value, title, description]) => (
              <button
                key={value}
                type="button"
                className={
                  form.audience === value
                    ? styles.popupAudienceButtonActive
                    : styles.popupAudienceButton
                }
                onClick={() =>
                  updateField(
                    "audience",
                    value as PopupAudience,
                  )
                }
              >
                <i />

                <div>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </div>
              </button>
            ))}
          </div>

          {form.audience === "selected" && (
            <div className={styles.popupFieldsGrid}>
              <label className={styles.popupFieldFull}>
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
              </label>
            </div>
          )}

          {form.audience === "vip" && (
            <div className={styles.popupFieldsGrid}>
              <label>
                <span>Minimum VIP level</span>

                <input
                  type="number"
                  min="0"
                  value={form.minimumVipLevel}
                  onChange={(event) =>
                    updateField(
                      "minimumVipLevel",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          )}

          {(form.audience === "active" ||
            form.audience === "inactive") && (
            <div className={styles.popupFieldsGrid}>
              <label>
                <span>Number of days</span>

                <input
                  type="number"
                  min="1"
                  value={form.activeDuringDays}
                  onChange={(event) =>
                    updateField(
                      "activeDuringDays",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          )}

          {(form.audience === "completed-task" ||
            form.audience ===
              "not-completed-task") && (
            <div className={styles.popupFieldsGrid}>
              <label className={styles.popupFieldFull}>
                <span>Related Task</span>

                <select
                  value={form.relatedAudienceTaskId}
                  onChange={(event) =>
                    updateField(
                      "relatedAudienceTaskId",
                      event.target.value,
                    )
                  }
                  disabled
                >
                  <option value="">
                    Tasks will appear after API connection
                  </option>
                </select>
              </label>
            </div>
          )}

          {form.audience ===
            "leaderboard-position" && (
            <div className={styles.popupFieldsGrid}>
              <label>
                <span>Maximum position</span>

                <input
                  type="number"
                  min="1"
                  value={
                    form.leaderboardMaximumPosition
                  }
                  onChange={(event) =>
                    updateField(
                      "leaderboardMaximumPosition",
                      event.target.value,
                    )
                  }
                  placeholder="100"
                />
              </label>
            </div>
          )}
        </section>

        <section className={styles.popupFormSection}>
          <div className={styles.popupFormHeading}>
            <span>5</span>

            <div>
              <h3>Trigger and schedule</h3>
              <p>Коли та як часто показувати</p>
            </div>
          </div>

          <div className={styles.popupFieldsGrid}>
            <label className={styles.popupFieldFull}>
              <span>Display trigger</span>

              <select
                value={form.trigger}
                onChange={(event) =>
                  updateField(
                    "trigger",
                    event.target.value as PopupTrigger,
                  )
                }
              >
                {Object.entries(triggerLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>

            {form.trigger === "task-completion" && (
              <label className={styles.popupFieldFull}>
                <span>Related Task</span>

                <select
                  value={form.relatedTriggerTaskId}
                  onChange={(event) =>
                    updateField(
                      "relatedTriggerTaskId",
                      event.target.value,
                    )
                  }
                  disabled
                >
                  <option value="">
                    Tasks will appear after API connection
                  </option>
                </select>

                <small>
                  Пізніше Task матиме completionPopupId
                </small>
              </label>
            )}

            <label>
              <span>Start date</span>

              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(event) =>
                  updateField(
                    "startDate",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>End date</span>

              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(event) =>
                  updateField(
                    "endDate",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>Priority</span>

              <input
                type="number"
                min="0"
                max="100"
                value={form.priority}
                onChange={(event) =>
                  updateField(
                    "priority",
                    event.target.value,
                  )
                }
              />

              <small>
                100 — найвищий пріоритет
              </small>
            </label>

            <label>
              <span>Delay after trigger</span>

              <div className={styles.popupInputSuffix}>
                <input
                  type="number"
                  min="0"
                  value={form.delaySeconds}
                  onChange={(event) =>
                    updateField(
                      "delaySeconds",
                      event.target.value,
                    )
                  }
                />

                <b>SECONDS</b>
              </div>
            </label>

            <label>
              <span>Maximum displays per player</span>

              <input
                type="number"
                min="1"
                value={form.maximumDisplays}
                onChange={(event) =>
                  updateField(
                    "maximumDisplays",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </section>

        <section className={styles.popupFormSection}>
          <div className={styles.popupFormHeading}>
            <span>6</span>

            <div>
              <h3>Behavior</h3>
              <p>Закриття та повторні покази</p>
            </div>
          </div>

          <div className={styles.popupBehaviorList}>
            {[
              {
                key: "allowClose",
                title: "Allow close",
                description:
                  "Показувати кнопку закриття",
              },
              {
                key: "closeOnBackdrop",
                title: "Close on backdrop",
                description:
                  "Закривати при натисканні поза попапом",
              },
              {
                key: "hideAfterClose",
                title: "Hide after close",
                description:
                  "Не показувати повторно після закриття",
              },
              {
                key: "hideAfterAction",
                title: "Hide after action",
                description:
                  "Не показувати після натискання кнопки",
              },
              {
                key: "isActive",
                title: "Active popup",
                description:
                  "Попап доступний після публікації",
              },
            ].map((option) => (
              <label key={option.key}>
                <input
                  type="checkbox"
                  checked={Boolean(
                    form[
                      option.key as keyof PopupFormState
                    ],
                  )}
                  onChange={(event) =>
                    updateField(
                      option.key as
                        | "allowClose"
                        | "closeOnBackdrop"
                        | "hideAfterClose"
                        | "hideAfterAction"
                        | "isActive",
                      event.target.checked,
                    )
                  }
                />

                <span />

                <div>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </div>
              </label>
            ))}
          </div>
        </section>

        <footer className={styles.popupBuilderFooter}>
          <button
            type="button"
            className={styles.popupCancelButton}
            onClick={onBackToCatalog}
          >
            Cancel
          </button>

          <div>
            <button
              type="button"
              className={styles.popupDraftButton}
              disabled
            >
              Save draft
            </button>

            <button
              type="button"
              className={styles.popupPublishButton}
              disabled
            >
              Publish popup
            </button>
          </div>
        </footer>
      </section>

      <aside className={styles.popupPreviewColumn}>
        <div className={styles.popupPreviewSticky}>
          <div className={styles.popupPreviewHeading}>
            <span>Live preview</span>
            <small>Player view</small>
          </div>

          <div className={styles.popupPreviewBackdrop}>
            <article
              className={styles.popupPreviewCard}
              style={{
                borderColor: `${form.accentColor}55`,
                background: `radial-gradient(circle at 100% 0%, ${form.accentColor}20, transparent 48%), #11141a`,
              }}
            >
              {form.allowClose && (
                <button
                  type="button"
                  className={styles.popupPreviewClose}
                >
                  ×
                </button>
              )}

              <div className={styles.popupPreviewImage}>
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt="Popup preview"
                  />
                ) : (
                  <span
                    style={{
                      color: form.accentColor,
                    }}
                  >
                    {form.type === "task-reward"
                      ? "✓"
                      : form.type === "season"
                        ? "♛"
                        : form.type === "warning"
                          ? "!"
                          : "▣"}
                  </span>
                )}
              </div>

              <div className={styles.popupPreviewContent}>
                <small
                  style={{
                    color: form.accentColor,
                  }}
                >
                  {popupTypeLabels[form.type]}
                </small>

                <h3>
                  {form.title || "Popup title"}
                </h3>

                {form.subtitle && (
                  <h4>{form.subtitle}</h4>
                )}

                <p>
                  {form.body ||
                    "Popup text will appear here."}
                </p>

                <div className={styles.popupPreviewButtons}>
                  {form.primaryButtonEnabled && (
                    <button
                      type="button"
                      style={{
                        borderColor:
                          `${form.accentColor}66`,
                        background:
                          `${form.accentColor}18`,
                        color: form.accentColor,
                      }}
                    >
                      {form.primaryButtonText ||
                        "Continue"}
                    </button>
                  )}

                  {form.secondaryButtonEnabled && (
                    <button type="button">
                      {form.secondaryButtonText ||
                        "Close"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          </div>

          <div className={styles.popupPreviewSummary}>
            <div>
              <span>Type</span>
              <strong>
                {popupTypeLabels[form.type]}
              </strong>
            </div>

            <div>
              <span>Trigger</span>
              <strong>
                {triggerLabels[form.trigger]}
              </strong>
            </div>

            <div>
              <span>Audience</span>
              <strong>{form.audience}</strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>{form.priority}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {form.isActive
                  ? "Active"
                  : "Disabled"}
              </strong>
            </div>
          </div>

          <div className={styles.popupQueueNotice}>
            <span>!</span>

            <p>
              Після підключення гри одночасно
              показуватиметься лише один попап із найвищим
              пріоритетом. Інші будуть поставлені в чергу.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}