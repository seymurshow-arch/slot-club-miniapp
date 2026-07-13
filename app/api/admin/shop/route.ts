import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import {
  ShopAcquisitionMethod,
  ShopItemCategory,
  ShopItemEffect,
  ShopItemType,
  ShopPurchaseLimit,
  ShopUnlockActionType,
  ShopUnlockVerification,
} from "@/generated/prisma/enums";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2_000;
const MAX_KEY_LENGTH = 100;
const MAX_URL_LENGTH = 2_000;
const MAX_INSTRUCTIONS_LENGTH = 4_000;
const MAX_TELEGRAM_VALUE_LENGTH = 255;
const MAX_INTEGER = 2_147_483_647;
const MAX_BIGINT = 9_223_372_036_854_775_807n;

type JsonRecord = Prisma.InputJsonObject;

type CreateShopItemBody = {
  key?: unknown;
  title?: unknown;
  description?: unknown;

  type?: unknown;
  category?: unknown;
  effect?: unknown;
  acquisitionMethod?: unknown;
  purchaseLimit?: unknown;

  imageUrl?: unknown;

  basePrice?: unknown;
  priceGrowthNumerator?: unknown;
  priceGrowthDenominator?: unknown;
  priceGrowthMultiplier?: unknown;

  effectValue?: unknown;
  itemAmount?: unknown;

  maxLevel?: unknown;
  maximumPurchases?: unknown;

  minimumVipLevel?: unknown;
  minimumPlayerLevel?: unknown;

  cosmeticId?: unknown;

  unlockActionType?: unknown;
  unlockVerification?: unknown;
  unlockInstructions?: unknown;
  actionUrl?: unknown;

  telegramChannelUsername?: unknown;
  telegramChatId?: unknown;

  targetValue?: unknown;

  startsAt?: unknown;
  endsAt?: unknown;

  sortOrder?: unknown;

  isActive?: unknown;
  isVisible?: unknown;
  isFeatured?: unknown;

  requirements?: unknown;
  metadata?: unknown;
};

class ShopValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopValidationError";
  }
}

const itemTypeMap: Record<string, ShopItemType> = {
  UPGRADE: ShopItemType.UPGRADE,
  upgrade: ShopItemType.UPGRADE,

  CONSUMABLE: ShopItemType.CONSUMABLE,
  consumable: ShopItemType.CONSUMABLE,

  COSMETIC: ShopItemType.COSMETIC,
  cosmetic: ShopItemType.COSMETIC,

  "tap-power": ShopItemType.UPGRADE,
  "max-energy": ShopItemType.UPGRADE,
  "energy-recovery": ShopItemType.UPGRADE,

  "energy-refill": ShopItemType.CONSUMABLE,
  "vip-points": ShopItemType.CONSUMABLE,
  "coins-pack": ShopItemType.CONSUMABLE,

  "tap-skin": ShopItemType.COSMETIC,
  "avatar-frame": ShopItemType.COSMETIC,
  charm: ShopItemType.COSMETIC,

  "special-item": ShopItemType.CONSUMABLE,
};

const categoryMap: Record<string, ShopItemCategory> = {
  BOOSTS: ShopItemCategory.BOOSTS,
  boosts: ShopItemCategory.BOOSTS,

  ENERGY: ShopItemCategory.ENERGY,
  energy: ShopItemCategory.ENERGY,

  TAP_SKINS: ShopItemCategory.TAP_SKINS,
  "tap-skins": ShopItemCategory.TAP_SKINS,

  AVATAR_FRAMES: ShopItemCategory.AVATAR_FRAMES,
  "avatar-frames": ShopItemCategory.AVATAR_FRAMES,

  CHARMS: ShopItemCategory.CHARMS,
  charms: ShopItemCategory.CHARMS,

  SPECIAL: ShopItemCategory.SPECIAL,
  special: ShopItemCategory.SPECIAL,
};

