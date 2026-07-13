import type {
  ShopItemCategory,
  ShopItemEffect,
  ShopItemType,
} from "@/generated/prisma/client";
import type { ServerGameStateSnapshot } from "@/game/gameStore";
import {
  createPlayerRequestId,
  getTelegramInitData,
  PlayerApiError,
  type PlayerApiErrorCode,
} from "@/lib/playerApi";

export type PlayerShopItem = {
  id: string;
  key: string;

  type: ShopItemType;
  category: ShopItemCategory;
  effect: ShopItemEffect;

  title: string;
  description: string | null;

  imageUrl: string | null;
  cosmeticId: string | null;

  basePrice: string;
  currentPrice: string;

  priceGrowthNumerator: string;
  priceGrowthDenominator: string;

  effectValue: string;
  maxLevel: number | null;

  sortOrder: number;

  metadata: unknown;

  player: {
    level: number;
    quantity: string;
    purchaseCount: number;

    isOwned: boolean;
    isEquipped: boolean;

    purchasedAt: string | null;
    equippedAt: string | null;

    isMaxLevel: boolean;
  };
};

export type PlayerShopInventoryItem = {
  id: string;
  shopItemId: string;

  level: number;
  quantity: string;
  purchaseCount: number;

  isOwned: boolean;
  isEquipped: boolean;

  purchasedAt: string | null;
  equippedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type PlayerShopPurchase = {
  id: string;
  shopItemId: string;

  status: string;

  quantity: string;
  unitPrice: string;
  totalPrice: string;

  balanceBefore: string;
  balanceAfter: string;

  levelBefore: number | null;
  levelAfter: number | null;

  gameStateRevisionBefore: number | null;
  gameStateRevisionAfter: number | null;

  createdAt: string;
  refundedAt: string | null;
};

export type PlayerShopPurchaseResult = {
  duplicate: boolean;

  itemId: string;
  itemKey: string;

  quantity: string;
  unitPrice: string;
  totalPrice: string;

  balanceBefore: string;
  balanceAfter: string;

  levelBefore: number;
  levelAfter: number;

  state: ServerGameStateSnapshot;
  playerItem: PlayerShopInventoryItem;
  purchase: PlayerShopPurchase;
};

export type PlayerShopEquipmentEffect =
  | "TAP_SKIN"
  | "AVATAR_FRAME"
  | "CHARM";

export type PlayerShopEquipmentResult = {
  action: "equip" | "unequip";

  itemId: string;
  itemKey: string;

  effect: PlayerShopEquipmentEffect;

  isEquipped: boolean;
  changed: boolean;

  playerItem: PlayerShopInventoryItem;
};

type PlayerShopCatalogSuccessResponse = {
  ok: true;
  action: "catalog";
  items: PlayerShopItem[];
};

type PlayerShopPurchaseSuccessResponse = {
  ok: true;
  action: "purchase";

  duplicate: boolean;

  itemId: string;
  itemKey: string;

  quantity: string;
  unitPrice: string;
  totalPrice: string;

  balanceBefore: string;
  balanceAfter: string;

  levelBefore: number;
  levelAfter: number;

  state: ServerGameStateSnapshot;
  playerItem: PlayerShopInventoryItem;
  purchase: PlayerShopPurchase;
};

type PlayerShopEquipmentSuccessResponse = {
  ok: true;
  action: "equip" | "unequip";

  itemId: string;
  itemKey: string;

  effect: PlayerShopEquipmentEffect;

  isEquipped: boolean;
  changed: boolean;

  playerItem: PlayerShopInventoryItem;
};

type PlayerShopErrorResponse = {
  ok: false;
  code?: unknown;
  error?: unknown;
};

export type AdminShopItemType =
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

export type AdminShopCategory =
  | "boosts"
  | "energy"
  | "tap-skins"
  | "avatar-frames"
  | "charms"
  | "special";

export type AdminShopAcquisitionMethod =
  | "purchase"
  | "action"
  | "purchase-or-action"
  | "free";

export type AdminShopPurchaseLimit =
  | "once"
  | "limited"
  | "unlimited";

export type AdminShopUnlockActionType =
  | "telegram-channel"
  | "open-link"
  | "custom"
  | "tap-count"
  | "referrals"
  | "vip-level"
  | "manual";

export type AdminShopUnlockVerification =
  | "telegram-api"
  | "game-logic"
  | "manual-review"
  | "auto-complete"
  | "no-verification";

export type CreateAdminShopItemInput = {
  key?: string;

  title: string;
  description?: string;

  type: AdminShopItemType;
  category: AdminShopCategory;

  acquisitionMethod: AdminShopAcquisitionMethod;
  purchaseLimit: AdminShopPurchaseLimit;

  imageUrl?: string;

  basePrice?: string;
  priceGrowthMultiplier?: string;

  effectValue?: string;
  itemAmount?: string;

  maxLevel?: number;
  maximumPurchases?: number;

  minimumVipLevel?: number;
  minimumPlayerLevel?: number;

  cosmeticId?: string;

  unlockActionType?: AdminShopUnlockActionType;
  unlockVerification?: AdminShopUnlockVerification;

  unlockInstructions?: string;
  actionUrl?: string;

  telegramChannelUsername?: string;
  telegramChatId?: string;

  targetValue?: string;

  startsAt?: string;
  endsAt?: string;

  sortOrder?: number;

  isActive?: boolean;
  isVisible?: boolean;
  isFeatured?: boolean;

  requirements?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type UploadedShopImage = {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  size: number;
  originalFileName: string;
};

export type AdminShopItem = {
  id: string;
  key: string;

  title: string;
  description: string | null;

  type: string;
  category: string;
  effect: string;

  acquisitionMethod: string;
  purchaseLimit: string;

  imageUrl: string | null;

  basePrice: string;

  priceGrowthNumerator: string;
  priceGrowthDenominator: string;

  effectValue: string;
  itemAmount: string;

  maxLevel: number | null;
  maximumPurchases: number | null;

  minimumVipLevel: number;
  minimumPlayerLevel: number;

  cosmeticId: string | null;

  unlockActionType: string | null;
  unlockVerification: string | null;

  unlockInstructions: string | null;
  actionUrl: string | null;

  telegramChannelUsername: string | null;
  telegramChatId: string | null;

  targetValue: string | null;

  startsAt: string | null;
  endsAt: string | null;

  sortOrder: number;

  isActive: boolean;
  isVisible: boolean;
  isFeatured: boolean;

  requirements: unknown;
  metadata: unknown;

  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;

  _count?: {
    purchases: number;
    playerItems: number;
  };
};

export type AdminShopCatalog = {
  stats: {
    totalItems: number;
    activeItems: number;
    visibleItems: number;
    disabledItems: number;
    hiddenItems: number;
    totalPurchases: number;
    completedPurchases: number;
  };

  items: AdminShopItem[];
};

type UploadShopImageResponse = {
  ok: true;
  image: UploadedShopImage;
};

type CreateAdminShopItemResponse = {
  ok: true;
  item: AdminShopItem;
};

type AdminShopCatalogResponse = {
  ok: true;
  stats: AdminShopCatalog["stats"];
  items: AdminShopItem[];
};

type AdminShopErrorResponse = {
  ok?: false;
  error?: unknown;
};

export class AdminShopApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "AdminShopApiError";
    this.status = status;
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isSerializedInteger(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^-?\d+$/.test(value)
  );
}

function isNullableString(
  value: unknown,
): value is string | null {
  return (
    typeof value === "string" ||
    value === null
  );
}

function isNullableInteger(
  value: unknown,
): value is number | null {
  return (
    value === null ||
    Number.isInteger(value)
  );
}

function isIsoDateString(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value))
  );
}

