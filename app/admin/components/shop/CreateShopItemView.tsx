"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createAdminShopItem,
  updateAdminShopItem,
  uploadAdminShopImage,
} from "@/lib/playerShopApi";

import type {
  AdminShopItem,
  CreateAdminShopItemInput,
} from "@/lib/playerShopApi";

import type {
  AcquisitionMethod,
  PurchaseLimit,
  ShopCategory,
  ShopItemFormState,
  ShopItemType,
  UnlockActionType,
  UnlockVerification,
} from "./shopTypes";

import styles from "../../AdminPanel.module.css";

const initialForm: ShopItemFormState = {
  title: "",
  description: "",

  category: "boosts",
  itemType: "tap-power",
  acquisitionMethod: "purchase",

  price: "",
  purchaseLimit: "unlimited",
  maximumPurchases: "",

  minimumVipLevel: "0",

  effectValue: "",
  priceGrowthMultiplier: "1.35",
  maximumLevel: "",

  cosmeticId: "",
  itemAmount: "",

  unlockActionType: "telegram-channel",
  unlockVerification: "telegram-api",
  unlockInstructions: "",
  actionUrl: "",
  telegramChannelUsername: "",
  telegramChatId: "",
  targetValue: "",

  startDate: "",
  endDate: "",

  isActive: true,
  imagePreview: null,
};

const itemTypeLabels: Record<ShopItemType, string> = {
  "tap-power": "Tap Power Upgrade",
  "max-energy": "Max Energy Upgrade",
  "energy-recovery": "Energy Recovery",
  "energy-refill": "Energy Refill",
  "tap-skin": "Tap Skin",
  "avatar-frame": "Avatar Frame",
  charm: "Charm",
  "vip-points": "VIP Points",
  "coins-pack": "Coins Pack",
  "special-item": "Special Item",
};

const categoryLabels: Record<ShopCategory, string> = {
  boosts: "Boosts",
  energy: "Energy",
  "tap-skins": "Tap Skins",
  "avatar-frames": "Avatar Frames",
  charms: "Charms",
  special: "Special",
};

const acquisitionLabels: Record<
  AcquisitionMethod,
  string
> = {
  purchase: "Purchase only",
  action: "Action only",
  "purchase-or-action": "Purchase or Action",
  free: "Free",
};

const actionLabels: Record<UnlockActionType, string> = {
  "telegram-channel": "Telegram Channel",
  "open-link": "Open Link",
  custom: "Custom Task",
  "tap-count": "Reach Tap Count",
  referrals: "Invite Referrals",
  "vip-level": "Reach VIP Level",
  manual: "Manual Verification",
};

const verificationLabels: Record<
  UnlockVerification,
  string
> = {
  "telegram-api": "Telegram API",
  "game-logic": "Game Logic",
  "manual-review": "Manual Review",
  "auto-complete": "Auto Complete",
  "no-verification": "No Verification",
};

function toDateTimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function readMetadataNumber(item: AdminShopItem | null, key: string, fallback: number): string {
  if (!item || typeof item.metadata !== "object" || item.metadata === null || Array.isArray(item.metadata)) {
    return String(fallback);
  }
  const value = (item.metadata as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? String(value) : String(fallback);
}

function mapItemType(item: AdminShopItem): ShopItemType {
  const effectMap: Record<string, ShopItemType> = {
    TAP_POWER: "tap-power", MAX_ENERGY: "max-energy",
    ENERGY_RESTORE_AMOUNT: "energy-recovery", FULL_ENERGY: "energy-refill",
    TAP_SKIN: "tap-skin", AVATAR_FRAME: "avatar-frame", CHARM: "charm",
    VIP_POINTS: "vip-points", COINS: "coins-pack", SPECIAL_ITEM: "special-item",
  };
  return effectMap[item.effect] ?? "special-item";
}

function mapCategory(value: string): ShopCategory {
  const map: Record<string, ShopCategory> = {
    BOOSTS: "boosts", ENERGY: "energy", TAP_SKINS: "tap-skins",
    AVATAR_FRAMES: "avatar-frames", CHARMS: "charms", SPECIAL: "special",
  };
  return map[value] ?? "special";
}

function mapAcquisition(value: string): AcquisitionMethod {
  const map: Record<string, AcquisitionMethod> = {
    PURCHASE: "purchase", ACTION: "action", PURCHASE_OR_ACTION: "purchase-or-action", FREE: "free",
  };
  return map[value] ?? "purchase";
}

function mapPurchaseLimit(value: string): PurchaseLimit {
  const map: Record<string, PurchaseLimit> = { ONCE: "once", LIMITED: "limited", UNLIMITED: "unlimited" };
  return map[value] ?? "unlimited";
}

function mapUnlockAction(value: string | null): UnlockActionType {
  const map: Record<string, UnlockActionType> = {
    TELEGRAM_CHANNEL: "telegram-channel", OPEN_LINK: "open-link", CUSTOM: "custom",
    TAP_COUNT: "tap-count", REFERRALS: "referrals", VIP_LEVEL: "vip-level", MANUAL: "manual",
  };
  return value ? map[value] ?? "manual" : "telegram-channel";
}

function mapUnlockVerification(value: string | null): UnlockVerification {
  const map: Record<string, UnlockVerification> = {
    TELEGRAM_API: "telegram-api", GAME_LOGIC: "game-logic", MANUAL_REVIEW: "manual-review",
    AUTO_COMPLETE: "auto-complete", NO_VERIFICATION: "no-verification",
  };
  return value ? map[value] ?? "no-verification" : "telegram-api";
}

function createFormState(item: AdminShopItem | null): ShopItemFormState {
  if (!item) return initialForm;
  return {
    title: item.title, description: item.description ?? "", category: mapCategory(item.category),
    itemType: mapItemType(item), acquisitionMethod: mapAcquisition(item.acquisitionMethod),
    price: item.basePrice, purchaseLimit: mapPurchaseLimit(item.purchaseLimit),
    maximumPurchases: item.maximumPurchases?.toString() ?? "",
    minimumVipLevel: item.minimumVipLevel.toString(), effectValue: item.effectValue,
    priceGrowthMultiplier: String(Number(item.priceGrowthNumerator) / Number(item.priceGrowthDenominator)),
    maximumLevel: item.maxLevel?.toString() ?? "", cosmeticId: item.cosmeticId ?? "",
    itemAmount: item.itemAmount, unlockActionType: mapUnlockAction(item.unlockActionType),
    unlockVerification: mapUnlockVerification(item.unlockVerification),
    unlockInstructions: item.unlockInstructions ?? "", actionUrl: item.actionUrl ?? "",
    telegramChannelUsername: item.telegramChannelUsername ?? "", telegramChatId: item.telegramChatId ?? "",
    targetValue: item.targetValue ?? "", startDate: toDateTimeLocal(item.startsAt),
    endDate: toDateTimeLocal(item.endsAt), isActive: item.isActive, imagePreview: item.imageUrl,
  };
}

type CreateShopItemViewProps = {
  item?: AdminShopItem | null;
  onBackToCatalog: () => void;
};

export function CreateShopItemView({
  item = null,
  onBackToCatalog,
}: CreateShopItemViewProps) {
  const isEditing = item !== null;
  const [form, setForm] =
    useState<ShopItemFormState>(() => createFormState(item));

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [minimumPlayerLevel, setMinimumPlayerLevel] =
    useState(item?.minimumPlayerLevel.toString() ?? "0");

  const [isVisible, setIsVisible] =
    useState(item?.isVisible ?? true);

  const [cosmeticOffsetX, setCosmeticOffsetX] =
    useState(readMetadataNumber(item, "offsetX", 0));

  const [cosmeticOffsetY, setCosmeticOffsetY] =
    useState(readMetadataNumber(item, "offsetY", 0));

  const [cosmeticScale, setCosmeticScale] =
    useState(readMetadataNumber(item, "scale", 1));

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [submitMessage, setSubmitMessage] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (form.imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(form.imagePreview);
      }
    };
  }, [form.imagePreview]);

  function updateField<
    Key extends keyof ShopItemFormState,
  >(
    key: Key,
    value: ShopItemFormState[Key],
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

    setImageFile(file);
    setSubmitError(null);

    updateField(
      "imagePreview",
      URL.createObjectURL(file),
    );
  }

  function removeImage() {
    if (form.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

    setImageFile(null);
    updateField("imagePreview", null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    if (form.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

    setForm(createFormState(item));
    setMinimumPlayerLevel(item?.minimumPlayerLevel.toString() ?? "0");
    setIsVisible(item?.isVisible ?? true);
    setCosmeticOffsetX(readMetadataNumber(item, "offsetX", 0));
    setCosmeticOffsetY(readMetadataNumber(item, "offsetY", 0));
    setCosmeticScale(readMetadataNumber(item, "scale", 1));
    setImageFile(null);
    setSubmitError(null);
    setSubmitMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleUnlockActionChange(
    action: UnlockActionType,
  ) {
    let verification: UnlockVerification =
      "no-verification";

    if (action === "telegram-channel") {
      verification = "telegram-api";
    }

    if (
      action === "tap-count" ||
      action === "referrals" ||
      action === "vip-level"
    ) {
      verification = "game-logic";
    }

    if (action === "open-link") {
      verification = "auto-complete";
    }

    if (action === "manual") {
      verification = "manual-review";
    }

    setForm((current) => ({
      ...current,
      unlockActionType: action,
      unlockVerification: verification,
    }));
  }

  const hasPurchase =
    form.acquisitionMethod === "purchase" ||
    form.acquisitionMethod ===
      "purchase-or-action";

  const hasAction =
    form.acquisitionMethod === "action" ||
    form.acquisitionMethod ===
      "purchase-or-action";

  const isCosmetic =
    form.itemType === "tap-skin" ||
    form.itemType === "avatar-frame" ||
    form.itemType === "charm";

  const isUpgrade =
    form.itemType === "tap-power" ||
    form.itemType === "max-energy" ||
    form.itemType === "energy-recovery";

  const needsTargetValue =
    form.unlockActionType === "tap-count" ||
    form.unlockActionType === "referrals" ||
    form.unlockActionType === "vip-level";

  function parseOptionalInteger(
    value: string,
  ): number | undefined {
    const normalized = value.trim();

    if (!normalized) {
      return undefined;
    }

    const parsed = Number(normalized);

    if (!Number.isSafeInteger(parsed)) {
      return undefined;
    }

    return parsed;
  }

  function toIsoDate(
    value: string,
  ): string | undefined {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toISOString();
  }

  function validateForm(): string | null {
    if (!form.title.trim()) {
      return "Вкажіть назву товару.";
    }

    if (hasPurchase) {
      const price = form.price.trim();

      if (!/^\d+$/.test(price) || BigInt(price) <= 0n) {
        return "Для товару з покупкою вкажіть ціну більше нуля.";
      }
    }

    if (
      form.purchaseLimit === "limited" &&
      (!/^\d+$/.test(form.maximumPurchases.trim()) ||
        Number(form.maximumPurchases) < 1)
    ) {
      return "Вкажіть максимальну кількість покупок.";
    }

    if (isCosmetic && !form.cosmeticId.trim()) {
      return "Для косметики потрібно вказати Cosmetic ID.";
    }

    if (
      !/^\d+$/.test(minimumPlayerLevel.trim()) ||
      Number(minimumPlayerLevel) < 0
    ) {
      return "Мінімальний рівень гравця має бути цілим числом від нуля.";
    }

    if (isCosmetic) {
      const offsetX = Number(cosmeticOffsetX);
      const offsetY = Number(cosmeticOffsetY);
      const scale = Number(cosmeticScale);

      if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
        return "Зміщення косметики повинно бути числом.";
      }

      if (!Number.isFinite(scale) || scale <= 0) {
        return "Масштаб косметики повинен бути числом більше нуля.";
      }
    }

    if (
      hasAction &&
      form.unlockActionType === "telegram-channel" &&
      !form.telegramChannelUsername.trim() &&
      !form.telegramChatId.trim()
    ) {
      return "Вкажіть username каналу або Telegram Chat ID.";
    }

    if (
      hasAction &&
      form.unlockActionType === "open-link" &&
      !form.actionUrl.trim()
    ) {
      return "Вкажіть посилання для дії Open Link.";
    }

    if (
      hasAction &&
      needsTargetValue &&
      (!/^\d+$/.test(form.targetValue.trim()) ||
        BigInt(form.targetValue) < 1n)
    ) {
      return "Вкажіть цільове значення для умови отримання.";
    }

    if (form.startDate && form.endDate) {
      const startsAt = new Date(form.startDate);
      const endsAt = new Date(form.endDate);

      if (startsAt.getTime() >= endsAt.getTime()) {
        return "Дата завершення повинна бути пізніше дати початку.";
      }
    }

    return null;
  }

  async function submitItem(
    event: FormEvent,
    publish: boolean,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setSubmitMessage(null);

    const validationError = validateForm();

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined =
        form.imagePreview && !form.imagePreview.startsWith("blob:")
          ? form.imagePreview
          : undefined;

      if (imageFile) {
        setSubmitMessage("Завантаження картинки...");

        const uploadedImage =
          await uploadAdminShopImage(imageFile);

        imageUrl = uploadedImage.url;
      }

      setSubmitMessage(
        publish
          ? "Публікація товару..."
          : "Збереження чернетки...",
      );

      const input: CreateAdminShopItemInput = {
        title: form.title.trim(),
        description:
          form.description.trim() || undefined,

        type: form.itemType,
        category: form.category,
        acquisitionMethod:
          form.acquisitionMethod,
        purchaseLimit: form.purchaseLimit,

        imageUrl,

        basePrice: hasPurchase
          ? form.price.trim()
          : "0",

        priceGrowthMultiplier: isUpgrade
          ? form.priceGrowthMultiplier.trim() || "1"
          : "1",

        effectValue: isUpgrade
          ? form.effectValue.trim() || "0"
          : "0",

        itemAmount:
          form.itemAmount.trim() || "1",

        maxLevel: isUpgrade
          ? parseOptionalInteger(form.maximumLevel)
          : undefined,

        maximumPurchases:
          form.purchaseLimit === "limited"
            ? parseOptionalInteger(
                form.maximumPurchases,
              )
            : form.purchaseLimit === "once"
              ? 1
              : undefined,

        minimumVipLevel:
          parseOptionalInteger(
            form.minimumVipLevel,
          ) ?? 0,

        minimumPlayerLevel:
          parseOptionalInteger(minimumPlayerLevel) ?? 0,

        cosmeticId: isCosmetic
          ? form.cosmeticId.trim()
          : undefined,

        unlockActionType: hasAction
          ? form.unlockActionType
          : undefined,

        unlockVerification: hasAction
          ? form.unlockVerification
          : undefined,

        unlockInstructions: hasAction
          ? form.unlockInstructions.trim() ||
            undefined
          : undefined,

        actionUrl: hasAction
          ? form.actionUrl.trim() || undefined
          : undefined,

        telegramChannelUsername: hasAction
          ? form.telegramChannelUsername.trim() ||
            undefined
          : undefined,

        telegramChatId: hasAction
          ? form.telegramChatId.trim() || undefined
          : undefined,

        targetValue:
          hasAction && needsTargetValue
            ? form.targetValue.trim()
            : undefined,

        startsAt: toIsoDate(form.startDate),
        endsAt: toIsoDate(form.endDate),

        isActive: publish
          ? form.isActive
          : false,
        isVisible: publish
          ? isVisible
          : false,

        metadata: isCosmetic
          ? {
              offsetX: Number(cosmeticOffsetX),
              offsetY: Number(cosmeticOffsetY),
              scale: Number(cosmeticScale),
            }
          : undefined,
      };

      if (item) {
        await updateAdminShopItem({ id: item.id, key: item.key, ...input });
      } else {
        await createAdminShopItem(input);
      }

      resetForm();
      onBackToCatalog();
    } catch (error) {
      setSubmitMessage(null);

      setSubmitError(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Не вдалося оновити товар."
            : "Не вдалося створити товар.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={styles.createShopLayout}
      onSubmit={(event) =>
        submitItem(event, true)
      }
    >
      <section className={styles.shopItemBuilder}>
        <header className={styles.shopItemBuilderHeader}>
          <div>
            <h2>{isEditing ? "Edit Shop Item" : "Create Shop Item"}</h2>

            <p>
              {isEditing
                ? "Оновіть товар, ціну, ефект і спосіб отримання"
                : "Налаштуйте товар, ціну, ефект і спосіб отримання"}
            </p>
          </div>

          <button type="button" onClick={resetForm}>
            Reset form
          </button>
        </header>

        <section className={styles.shopFormSection}>
          <div className={styles.shopFormHeading}>
            <span>1</span>

            <div>
              <h3>Item appearance</h3>
              <p>
                Інформація та картинка товару
              </p>
            </div>
          </div>

          <div className={styles.shopImageField}>
            <div className={styles.shopImagePreview}>
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Shop item preview"
                />
              ) : (
                <span>◇</span>
              )}
            </div>

            <div className={styles.shopImageControls}>
              <strong>Item image</strong>

              <p>
                Квадратна PNG, JPG або WEBP картинка
                товару.
              </p>

              <label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />

                <span>Choose image</span>
              </label>

              {form.imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className={styles.shopFieldsGrid}>
            <label className={styles.shopFieldFull}>
              <span>Item title</span>

              <input
                type="text"
                value={form.title}
                maxLength={80}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value,
                  )
                }
                placeholder="Наприклад: Golden Tap Skin"
              />

              <small>{form.title.length}/80</small>
            </label>

            <label className={styles.shopFieldFull}>
              <span>Description</span>

              <textarea
                value={form.description}
                maxLength={300}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                placeholder="Опишіть товар і його переваги..."
              />

              <small>
                {form.description.length}/300
              </small>
            </label>

            <label>
              <span>Category</span>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target
                      .value as ShopCategory,
                  )
                }
              >
                {Object.entries(categoryLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>Item type</span>

              <select
                value={form.itemType}
                onChange={(event) =>
                  updateField(
                    "itemType",
                    event.target
                      .value as ShopItemType,
                  )
                }
              >
                {Object.entries(itemTypeLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
        </section>

        <section className={styles.shopFormSection}>
          <div className={styles.shopFormHeading}>
            <span>2</span>

            <div>
              <h3>Acquisition method</h3>

              <p>
                Як гравець може отримати товар
              </p>
            </div>
          </div>

          <div className={styles.acquisitionGrid}>
            {(
              Object.entries(
                acquisitionLabels,
              ) as Array<
                [AcquisitionMethod, string]
              >
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  form.acquisitionMethod === value
                    ? styles.acquisitionButtonActive
                    : styles.acquisitionButton
                }
                onClick={() =>
                  updateField(
                    "acquisitionMethod",
                    value,
                  )
                }
              >
                <span>
                  {value === "purchase"
                    ? "◉"
                    : value === "action"
                      ? "✓"
                      : value ===
                          "purchase-or-action"
                        ? "◇"
                        : "✦"}
                </span>

                <div>
                  <strong>{label}</strong>

                  <small>
                    {value === "purchase"
                      ? "Тільки за ігрові монети"
                      : value === "action"
                        ? "Тільки за виконання дії"
                        : value ===
                            "purchase-or-action"
                          ? "Монети або виконання дії"
                          : "Безкоштовне отримання"}
                  </small>
                </div>
              </button>
            ))}
          </div>

          {hasPurchase && (
            <div className={styles.shopFieldsGrid}>
              <label>
                <span>Price</span>

                <div
                  className={
                    styles.shopInputWithSuffix
                  }
                >
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(event) =>
                      updateField(
                        "price",
                        event.target.value,
                      )
                    }
                    placeholder="10000"
                  />

                  <b>COINS</b>
                </div>
              </label>

              <label>
                <span>Purchase limit</span>

                <select
                  value={form.purchaseLimit}
                  onChange={(event) =>
                    updateField(
                      "purchaseLimit",
                      event.target
                        .value as PurchaseLimit,
                    )
                  }
                >
                  <option value="once">
                    One purchase
                  </option>

                  <option value="limited">
                    Limited amount
                  </option>

                  <option value="unlimited">
                    Unlimited
                  </option>
                </select>
              </label>

              {form.purchaseLimit === "limited" && (
                <label>
                  <span>Maximum purchases</span>

                  <input
                    type="number"
                    min="1"
                    value={form.maximumPurchases}
                    onChange={(event) =>
                      updateField(
                        "maximumPurchases",
                        event.target.value,
                      )
                    }
                    placeholder="5"
                  />
                </label>
              )}

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

              <label>
                <span>Minimum player level</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minimumPlayerLevel}
                  onChange={(event) =>
                    setMinimumPlayerLevel(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          )}

          {hasAction && (
            <div className={styles.shopUnlockSection}>
              <div className={styles.shopUnlockHeader}>
                <span>✓</span>

                <div>
                  <strong>Unlock action</strong>

                  <p>
                    Дія, після якої гравець зможе
                    отримати товар.
                  </p>
                </div>
              </div>

              <div className={styles.shopActionGrid}>
                {(
                  Object.entries(
                    actionLabels,
                  ) as Array<
                    [UnlockActionType, string]
                  >
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      form.unlockActionType === value
                        ? styles.shopActionButtonActive
                        : styles.shopActionButton
                    }
                    onClick={() =>
                      handleUnlockActionChange(value)
                    }
                  >
                    <span>
                      {value ===
                      "telegram-channel"
                        ? "✈"
                        : value === "open-link"
                          ? "↗"
                          : value === "custom"
                            ? "✎"
                            : value === "tap-count"
                              ? "♣"
                              : value === "referrals"
                                ? "♟"
                                : value === "vip-level"
                                  ? "♛"
                                  : "◎"}
                    </span>

                    <strong>{label}</strong>
                  </button>
                ))}
              </div>

              <div className={styles.shopFieldsGrid}>
                <label
                  className={styles.shopFieldFull}
                >
                  <span>Verification method</span>

                  <select
                    value={form.unlockVerification}
                    onChange={(event) =>
                      updateField(
                        "unlockVerification",
                        event.target
                          .value as UnlockVerification,
                      )
                    }
                  >
                    {Object.entries(
                      verificationLabels,
                    ).map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {form.unlockActionType ===
                "custom" && (
                <div
                  className={styles.shopFieldsGrid}
                >
                  <label
                    className={
                      styles.shopFieldFull
                    }
                  >
                    <span>
                      Instructions for player
                    </span>

                    <textarea
                      value={
                        form.unlockInstructions
                      }
                      maxLength={600}
                      onChange={(event) =>
                        updateField(
                          "unlockInstructions",
                          event.target.value,
                        )
                      }
                      placeholder="Наприклад: Залиш коментар під відео та повернись у гру."
                    />

                    <small>
                      {
                        form.unlockInstructions
                          .length
                      }
                      /600
                    </small>
                  </label>
                </div>
              )}

              {form.unlockVerification ===
                "telegram-api" && (
                <div
                  className={
                    styles.shopTelegramSettings
                  }
                >
                  <div
                    className={
                      styles.shopFieldsGrid
                    }
                  >
                    <label>
                      <span>
                        Channel username
                      </span>

                      <input
                        type="text"
                        value={
                          form.telegramChannelUsername
                        }
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
                      <span>
                        Telegram Chat ID
                      </span>

                      <input
                        type="text"
                        value={
                          form.telegramChatId
                        }
                        onChange={(event) =>
                          updateField(
                            "telegramChatId",
                            event.target.value,
                          )
                        }
                        placeholder="-1001234567890"
                      />
                    </label>

                    <label
                      className={
                        styles.shopFieldFull
                      }
                    >
                      <span>
                        Channel or invite URL
                      </span>

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

              {form.unlockActionType ===
                "open-link" &&
                form.unlockVerification !==
                  "telegram-api" && (
                  <div
                    className={
                      styles.shopFieldsGrid
                    }
                  >
                    <label
                      className={
                        styles.shopFieldFull
                      }
                    >
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
                <div
                  className={styles.shopFieldsGrid}
                >
                  <label>
                    <span>
                      {form.unlockActionType ===
                      "tap-count"
                        ? "Required taps"
                        : form.unlockActionType ===
                            "referrals"
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

              <div
                className={
                  styles.shopVerificationNotice
                }
              >
                <span>!</span>

                <p>
                  Після підключення механіки цей
                  товар буде зв’язаний із тією самою
                  системою перевірки, що й Tasks.
                  Дублювати перевірку не потрібно.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className={styles.shopFormSection}>
          <div className={styles.shopFormHeading}>
            <span>3</span>

            <div>
              <h3>Item effect</h3>

              <p>
                Що саме отримає гравець після
                покупки
              </p>
            </div>
          </div>

          <div className={styles.shopFieldsGrid}>
            {isUpgrade && (
              <>
                <label>
                  <span>Effect value</span>

                  <input
                    type="number"
                    value={form.effectValue}
                    onChange={(event) =>
                      updateField(
                        "effectValue",
                        event.target.value,
                      )
                    }
                    placeholder="1"
                  />
                </label>

                <label>
                  <span>
                    Price growth multiplier
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.05"
                    value={
                      form.priceGrowthMultiplier
                    }
                    onChange={(event) =>
                      updateField(
                        "priceGrowthMultiplier",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Maximum level</span>

                  <input
                    type="number"
                    min="0"
                    value={form.maximumLevel}
                    onChange={(event) =>
                      updateField(
                        "maximumLevel",
                        event.target.value,
                      )
                    }
                    placeholder="Leave empty for unlimited"
                  />
                </label>
              </>
            )}

            {isCosmetic && (
              <>
                <label
                  className={styles.shopFieldFull}
                >
                  <span>Cosmetic ID</span>

                  <input
                    type="text"
                    value={form.cosmeticId}
                    onChange={(event) =>
                      updateField(
                        "cosmeticId",
                        event.target.value,
                      )
                    }
                    placeholder="tap-gold"
                  />
                </label>

                <label>
                  <span>Offset X</span>

                  <input
                    type="number"
                    step="0.1"
                    value={cosmeticOffsetX}
                    onChange={(event) =>
                      setCosmeticOffsetX(
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Offset Y</span>

                  <input
                    type="number"
                    step="0.1"
                    value={cosmeticOffsetY}
                    onChange={(event) =>
                      setCosmeticOffsetY(
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Scale</span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={cosmeticScale}
                    onChange={(event) =>
                      setCosmeticScale(
                        event.target.value,
                      )
                    }
                  />
                </label>
              </>
            )}

            {(form.itemType === "energy-refill" ||
              form.itemType === "vip-points" ||
              form.itemType === "coins-pack") && (
              <label>
                <span>Amount</span>

                <input
                  type="number"
                  min="0"
                  value={form.itemAmount}
                  onChange={(event) =>
                    updateField(
                      "itemAmount",
                      event.target.value,
                    )
                  }
                  placeholder="1000"
                />
              </label>
            )}
          </div>
        </section>

        <section className={styles.shopFormSection}>
          <div className={styles.shopFormHeading}>
            <span>4</span>

            <div>
              <h3>Availability</h3>

              <p>
                Статус і період доступності
              </p>
            </div>
          </div>

          <div className={styles.shopFieldsGrid}>
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
          </div>

          <label className={styles.shopActiveToggle}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField(
                  "isActive",
                  event.target.checked,
                )
              }
            />

            <span />

            <div>
              <strong>Active item</strong>

              <small>
                Товар буде видимий гравцям після
                публікації.
              </small>
            </div>
          </label>


          <label className={styles.shopActiveToggle}>
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(event) =>
                setIsVisible(event.target.checked)
              }
            />

            <span />

            <div>
              <strong>Visible in catalog</strong>

              <small>
                Вимкніть, щоб приховати товар від гравців без його деактивації.
              </small>
            </div>
          </label>
        </section>

        {(submitError || submitMessage) && (
          <div
            className={styles.shopVerificationNotice}
            role={submitError ? "alert" : "status"}
          >
            <span>{submitError ? "!" : "✓"}</span>

            <p>{submitError ?? submitMessage}</p>
          </div>
        )}

        <footer className={styles.shopBuilderFooter}>
          <button
            type="button"
            className={styles.shopCancelButton}
            onClick={onBackToCatalog}
          >
            Cancel
          </button>

          <div>
            <button
              type="button"
              className={styles.shopDraftButton}
              disabled={isSubmitting}
              onClick={(event) =>
                submitItem(event, false)
              }
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save disabled"
                  : "Save draft"}
            </button>

            <button
              type="submit"
              className={styles.shopPublishButton}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Publishing..."
                : isEditing
                  ? "Save changes"
                  : "Publish item"}
            </button>
          </div>
        </footer>
      </section>

      <aside className={styles.shopPreviewColumn}>
        <div className={styles.shopPreviewSticky}>
          <div className={styles.shopPreviewHeading}>
            <span>Live preview</span>
            <small>Player view</small>
          </div>

          <article className={styles.shopPreviewCard}>
            <div className={styles.shopPreviewImage}>
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Shop item preview"
                />
              ) : (
                <span>◇</span>
              )}
            </div>

            <div className={styles.shopPreviewContent}>
              <div
                className={styles.shopPreviewCategory}
              >
                {categoryLabels[form.category]}
              </div>

              <h3>{form.title || "Item title"}</h3>

              <p>
                {form.description ||
                  "Item description will appear here."}
              </p>

              {hasPurchase && (
                <div
                  className={styles.shopPreviewPrice}
                >
                  <span>Price</span>

                  <strong>
                    {Number(
                      form.price || 0,
                    ).toLocaleString("uk-UA")}{" "}
                    COINS
                  </strong>
                </div>
              )}

              {hasAction && (
                <div
                  className={
                    styles.shopPreviewUnlock
                  }
                >
                  <span>Alternative unlock</span>

                  <strong>
                    {
                      actionLabels[
                        form.unlockActionType
                      ]
                    }
                  </strong>
                </div>
              )}

              <div
                className={styles.shopPreviewButtons}
              >
                {hasPurchase && (
                  <button type="button">
                    Buy item
                  </button>
                )}

                {hasAction && (
                  <button type="button">
                    Unlock by action
                  </button>
                )}

                {form.acquisitionMethod === "free" && (
                  <button type="button">
                    Claim free
                  </button>
                )}
              </div>
            </div>
          </article>

          <div className={styles.shopPreviewSummary}>
            <div>
              <span>Item type</span>
              <strong>
                {itemTypeLabels[form.itemType]}
              </strong>
            </div>

            <div>
              <span>Acquisition</span>
              <strong>
                {
                  acquisitionLabels[
                    form.acquisitionMethod
                  ]
                }
              </strong>
            </div>

            <div>
              <span>VIP requirement</span>
              <strong>
                VIP {form.minimumVipLevel || "0"}
              </strong>
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
        </div>
      </aside>
    </form>
  );
}