const effectMap: Record<string, ShopItemEffect> = {
  TAP_POWER: ShopItemEffect.TAP_POWER,
  "tap-power": ShopItemEffect.TAP_POWER,

  MAX_ENERGY: ShopItemEffect.MAX_ENERGY,
  "max-energy": ShopItemEffect.MAX_ENERGY,

  ENERGY_RESTORE_AMOUNT:
    ShopItemEffect.ENERGY_RESTORE_AMOUNT,
  "energy-recovery":
    ShopItemEffect.ENERGY_RESTORE_AMOUNT,

  FULL_ENERGY: ShopItemEffect.FULL_ENERGY,
  "energy-refill": ShopItemEffect.FULL_ENERGY,

  TAP_SKIN: ShopItemEffect.TAP_SKIN,
  "tap-skin": ShopItemEffect.TAP_SKIN,

  AVATAR_FRAME: ShopItemEffect.AVATAR_FRAME,
  "avatar-frame": ShopItemEffect.AVATAR_FRAME,

  CHARM: ShopItemEffect.CHARM,
  charm: ShopItemEffect.CHARM,

  VIP_POINTS: ShopItemEffect.VIP_POINTS,
  "vip-points": ShopItemEffect.VIP_POINTS,

  COINS: ShopItemEffect.COINS,
  "coins-pack": ShopItemEffect.COINS,

  SPECIAL_ITEM: ShopItemEffect.SPECIAL_ITEM,
  "special-item": ShopItemEffect.SPECIAL_ITEM,
};

const acquisitionMethodMap: Record<
  string,
  ShopAcquisitionMethod
> = {
  PURCHASE: ShopAcquisitionMethod.PURCHASE,
  purchase: ShopAcquisitionMethod.PURCHASE,

  ACTION: ShopAcquisitionMethod.ACTION,
  action: ShopAcquisitionMethod.ACTION,

  PURCHASE_OR_ACTION:
    ShopAcquisitionMethod.PURCHASE_OR_ACTION,
  "purchase-or-action":
    ShopAcquisitionMethod.PURCHASE_OR_ACTION,

  FREE: ShopAcquisitionMethod.FREE,
  free: ShopAcquisitionMethod.FREE,
};

const purchaseLimitMap: Record<
  string,
  ShopPurchaseLimit
> = {
  ONCE: ShopPurchaseLimit.ONCE,
  once: ShopPurchaseLimit.ONCE,

  LIMITED: ShopPurchaseLimit.LIMITED,
  limited: ShopPurchaseLimit.LIMITED,

  UNLIMITED: ShopPurchaseLimit.UNLIMITED,
  unlimited: ShopPurchaseLimit.UNLIMITED,
};

const unlockActionTypeMap: Record<
  string,
  ShopUnlockActionType
> = {
  TELEGRAM_CHANNEL:
    ShopUnlockActionType.TELEGRAM_CHANNEL,
  "telegram-channel":
    ShopUnlockActionType.TELEGRAM_CHANNEL,

  OPEN_LINK: ShopUnlockActionType.OPEN_LINK,
  "open-link": ShopUnlockActionType.OPEN_LINK,

  CUSTOM: ShopUnlockActionType.CUSTOM,
  custom: ShopUnlockActionType.CUSTOM,

  TAP_COUNT: ShopUnlockActionType.TAP_COUNT,
  "tap-count": ShopUnlockActionType.TAP_COUNT,

  REFERRALS: ShopUnlockActionType.REFERRALS,
  referrals: ShopUnlockActionType.REFERRALS,

  VIP_LEVEL: ShopUnlockActionType.VIP_LEVEL,
  "vip-level": ShopUnlockActionType.VIP_LEVEL,

  MANUAL: ShopUnlockActionType.MANUAL,
  manual: ShopUnlockActionType.MANUAL,
};

const unlockVerificationMap: Record<
  string,
  ShopUnlockVerification
> = {
  TELEGRAM_API:
    ShopUnlockVerification.TELEGRAM_API,
  "telegram-api":
    ShopUnlockVerification.TELEGRAM_API,

  GAME_LOGIC: ShopUnlockVerification.GAME_LOGIC,
  "game-logic":
    ShopUnlockVerification.GAME_LOGIC,

  MANUAL_REVIEW:
    ShopUnlockVerification.MANUAL_REVIEW,
  "manual-review":
    ShopUnlockVerification.MANUAL_REVIEW,

  AUTO_COMPLETE:
    ShopUnlockVerification.AUTO_COMPLETE,
  "auto-complete":
    ShopUnlockVerification.AUTO_COMPLETE,

  NO_VERIFICATION:
    ShopUnlockVerification.NO_VERIFICATION,
  "no-verification":
    ShopUnlockVerification.NO_VERIFICATION,
};