function isNullableIsoDateString(
  value: unknown,
): value is string | null {
  return (
    value === null ||
    isIsoDateString(value)
  );
}

function isPlayerShopEquipmentEffect(
  value: unknown,
): value is PlayerShopEquipmentEffect {
  return (
    value === "TAP_SKIN" ||
    value === "AVATAR_FRAME" ||
    value === "CHARM"
  );
}

function isServerGameStateSnapshot(
  value: unknown,
): value is ServerGameStateSnapshot {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isSerializedInteger(value.balance) &&
    isSerializedInteger(value.energy) &&
    isSerializedInteger(value.maxEnergy) &&
    typeof value.lastEnergyUpdate ===
      "string" &&
    isSerializedInteger(value.tapPower) &&
    isSerializedInteger(
      value.energyCostPerTap,
    ) &&
    isSerializedInteger(value.totalTaps) &&
    isSerializedInteger(
      value.totalEarned,
    ) &&
    isSerializedInteger(value.vipPoints) &&
    Number.isInteger(value.vipLevel) &&
    Number.isInteger(value.revision)
  );
}

function isPlayerShopItem(
  value: unknown,
): value is PlayerShopItem {
  if (!isRecord(value)) {
    return false;
  }

  if (!isRecord(value.player)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&

    typeof value.key === "string" &&
    value.key.length > 0 &&

    typeof value.type === "string" &&
    typeof value.category === "string" &&
    typeof value.effect === "string" &&

    typeof value.title === "string" &&
    isNullableString(value.description) &&

    isSerializedInteger(value.basePrice) &&
    isSerializedInteger(value.currentPrice) &&

    isSerializedInteger(
      value.priceGrowthNumerator,
    ) &&

    isSerializedInteger(
      value.priceGrowthDenominator,
    ) &&

    isSerializedInteger(value.effectValue) &&

    (
      value.maxLevel === null ||
      Number.isInteger(value.maxLevel)
    ) &&

    Number.isInteger(value.sortOrder) &&

    Number.isInteger(value.player.level) &&

    isSerializedInteger(
      value.player.quantity,
    ) &&

    Number.isInteger(
      value.player.purchaseCount,
    ) &&

    typeof value.player.isOwned ===
      "boolean" &&

    typeof value.player.isEquipped ===
      "boolean" &&

    isNullableString(
      value.player.purchasedAt,
    ) &&

    isNullableString(
      value.player.equippedAt,
    ) &&

    typeof value.player.isMaxLevel ===
      "boolean"
  );
}

