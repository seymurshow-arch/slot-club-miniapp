export type ShopView =
  | "catalog"
  | "create"
  | "history";

export type ShopCategory =
  | "boosts"
  | "energy"
  | "tap-skins"
  | "avatar-frames"
  | "charms"
  | "special";

export type ShopItemType =
  | "tap-power"
  | "max-energy"
  | "energy-recovery"
  | "energy-refill"
  | "tap-skin"
  | "avatar-frame"
  | "charm"
  | "vip-points"
  | "coins-pack"
  | "special-item";

export type AcquisitionMethod =
  | "purchase"
  | "action"
  | "purchase-or-action"
  | "free";

export type UnlockActionType =
  | "telegram-channel"
  | "open-link"
  | "custom"
  | "tap-count"
  | "referrals"
  | "vip-level"
  | "manual";

export type UnlockVerification =
  | "telegram-api"
  | "game-logic"
  | "manual-review"
  | "auto-complete"
  | "no-verification";

export type PurchaseLimit =
  | "once"
  | "limited"
  | "unlimited";

export type ShopItemFormState = {
  title: string;
  description: string;

  category: ShopCategory;
  itemType: ShopItemType;
  acquisitionMethod: AcquisitionMethod;

  price: string;
  purchaseLimit: PurchaseLimit;
  maximumPurchases: string;

  minimumVipLevel: string;

  effectValue: string;
  priceGrowthMultiplier: string;
  maximumLevel: string;

  cosmeticId: string;
  itemAmount: string;

  unlockActionType: UnlockActionType;
  unlockVerification: UnlockVerification;
  unlockInstructions: string;
  actionUrl: string;
  telegramChannelUsername: string;
  telegramChatId: string;
  targetValue: string;

  startDate: string;
  endDate: string;

  isActive: boolean;
  imagePreview: string | null;
};