async function requireAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(
    ADMIN_SESSION_COOKIE,
  )?.value;

  return verifyAdminSessionToken(token);
}

function normalizeRequiredString(
  value: unknown,
  fieldName: string,
  maximumLength: number,
): string {
  if (typeof value !== "string") {
    throw new ShopValidationError(
      `${fieldName} is required.`,
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new ShopValidationError(
      `${fieldName} is required.`,
    );
  }

  if (normalized.length > maximumLength) {
    throw new ShopValidationError(
      `${fieldName} is too long.`,
    );
  }

  return normalized;
}

function normalizeOptionalString(
  value: unknown,
  fieldName: string,
  maximumLength: number,
): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ShopValidationError(
      `${fieldName} must be a string.`,
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maximumLength) {
    throw new ShopValidationError(
      `${fieldName} is too long.`,
    );
  }

  return normalized;
}

function normalizeBoolean(
  value: unknown,
  defaultValue: boolean,
  fieldName: string,
): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "boolean") {
    throw new ShopValidationError(
      `${fieldName} must be a boolean.`,
    );
  }

  return value;
}

function normalizeInteger(
  value: unknown,
  fieldName: string,
  options: {
    defaultValue?: number;
    minimum?: number;
    maximum?: number;
    nullable?: boolean;
  } = {},
): number | null {
  const {
    defaultValue,
    minimum = 0,
    maximum = MAX_INTEGER,
    nullable = false,
  } = options;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    if (nullable) {
      return null;
    }

    throw new ShopValidationError(
      `${fieldName} is required.`,
    );
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < minimum ||
    parsed > maximum
  ) {
    throw new ShopValidationError(
      `${fieldName} must be an integer between ${minimum} and ${maximum}.`,
    );
  }

  return parsed;
}

function normalizeBigInt(
  value: unknown,
  fieldName: string,
  options: {
    defaultValue?: bigint;
    minimum?: bigint;
    maximum?: bigint;
    nullable?: boolean;
  } = {},
): bigint | null {
  const {
    defaultValue,
    minimum = 0n,
    maximum = MAX_BIGINT,
    nullable = false,
  } = options;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    if (nullable) {
      return null;
    }

    throw new ShopValidationError(
      `${fieldName} is required.`,
    );
  }

  let parsed: bigint;

  try {
    if (typeof value === "bigint") {
      parsed = value;
    } else if (
      typeof value === "number" &&
      Number.isSafeInteger(value)
    ) {
      parsed = BigInt(value);
    } else if (
      typeof value === "string" &&
      /^\d+$/.test(value.trim())
    ) {
      parsed = BigInt(value.trim());
    } else {
      throw new Error("Invalid bigint");
    }
  } catch {
    throw new ShopValidationError(
      `${fieldName} must be a whole number.`,
    );
  }

  if (parsed < minimum || parsed > maximum) {
    throw new ShopValidationError(
      `${fieldName} is outside the allowed range.`,
    );
  }

  return parsed;
}

function normalizeEnum<Value extends string>(
  value: unknown,
  fieldName: string,
  mapping: Record<string, Value>,
): Value {
  if (typeof value !== "string") {
    throw new ShopValidationError(
      `${fieldName} is required.`,
    );
  }

  const result = mapping[value];

  if (!result) {
    throw new ShopValidationError(
      `${fieldName} has an unsupported value.`,
    );
  }

  return result;
}

function normalizeOptionalEnum<Value extends string>(
  value: unknown,
  fieldName: string,
  mapping: Record<string, Value>,
): Value | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return normalizeEnum(value, fieldName, mapping);
}

function normalizeDate(
  value: unknown,
  fieldName: string,
): Date | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ShopValidationError(
      `${fieldName} must be a date string.`,
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ShopValidationError(
      `${fieldName} contains an invalid date.`,
    );
  }

  return date;
}

function normalizeUrl(
  value: unknown,
  fieldName: string,
): string | null {
  const normalized = normalizeOptionalString(
    value,
    fieldName,
    MAX_URL_LENGTH,
  );

  if (!normalized) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new ShopValidationError(
      `${fieldName} must be a valid URL.`,
    );
  }

  if (
    parsed.protocol !== "https:" &&
    parsed.protocol !== "http:"
  ) {
    throw new ShopValidationError(
      `${fieldName} must use HTTP or HTTPS.`,
    );
  }

  return parsed.toString();
}