function isPlayerShopInventoryItem(
  value: unknown,
): value is PlayerShopInventoryItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&

    typeof value.shopItemId === "string" &&
    value.shopItemId.length > 0 &&

    Number.isInteger(value.level) &&

    isSerializedInteger(value.quantity) &&

    Number.isInteger(value.purchaseCount) &&

    typeof value.isOwned === "boolean" &&

    typeof value.isEquipped === "boolean" &&

    isNullableIsoDateString(
      value.purchasedAt,
    ) &&

    isNullableIsoDateString(
      value.equippedAt,
    ) &&

    isIsoDateString(value.createdAt) &&
    isIsoDateString(value.updatedAt)
  );
}

function isPlayerShopPurchase(
  value: unknown,
): value is PlayerShopPurchase {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&

    typeof value.shopItemId === "string" &&
    value.shopItemId.length > 0 &&

    typeof value.status === "string" &&
    value.status.length > 0 &&

    isSerializedInteger(value.quantity) &&
    isSerializedInteger(value.unitPrice) &&
    isSerializedInteger(value.totalPrice) &&

    isSerializedInteger(
      value.balanceBefore,
    ) &&

    isSerializedInteger(
      value.balanceAfter,
    ) &&

    isNullableInteger(
      value.levelBefore,
    ) &&

    isNullableInteger(
      value.levelAfter,
    ) &&

    isNullableInteger(
      value.gameStateRevisionBefore,
    ) &&

    isNullableInteger(
      value.gameStateRevisionAfter,
    ) &&

    isIsoDateString(value.createdAt) &&

    isNullableIsoDateString(
      value.refundedAt,
    )
  );
}

function isPlayerShopCatalogSuccessResponse(
  value: unknown,
): value is PlayerShopCatalogSuccessResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    value.action === "catalog" &&
    Array.isArray(value.items) &&
    value.items.every(isPlayerShopItem)
  );
}