function normalizeJsonObject(
  value: unknown,
  fieldName: string,
): Prisma.InputJsonObject | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new ShopValidationError(
      `${fieldName} must be a JSON object.`,
    );
  }

  try {
    JSON.stringify(value);
  } catch {
    throw new ShopValidationError(
      `${fieldName} must contain valid JSON values.`,
    );
  }

  return value as Prisma.InputJsonObject;
}

function createItemKey(
  requestedKey: unknown,
  title: string,
): string {
  const source =
    typeof requestedKey === "string" &&
    requestedKey.trim()
      ? requestedKey.trim()
      : title;

  const normalized = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_KEY_LENGTH);

  if (!normalized) {
    throw new ShopValidationError(
      "key must contain Latin letters or numbers.",
    );
  }

  return normalized;
}

function calculatePriceFraction(
  body: CreateShopItemBody,
): {
  numerator: bigint;
  denominator: bigint;
} {
  const explicitNumerator =
    body.priceGrowthNumerator;
  const explicitDenominator =
    body.priceGrowthDenominator;

  if (
    explicitNumerator !== undefined ||
    explicitDenominator !== undefined
  ) {
    const numerator = normalizeBigInt(
      explicitNumerator,
      "priceGrowthNumerator",
      {
        minimum: 1n,
      },
    );

    const denominator = normalizeBigInt(
      explicitDenominator,
      "priceGrowthDenominator",
      {
        minimum: 1n,
      },
    );

    return {
      numerator: numerator!,
      denominator: denominator!,
    };
  }

  if (
    body.priceGrowthMultiplier === undefined ||
    body.priceGrowthMultiplier === null ||
    body.priceGrowthMultiplier === ""
  ) {
    return {
      numerator: 1n,
      denominator: 1n,
    };
  }

  const rawMultiplier =
    typeof body.priceGrowthMultiplier === "number"
      ? String(body.priceGrowthMultiplier)
      : typeof body.priceGrowthMultiplier === "string"
        ? body.priceGrowthMultiplier.trim()
        : "";

  if (!/^\d+(?:\.\d{1,6})?$/.test(rawMultiplier)) {
    throw new ShopValidationError(
      "priceGrowthMultiplier must be a positive decimal number with up to 6 decimal places.",
    );
  }

  const [wholePart, decimalPart = ""] =
    rawMultiplier.split(".");

  const denominator =
    decimalPart.length > 0
      ? 10n ** BigInt(decimalPart.length)
      : 1n;

  const numerator = BigInt(
    `${wholePart}${decimalPart}`,
  );

  if (numerator < denominator) {
    throw new ShopValidationError(
      "priceGrowthMultiplier cannot be lower than 1.",
    );
  }

  return {
    numerator,
    denominator,
  };
}

function inferEffect(
  rawEffect: unknown,
  rawType: unknown,
): ShopItemEffect {
  const candidate =
    typeof rawEffect === "string" &&
    rawEffect.trim()
      ? rawEffect
      : rawType;

  return normalizeEnum(
    candidate,
    "effect",
    effectMap,
  );
}

function serializeShopItem<
  Item extends {
    basePrice: bigint;
    priceGrowthNumerator: bigint;
    priceGrowthDenominator: bigint;
    effectValue: bigint;
    itemAmount: bigint;
    targetValue: bigint | null;
    _count?: {
      purchases: number;
      playerItems: number;
    };
  },
>(item: Item) {
  return {
    ...item,
    basePrice: item.basePrice.toString(),
    priceGrowthNumerator:
      item.priceGrowthNumerator.toString(),
    priceGrowthDenominator:
      item.priceGrowthDenominator.toString(),
    effectValue: item.effectValue.toString(),
    itemAmount: item.itemAmount.toString(),
    targetValue: item.targetValue?.toString() ?? null,
  };
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
      ),
    );

    const [
      items,
      totalPurchases,
      completedPurchases,
      purchasesToday,
      completedPurchaseTotals,
      uniqueBuyerGroups,
      recentPurchases,
    ] = await Promise.all([
      prisma.shopItem.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
        include: {
          _count: {
            select: {
              purchases: true,
              playerItems: true,
            },
          },
        },
      }),

      prisma.shopPurchase.count(),

      prisma.shopPurchase.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.shopPurchase.count({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: startOfToday,
          },
        },
      }),

      prisma.shopPurchase.aggregate({
        where: {
          status: "COMPLETED",
        },
        _sum: {
          totalPrice: true,
        },
      }),

      prisma.shopPurchase.groupBy({
        by: ["userId"],
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.shopPurchase.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        include: {
          user: {
            select: {
              id: true,
              telegramId: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          shopItem: {
            select: {
              id: true,
              key: true,
              title: true,
              category: true,
              acquisitionMethod: true,
            },
          },
        },
      }),
    ]);

    const activeItems = items.filter(
      (item) => item.isActive,
    ).length;

    const visibleItems = items.filter(
      (item) => item.isVisible,
    ).length;

    const disabledItems = items.filter(
      (item) => !item.isActive,
    ).length;

    const hiddenItems = items.filter(
      (item) => !item.isVisible,
    ).length;

    return NextResponse.json({
      ok: true,

      stats: {
        totalItems: items.length,
        activeItems,
        visibleItems,
        disabledItems,
        hiddenItems,
        totalPurchases,
        completedPurchases,
        purchasesToday,
        coinsSpent:
          completedPurchaseTotals._sum.totalPrice?.toString() ??
          "0",
        uniqueBuyers: uniqueBuyerGroups.length,
      },

      items: items.map(serializeShopItem),

      purchases: recentPurchases.map((purchase) => ({
        id: purchase.id,
        status: purchase.status,
        quantity: purchase.quantity.toString(),
        unitPrice: purchase.unitPrice.toString(),
        totalPrice: purchase.totalPrice.toString(),
        balanceBefore: purchase.balanceBefore.toString(),
        balanceAfter: purchase.balanceAfter.toString(),
        levelBefore: purchase.levelBefore,
        levelAfter: purchase.levelAfter,
        createdAt: purchase.createdAt.toISOString(),
        refundedAt: purchase.refundedAt?.toISOString() ?? null,
        user: {
          id: purchase.user.id,
          telegramId: purchase.user.telegramId.toString(),
          username: purchase.user.username,
          firstName: purchase.user.firstName,
          lastName: purchase.user.lastName,
        },
        item: {
          id: purchase.shopItem.id,
          key: purchase.shopItem.key,
          title: purchase.shopItem.title,
          category: purchase.shopItem.category,
          acquisitionMethod:
            purchase.shopItem.acquisitionMethod,
        },
      })),
    });
  } catch (error) {
    console.error(
      "Failed to load admin shop catalog:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load shop catalog.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  let body: CreateShopItemBody;

  try {
    body =
      (await request.json()) as CreateShopItemBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON body.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const title = normalizeRequiredString(
      body.title,
      "title",
      MAX_TITLE_LENGTH,
    );

    const description = normalizeOptionalString(
      body.description,
      "description",
      MAX_DESCRIPTION_LENGTH,
    );

    const key = createItemKey(body.key, title);

    const type = normalizeEnum(
      body.type,
      "type",
      itemTypeMap,
    );

    const category = normalizeEnum(
      body.category,
      "category",
      categoryMap,
    );

    const effect = inferEffect(
      body.effect,
      body.type,
    );

    const acquisitionMethod = normalizeEnum(
      body.acquisitionMethod ?? "purchase",
      "acquisitionMethod",
      acquisitionMethodMap,
    );

    const purchaseLimit = normalizeEnum(
      body.purchaseLimit ?? "unlimited",
      "purchaseLimit",
      purchaseLimitMap,
    );

    const hasPurchase =
      acquisitionMethod ===
        ShopAcquisitionMethod.PURCHASE ||
      acquisitionMethod ===
        ShopAcquisitionMethod.PURCHASE_OR_ACTION;

    const hasAction =
      acquisitionMethod ===
        ShopAcquisitionMethod.ACTION ||
      acquisitionMethod ===
        ShopAcquisitionMethod.PURCHASE_OR_ACTION;

    const basePrice = normalizeBigInt(
      body.basePrice,
      "basePrice",
      {
        defaultValue: hasPurchase ? undefined : 0n,
        minimum: 0n,
      },
    )!;

    if (hasPurchase && basePrice <= 0n) {
      throw new ShopValidationError(
        "basePrice must be greater than zero for purchasable items.",
      );
    }

    const {
      numerator: priceGrowthNumerator,
      denominator: priceGrowthDenominator,
    } = calculatePriceFraction(body);

    const effectValue = normalizeBigInt(
      body.effectValue,
      "effectValue",
      {
        defaultValue: 0n,
        minimum: 0n,
      },
    )!;

    const itemAmount = normalizeBigInt(
      body.itemAmount,
      "itemAmount",
      {
        defaultValue: 1n,
        minimum: 1n,
      },
    )!;

    const maxLevel = normalizeInteger(
      body.maxLevel,
      "maxLevel",
      {
        minimum: 1,
        nullable: true,
      },
    );

    const maximumPurchases = normalizeInteger(
      body.maximumPurchases,
      "maximumPurchases",
      {
        minimum: 1,
        nullable: true,
      },
    );

    if (
      purchaseLimit === ShopPurchaseLimit.ONCE &&
      maximumPurchases !== null &&
      maximumPurchases !== 1
    ) {
      throw new ShopValidationError(
        "maximumPurchases must be 1 when purchaseLimit is ONCE.",
      );
    }

    if (
      purchaseLimit === ShopPurchaseLimit.LIMITED &&
      maximumPurchases === null
    ) {
      throw new ShopValidationError(
        "maximumPurchases is required when purchaseLimit is LIMITED.",
      );
    }

    const normalizedMaximumPurchases =
      purchaseLimit === ShopPurchaseLimit.ONCE
        ? 1
        : purchaseLimit ===
            ShopPurchaseLimit.UNLIMITED
          ? null
          : maximumPurchases;

    const minimumVipLevel = normalizeInteger(
      body.minimumVipLevel,
      "minimumVipLevel",
      {
        defaultValue: 0,
        minimum: 0,
      },
    )!;

    const minimumPlayerLevel = normalizeInteger(
      body.minimumPlayerLevel,
      "minimumPlayerLevel",
      {
        defaultValue: 0,
        minimum: 0,
      },
    )!;

    const cosmeticId = normalizeOptionalString(
      body.cosmeticId,
      "cosmeticId",
      100,
    );

    const isCosmetic =
      effect === ShopItemEffect.TAP_SKIN ||
      effect === ShopItemEffect.AVATAR_FRAME ||
      effect === ShopItemEffect.CHARM;

    if (isCosmetic && !cosmeticId) {
      throw new ShopValidationError(
        "cosmeticId is required for cosmetic items.",
      );
    }

    if (!isCosmetic && cosmeticId) {
      throw new ShopValidationError(
        "cosmeticId can only be used for cosmetic items.",
      );
    }

    const unlockActionType =
      normalizeOptionalEnum(
        body.unlockActionType,
        "unlockActionType",
        unlockActionTypeMap,
      );

    const unlockVerification =
      normalizeOptionalEnum(
        body.unlockVerification,
        "unlockVerification",
        unlockVerificationMap,
      );

    if (
      hasAction &&
      (!unlockActionType || !unlockVerification)
    ) {
      throw new ShopValidationError(
        "unlockActionType and unlockVerification are required for action-based items.",
      );
    }

    const unlockInstructions =
      normalizeOptionalString(
        body.unlockInstructions,
        "unlockInstructions",
        MAX_INSTRUCTIONS_LENGTH,
      );

    const actionUrl = normalizeUrl(
      body.actionUrl,
      "actionUrl",
    );

    const telegramChannelUsername =
      normalizeOptionalString(
        body.telegramChannelUsername,
        "telegramChannelUsername",
        MAX_TELEGRAM_VALUE_LENGTH,
      );

    const telegramChatId =
      normalizeOptionalString(
        body.telegramChatId,
        "telegramChatId",
        MAX_TELEGRAM_VALUE_LENGTH,
      );

    if (
      unlockActionType ===
        ShopUnlockActionType.TELEGRAM_CHANNEL &&
      !telegramChannelUsername &&
      !telegramChatId
    ) {
      throw new ShopValidationError(
        "Telegram channel username or chat ID is required.",
      );
    }

    if (
      unlockActionType ===
        ShopUnlockActionType.OPEN_LINK &&
      !actionUrl
    ) {
      throw new ShopValidationError(
        "actionUrl is required for OPEN_LINK.",
      );
    }

    const targetValue = normalizeBigInt(
      body.targetValue,
      "targetValue",
      {
        minimum: 1n,
        nullable: true,
      },
    );

    const requiresTarget =
      unlockActionType ===
        ShopUnlockActionType.TAP_COUNT ||
      unlockActionType ===
        ShopUnlockActionType.REFERRALS ||
      unlockActionType ===
        ShopUnlockActionType.VIP_LEVEL;

    if (requiresTarget && targetValue === null) {
      throw new ShopValidationError(
        "targetValue is required for this unlock action.",
      );
    }

    const startsAt = normalizeDate(
      body.startsAt,
      "startsAt",
    );

    const endsAt = normalizeDate(
      body.endsAt,
      "endsAt",
    );

    if (
      startsAt &&
      endsAt &&
      startsAt.getTime() >= endsAt.getTime()
    ) {
      throw new ShopValidationError(
        "endsAt must be later than startsAt.",
      );
    }

    const imageUrl = normalizeUrl(
      body.imageUrl,
      "imageUrl",
    );

    const sortOrder = normalizeInteger(
      body.sortOrder,
      "sortOrder",
      {
        defaultValue: 0,
        minimum: 0,
      },
    )!;

    const isActive = normalizeBoolean(
      body.isActive,
      true,
      "isActive",
    );

    const isVisible = normalizeBoolean(
      body.isVisible,
      true,
      "isVisible",
    );

    const isFeatured = normalizeBoolean(
      body.isFeatured,
      false,
      "isFeatured",
    );

    const requirements = normalizeJsonObject(
      body.requirements,
      "requirements",
    );

    const metadata = normalizeJsonObject(
      body.metadata,
      "metadata",
    );

    const duplicate = await prisma.shopItem.findFirst(
      {
        where: {
          OR: [
            {
              key,
            },
            ...(cosmeticId
              ? [
                  {
                    cosmeticId,
                  },
                ]
              : []),
          ],
        },
        select: {
          id: true,
          key: true,
          cosmeticId: true,
        },
      },
    );

    if (duplicate) {
      const duplicateField =
        duplicate.key === key
          ? "key"
          : "cosmeticId";

      throw new ShopValidationError(
        `A shop item with this ${duplicateField} already exists.`,
      );
    }

    const item = await prisma.$transaction(
      async (transaction) => {
        const createdItem =
          await transaction.shopItem.create({
            data: {
              key,

              title,
              description,

              type,
              category,
              effect,
              acquisitionMethod,
              purchaseLimit,

              imageUrl,

              basePrice,
              priceGrowthNumerator,
              priceGrowthDenominator,

              effectValue,
              itemAmount,

              maxLevel,
              maximumPurchases:
                normalizedMaximumPurchases,

              minimumVipLevel,
              minimumPlayerLevel,

              cosmeticId,

              unlockActionType: hasAction
                ? unlockActionType
                : null,

              unlockVerification: hasAction
                ? unlockVerification
                : null,

              unlockInstructions: hasAction
                ? unlockInstructions
                : null,

              actionUrl: hasAction
                ? actionUrl
                : null,

              telegramChannelUsername: hasAction
                ? telegramChannelUsername
                : null,

              telegramChatId: hasAction
                ? telegramChatId
                : null,

              targetValue: hasAction
                ? targetValue
                : null,

              startsAt,
              endsAt,

              sortOrder,

              isActive,
              isVisible,
              isFeatured,

              requirements,
              metadata,
            },

            include: {
              _count: {
                select: {
                  purchases: true,
                  playerItems: true,
                },
              },
            },
          });

        await transaction.adminAuditLog.create({
          data: {
            actor: "browser-admin",
            action: "SHOP_ITEM_CREATE",
            entityType: "ShopItem",
            entityId: createdItem.id,

            afterState: {
              id: createdItem.id,
              key: createdItem.key,
              title: createdItem.title,
              type: createdItem.type,
              category: createdItem.category,
              effect: createdItem.effect,
              acquisitionMethod:
                createdItem.acquisitionMethod,
              purchaseLimit:
                createdItem.purchaseLimit,
              basePrice:
                createdItem.basePrice.toString(),
              isActive: createdItem.isActive,
              isVisible: createdItem.isVisible,
            },
          },
        });

        return createdItem;
      },
    );

    return NextResponse.json(
      {
        ok: true,
        item: serializeShopItem(item),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof ShopValidationError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to create shop item:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create shop item.",
      },
      {
        status: 500,
      },
    );
  }
}