function isPlayerShopPurchaseSuccessResponse(
  value: unknown,
): value is PlayerShopPurchaseSuccessResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.ok === true &&
    value.action === "purchase" &&

    typeof value.duplicate ===
      "boolean" &&

    typeof value.itemId === "string" &&
    value.itemId.length > 0 &&

    typeof value.itemKey === "string" &&
    value.itemKey.length > 0 &&

    isSerializedInteger(value.quantity) &&
    isSerializedInteger(value.unitPrice) &&
    isSerializedInteger(value.totalPrice) &&

    isSerializedInteger(
      value.balanceBefore,
    ) &&

    isSerializedInteger(
      value.balanceAfter,
    ) &&

    Number.isInteger(value.levelBefore) &&
    Number.isInteger(value.levelAfter) &&

    isServerGameStateSnapshot(
      value.state,
    ) &&

    isPlayerShopInventoryItem(
      value.playerItem,
    ) &&

    isPlayerShopPurchase(
      value.purchase,
    )
  );
}

function isPlayerShopEquipmentSuccessResponse(
  value: unknown,
): value is PlayerShopEquipmentSuccessResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.ok === true &&

    (
      value.action === "equip" ||
      value.action === "unequip"
    ) &&

    typeof value.itemId === "string" &&
    value.itemId.length > 0 &&

    typeof value.itemKey === "string" &&
    value.itemKey.length > 0 &&

    isPlayerShopEquipmentEffect(
      value.effect,
    ) &&

    typeof value.isEquipped ===
      "boolean" &&

    typeof value.changed ===
      "boolean" &&

    isPlayerShopInventoryItem(
      value.playerItem,
    )
  );
}

function parsePlayerApiErrorCode(
  value: unknown,
): PlayerApiErrorCode {
  switch (value) {
    case "INVALID_JSON":
    case "INVALID_REQUEST_BODY":
    case "TELEGRAM_AUTH_FAILED":
    case "INVALID_REQUEST_ID":
    case "PLAYER_BLOCKED":
    case "PLAYER_STATE_NOT_FOUND":
    case "INSUFFICIENT_ENERGY":
    case "RATE_LIMIT_EXCEEDED":
    case "MAXIMUM_BALANCE_REACHED":
    case "INVALID_TAP_CONFIGURATION":
    case "INVALID_PRICE_CONFIGURATION":
    case "INVALID_PLAYER_SHOP_STATE":
    case "SHOP_ITEM_NOT_FOUND":
    case "SHOP_ITEM_UNAVAILABLE":
    case "SHOP_ITEM_NOT_PURCHASABLE":
    case "SHOP_ITEM_NOT_OWNED":
    case "SHOP_ITEM_NOT_EQUIPPABLE":
    case "VIP_LEVEL_REQUIRED":
    case "PLAYER_LEVEL_REQUIRED":
    case "PURCHASE_LIMIT_REACHED":
    case "MAX_LEVEL_REACHED":
    case "INSUFFICIENT_BALANCE":
    case "UNSUPPORTED_SHOP_EFFECT":
    case "IDEMPOTENCY_CONFLICT":
    case "CONCURRENT_UPDATE_FAILED":
    case "INTERNAL_SERVER_ERROR":
      return value;

    default:
      return "INVALID_RESPONSE";
  }
}

async function readResponseJson(
  response: Response,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new PlayerApiError({
      code: "INVALID_RESPONSE",
      status: response.status,
      message:
        "The shop API returned invalid JSON.",
    });
  }
}

function createPlayerShopResponseError(
  response: Response,
  body: unknown,
  fallbackMessage: string,
): PlayerApiError {
  const errorBody: PlayerShopErrorResponse =
    isRecord(body)
      ? {
          ok: false,
          code: body.code,
          error: body.error,
        }
      : {
          ok: false,
        };

  return new PlayerApiError({
    code: parsePlayerApiErrorCode(
      errorBody.code,
    ),

    status: response.status,

    message:
      typeof errorBody.error === "string" &&
      errorBody.error.trim().length > 0
        ? errorBody.error
        : fallbackMessage,
  });
}

async function executePlayerShopRequest(
  body: Record<string, string>,
  signal?: AbortSignal,
): Promise<{
  response: Response;
  responseBody: unknown;
}> {
  let response: Response;

  try {
    response = await fetch(
      "/api/player/shop",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(body),

        cache: "no-store",
        signal,
      },
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new PlayerApiError({
      code: "NETWORK_ERROR",
      message:
        "The shop request could not reach the server.",
    });
  }

  const responseBody =
    await readResponseJson(response);

  return {
    response,
    responseBody,
  };
}

async function readAdminResponseJson<T>(
  response: Response,
): Promise<T> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new AdminShopApiError(
      "Server returned invalid JSON.",
      response.status,
    );
  }

  if (!response.ok) {
    const errorBody =
      isRecord(body)
        ? (body as AdminShopErrorResponse)
        : null;

    throw new AdminShopApiError(
      typeof errorBody?.error === "string" &&
        errorBody.error.trim().length > 0
        ? errorBody.error
        : "Shop request failed.",
      response.status,
    );
  }

  return body as T;
}

async function setPlayerShopEquipment(
  params: {
    action: "equip" | "unequip";
    shopItemId: string;
    signal?: AbortSignal;
  },
): Promise<PlayerShopEquipmentResult> {
  const initData =
    getTelegramInitData();

  if (!initData) {
    throw new PlayerApiError({
      code: "TELEGRAM_AUTH_FAILED",
      message:
        "Telegram authorization data is unavailable.",
    });
  }

  const shopItemId =
    params.shopItemId.trim();

  if (!shopItemId) {
    throw new PlayerApiError({
      code: "SHOP_ITEM_NOT_FOUND",
      message:
        "A shop item ID is required.",
    });
  }

  const {
    response,
    responseBody,
  } = await executePlayerShopRequest(
    {
      action: params.action,
      initData,
      shopItemId,
    },
    params.signal,
  );

  if (!response.ok) {
    throw createPlayerShopResponseError(
      response,
      responseBody,
      params.action === "equip"
        ? "Failed to equip the shop item."
        : "Failed to unequip the shop item.",
    );
  }

  if (
    !isPlayerShopEquipmentSuccessResponse(
      responseBody,
    )
  ) {
    throw new PlayerApiError({
      code: "INVALID_RESPONSE",
      status: response.status,

      message:
        "The shop API returned an invalid equipment result.",
    });
  }

  return {
    action:
      responseBody.action,

    itemId:
      responseBody.itemId,

    itemKey:
      responseBody.itemKey,

    effect:
      responseBody.effect,

    isEquipped:
      responseBody.isEquipped,

    changed:
      responseBody.changed,

    playerItem:
      responseBody.playerItem,
  };
}

export function createPlayerShopRequestId(): string {
  return createPlayerRequestId();
}

export async function fetchPlayerShop(
  signal?: AbortSignal,
): Promise<PlayerShopItem[]> {
  const initData =
    getTelegramInitData();

  if (!initData) {
    throw new PlayerApiError({
      code: "TELEGRAM_AUTH_FAILED",
      message:
        "Telegram authorization data is unavailable.",
    });
  }

  const {
    response,
    responseBody,
  } = await executePlayerShopRequest(
    {
      action: "catalog",
      initData,
    },
    signal,
  );

  if (!response.ok) {
    throw createPlayerShopResponseError(
      response,
      responseBody,
      "Failed to load the shop catalog.",
    );
  }

  if (
    !isPlayerShopCatalogSuccessResponse(
      responseBody,
    )
  ) {
    throw new PlayerApiError({
      code: "INVALID_RESPONSE",
      status: response.status,

      message:
        "The shop API returned an invalid catalog.",
    });
  }

  return responseBody.items;
}

export async function purchasePlayerShopItem(
  params: {
    shopItemId: string;
    requestId: string;
    signal?: AbortSignal;
  },
): Promise<PlayerShopPurchaseResult> {
  const initData =
    getTelegramInitData();

  if (!initData) {
    throw new PlayerApiError({
      code: "TELEGRAM_AUTH_FAILED",
      message:
        "Telegram authorization data is unavailable.",
    });
  }

  const shopItemId =
    params.shopItemId.trim();

  const requestId =
    params.requestId.trim();

  if (!shopItemId) {
    throw new PlayerApiError({
      code: "SHOP_ITEM_NOT_FOUND",
      message:
        "A shop item ID is required.",
    });
  }

  if (!requestId) {
    throw new PlayerApiError({
      code: "INVALID_REQUEST_ID",
      message:
        "A shop purchase request ID is required.",
    });
  }

  const {
    response,
    responseBody,
  } = await executePlayerShopRequest(
    {
      action: "purchase",
      initData,
      shopItemId,
      requestId,
    },
    params.signal,
  );

  if (!response.ok) {
    throw createPlayerShopResponseError(
      response,
      responseBody,
      "Failed to purchase the shop item.",
    );
  }

  if (
    !isPlayerShopPurchaseSuccessResponse(
      responseBody,
    )
  ) {
    throw new PlayerApiError({
      code: "INVALID_RESPONSE",
      status: response.status,

      message:
        "The shop API returned an invalid purchase result.",
    });
  }

  return {
    duplicate:
      responseBody.duplicate,

    itemId:
      responseBody.itemId,

    itemKey:
      responseBody.itemKey,

    quantity:
      responseBody.quantity,

    unitPrice:
      responseBody.unitPrice,

    totalPrice:
      responseBody.totalPrice,

    balanceBefore:
      responseBody.balanceBefore,

    balanceAfter:
      responseBody.balanceAfter,

    levelBefore:
      responseBody.levelBefore,

    levelAfter:
      responseBody.levelAfter,

    state:
      responseBody.state,

    playerItem:
      responseBody.playerItem,

    purchase:
      responseBody.purchase,
  };
}

export async function equipPlayerShopItem(
  params: {
    shopItemId: string;
    signal?: AbortSignal;
  },
): Promise<PlayerShopEquipmentResult> {
  return setPlayerShopEquipment({
    action: "equip",
    shopItemId: params.shopItemId,
    signal: params.signal,
  });
}

export async function unequipPlayerShopItem(
  params: {
    shopItemId: string;
    signal?: AbortSignal;
  },
): Promise<PlayerShopEquipmentResult> {
  return setPlayerShopEquipment({
    action: "unequip",
    shopItemId: params.shopItemId,
    signal: params.signal,
  });
}

export async function uploadAdminShopImage(
  file: File,
  signal?: AbortSignal,
): Promise<UploadedShopImage> {
  if (!(file instanceof File)) {
    throw new AdminShopApiError(
      "Image file is required.",
      400,
    );
  }

  const formData = new FormData();
  formData.set("file", file);

  let response: Response;

  try {
    response = await fetch(
      "/api/admin/shop/upload",
      {
        method: "POST",
        body: formData,

        credentials: "same-origin",
        cache: "no-store",
        signal,
      },
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new AdminShopApiError(
      "Could not reach the image upload API.",
      0,
    );
  }

  const body =
    await readAdminResponseJson<UploadShopImageResponse>(
      response,
    );

  return body.image;
}

export async function createAdminShopItem(
  input: CreateAdminShopItemInput,
  signal?: AbortSignal,
): Promise<AdminShopItem> {
  let response: Response;

  try {
    response = await fetch(
      "/api/admin/shop",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "same-origin",
        cache: "no-store",
        signal,

        body: JSON.stringify(input),
      },
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new AdminShopApiError(
      "Could not reach the admin shop API.",
      0,
    );
  }

  const body =
    await readAdminResponseJson<CreateAdminShopItemResponse>(
      response,
    );

  return body.item;
}

export async function fetchAdminShopCatalog(
  signal?: AbortSignal,
): Promise<AdminShopCatalog> {
  let response: Response;

  try {
    response = await fetch(
      "/api/admin/shop",
      {
        method: "GET",

        credentials: "same-origin",
        cache: "no-store",
        signal,
      },
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new AdminShopApiError(
      "Could not reach the admin shop API.",
      0,
    );
  }

  const body =
    await readAdminResponseJson<AdminShopCatalogResponse>(
      response,
    );

  return {
    stats: body.stats,
    items: body.items,
  };
}