import {
  Prisma,
  type ShopItemCategory,
  type ShopItemEffect,
  type ShopItemType,
} from "@/generated/prisma/client";
import { syncPlayerEnergy } from "@/lib/playerEnergy";
import { prisma } from "@/lib/prisma";

const MAX_TRANSACTION_RETRIES = 5;

type ShopItemWithPlayerState =
  Prisma.ShopItemGetPayload<{
    include: {
      playerItems: {
        select: {
          level: true;
          quantity: true;
          purchaseCount: true;
          isOwned: true;
          isEquipped: true;
          purchasedAt: true;
          equippedAt: true;
        };
      };
    };
  }>;

type PlayerGameStateRecord = Awaited<
  ReturnType<
    typeof prisma.playerGameState.findUniqueOrThrow
  >
>;

type PlayerShopItemRecord = Awaited<
  ReturnType<
    typeof prisma.playerShopItem.findUniqueOrThrow
  >
>;

type ShopPurchaseRecord = Awaited<
  ReturnType<
    typeof prisma.shopPurchase.findUniqueOrThrow
  >
>;

type CosmeticEffect =
  | "TAP_SKIN"
  | "AVATAR_FRAME"
  | "CHARM";

export type SerializedPlayerShopItem = {
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

  metadata: Prisma.JsonValue | null;

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

export type PlayerShopPurchaseResult = {
  state: PlayerGameStateRecord;
  playerItem: PlayerShopItemRecord;
  purchase: ShopPurchaseRecord;

  duplicate: boolean;

  itemId: string;
  itemKey: string;

  quantity: bigint;
  unitPrice: bigint;
  totalPrice: bigint;

  balanceBefore: bigint;
  balanceAfter: bigint;

  levelBefore: number;
  levelAfter: number;
};

export type PlayerShopEquipmentResult = {
  itemId: string;
  itemKey: string;
  effect: CosmeticEffect;

  isEquipped: boolean;
  changed: boolean;

  playerItem: PlayerShopItemRecord;
};

export type PlayerShopErrorCode =
  | "INVALID_PRICE_CONFIGURATION"
  | "INVALID_PLAYER_SHOP_STATE"
  | "INVALID_REQUEST_ID"
  | "PLAYER_STATE_NOT_FOUND"
  | "PLAYER_BLOCKED"
  | "SHOP_ITEM_NOT_FOUND"
  | "SHOP_ITEM_UNAVAILABLE"
  | "SHOP_ITEM_NOT_PURCHASABLE"
  | "SHOP_ITEM_NOT_OWNED"
  | "SHOP_ITEM_NOT_EQUIPPABLE"
  | "VIP_LEVEL_REQUIRED"
  | "PLAYER_LEVEL_REQUIRED"
  | "PURCHASE_LIMIT_REACHED"
  | "MAX_LEVEL_REACHED"
  | "INSUFFICIENT_BALANCE"
  | "UNSUPPORTED_SHOP_EFFECT"
  | "IDEMPOTENCY_CONFLICT"
  | "CONCURRENT_UPDATE_FAILED";

export class PlayerShopError extends Error {
  readonly code: PlayerShopErrorCode;

  constructor(
    code: PlayerShopErrorCode,
    message: string,
  ) {
    super(message);

    this.name = "PlayerShopError";
    this.code = code;
  }
}

function normalizeUserId(
  userId: string,
): string {
  const normalizedUserId =
    userId.trim();

  if (!normalizedUserId) {
    throw new PlayerShopError(
      "INVALID_PLAYER_SHOP_STATE",
      "Player user id is required.",
    );
  }

  return normalizedUserId;
}

function normalizeRequestId(
  requestId: string,
): string {
  const normalizedRequestId =
    requestId.trim();

  const hasValidLength =
    normalizedRequestId.length >= 16 &&
    normalizedRequestId.length <= 128;

  const hasSafeCharacters =
    /^[A-Za-z0-9_-]+$/.test(
      normalizedRequestId,
    );

  if (
    !hasValidLength ||
    !hasSafeCharacters
  ) {
    throw new PlayerShopError(
      "INVALID_REQUEST_ID",
      "Shop request ID is invalid.",
    );
  }

  return normalizedRequestId;
}

function normalizeShopItemId(
  shopItemId: string,
): string {
  const normalizedShopItemId =
    shopItemId.trim();

  if (!normalizedShopItemId) {
    throw new PlayerShopError(
      "SHOP_ITEM_NOT_FOUND",
      "Shop item id is required.",
    );
  }

  return normalizedShopItemId;
}

function calculateCurrentPrice(params: {
  basePrice: bigint;
  numerator: bigint;
  denominator: bigint;
  level: number;
}): bigint {
  const {
    basePrice,
    numerator,
    denominator,
    level,
  } = params;

  if (basePrice < BigInt(0)) {
    throw new PlayerShopError(
      "INVALID_PRICE_CONFIGURATION",
      "Shop item base price cannot be negative.",
    );
  }

  if (numerator <= BigInt(0)) {
    throw new PlayerShopError(
      "INVALID_PRICE_CONFIGURATION",
      "Shop item price growth numerator must be greater than zero.",
    );
  }

  if (denominator <= BigInt(0)) {
    throw new PlayerShopError(
      "INVALID_PRICE_CONFIGURATION",
      "Shop item price growth denominator must be greater than zero.",
    );
  }

  if (
    !Number.isSafeInteger(level) ||
    level < 0
  ) {
    throw new PlayerShopError(
      "INVALID_PLAYER_SHOP_STATE",
      "Player shop item level is invalid.",
    );
  }

  let price = basePrice;

  for (
    let currentLevel = 0;
    currentLevel < level;
    currentLevel += 1
  ) {
    price =
      (price * numerator) /
      denominator;
  }

  return price;
}

function validatePlayerItemState(
  item: ShopItemWithPlayerState,
): void {
  const playerItem =
    item.playerItems[0];

  if (!playerItem) {
    return;
  }

  if (
    !Number.isSafeInteger(
      playerItem.level,
    ) ||
    playerItem.level < 0
  ) {
    throw new PlayerShopError(
      "INVALID_PLAYER_SHOP_STATE",
      `Player level for shop item "${item.key}" is invalid.`,
    );
  }

  if (
    playerItem.quantity < BigInt(0)
  ) {
    throw new PlayerShopError(
      "INVALID_PLAYER_SHOP_STATE",
      `Player quantity for shop item "${item.key}" cannot be negative.`,
    );
  }

  if (
    !Number.isSafeInteger(
      playerItem.purchaseCount,
    ) ||
    playerItem.purchaseCount < 0
  ) {
    throw new PlayerShopError(
      "INVALID_PLAYER_SHOP_STATE",
      `Player purchase count for shop item "${item.key}" is invalid.`,
    );
  }

  if (
    playerItem.isEquipped &&
    !playerItem.isOwned
  ) {
    throw new PlayerShopError(
      "INVALID_PLAYER_SHOP_STATE",
      `Shop item "${item.key}" cannot be equipped when it is not owned.`,
    );
  }
}

function serializeShopItem(
  item: ShopItemWithPlayerState,
): SerializedPlayerShopItem {
  validatePlayerItemState(item);

  const playerItem =
    item.playerItems[0] ?? null;

  const level =
    playerItem?.level ?? 0;

  const quantity =
    playerItem?.quantity ?? BigInt(0);

  const isMaxLevel =
    item.maxLevel !== null &&
    level >= item.maxLevel;

  const currentPrice =
    calculateCurrentPrice({
      basePrice: item.basePrice,
      numerator:
        item.priceGrowthNumerator,
      denominator:
        item.priceGrowthDenominator,
      level,
    });

  return {
    id: item.id,
    key: item.key,

    type: item.type,
    category: item.category,
    effect: item.effect,

    title: item.title,
    description: item.description,

    imageUrl: item.imageUrl,
    cosmeticId: item.cosmeticId,

    basePrice:
      item.basePrice.toString(),

    currentPrice:
      currentPrice.toString(),

    priceGrowthNumerator:
      item.priceGrowthNumerator.toString(),

    priceGrowthDenominator:
      item.priceGrowthDenominator.toString(),

    effectValue:
      item.effectValue.toString(),

    maxLevel: item.maxLevel,

    sortOrder: item.sortOrder,

    metadata: item.metadata,

    player: {
      level,
      quantity:
        quantity.toString(),

      purchaseCount:
        playerItem?.purchaseCount ?? 0,

      isOwned:
        playerItem?.isOwned ?? false,

      isEquipped:
        playerItem?.isEquipped ?? false,

      purchasedAt:
        playerItem?.purchasedAt?.toISOString() ??
        null,

      equippedAt:
        playerItem?.equippedAt?.toISOString() ??
        null,

      isMaxLevel,
    },
  };
}

function assertItemAvailability(params: {
  item: {
    key: string;
    deletedAt: Date | null;
    isActive: boolean;
    isVisible: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    minimumVipLevel: number;
    minimumPlayerLevel: number;
  };
  vipLevel: number;
  now: Date;
}) {
  const {
    item,
    vipLevel,
    now,
  } = params;

  if (
    item.deletedAt !== null ||
    !item.isActive ||
    !item.isVisible
  ) {
    throw new PlayerShopError(
      "SHOP_ITEM_UNAVAILABLE",
      `Shop item "${item.key}" is unavailable.`,
    );
  }

  if (
    item.startsAt !== null &&
    item.startsAt.getTime() >
      now.getTime()
  ) {
    throw new PlayerShopError(
      "SHOP_ITEM_UNAVAILABLE",
      `Shop item "${item.key}" is not available yet.`,
    );
  }

  if (
    item.endsAt !== null &&
    item.endsAt.getTime() <=
      now.getTime()
  ) {
    throw new PlayerShopError(
      "SHOP_ITEM_UNAVAILABLE",
      `Shop item "${item.key}" is no longer available.`,
    );
  }

  if (
    vipLevel <
    item.minimumVipLevel
  ) {
    throw new PlayerShopError(
      "VIP_LEVEL_REQUIRED",
      `Shop item "${item.key}" requires a higher VIP level.`,
    );
  }

  if (
    item.minimumPlayerLevel > 0
  ) {
    throw new PlayerShopError(
      "PLAYER_LEVEL_REQUIRED",
      `Shop item "${item.key}" requires a player level that is not yet supported by PlayerGameState.`,
    );
  }
}

function assertPurchaseAllowed(params: {
  item: {
    key: string;
    type: ShopItemType;
    acquisitionMethod:
      | "PURCHASE"
      | "ACTION"
      | "PURCHASE_OR_ACTION"
      | "FREE";
    purchaseLimit:
      | "ONCE"
      | "LIMITED"
      | "UNLIMITED";
    maximumPurchases: number | null;
    maxLevel: number | null;
  };
  playerItem:
    | {
        level: number;
        purchaseCount: number;
        isOwned: boolean;
      }
    | null;
}) {
  const {
    item,
    playerItem,
  } = params;

  if (
    item.acquisitionMethod !==
      "PURCHASE" &&
    item.acquisitionMethod !==
      "PURCHASE_OR_ACTION"
  ) {
    throw new PlayerShopError(
      "SHOP_ITEM_NOT_PURCHASABLE",
      `Shop item "${item.key}" cannot be purchased with balance.`,
    );
  }

  const purchaseCount =
    playerItem?.purchaseCount ?? 0;

  if (
    item.purchaseLimit ===
      "ONCE" &&
    purchaseCount >= 1
  ) {
    throw new PlayerShopError(
      "PURCHASE_LIMIT_REACHED",
      `Shop item "${item.key}" can only be purchased once.`,
    );
  }

  if (
    item.purchaseLimit ===
      "LIMITED"
  ) {
    if (
      item.maximumPurchases === null ||
      !Number.isSafeInteger(
        item.maximumPurchases,
      ) ||
      item.maximumPurchases <= 0
    ) {
      throw new PlayerShopError(
        "INVALID_PLAYER_SHOP_STATE",
        `Shop item "${item.key}" has an invalid purchase limit configuration.`,
      );
    }

    if (
      purchaseCount >=
      item.maximumPurchases
    ) {
      throw new PlayerShopError(
        "PURCHASE_LIMIT_REACHED",
        `Shop item "${item.key}" has reached its purchase limit.`,
      );
    }
  }

  if (
    item.type === "COSMETIC" &&
    playerItem?.isOwned
  ) {
    throw new PlayerShopError(
      "PURCHASE_LIMIT_REACHED",
      `Cosmetic shop item "${item.key}" is already owned.`,
    );
  }

  const currentLevel =
    playerItem?.level ?? 0;

  if (
    item.maxLevel !== null &&
    currentLevel >= item.maxLevel
  ) {
    throw new PlayerShopError(
      "MAX_LEVEL_REACHED",
      `Shop item "${item.key}" has reached its maximum level.`,
    );
  }
}

function getCosmeticEffect(
  item: {
    key: string;
    type: ShopItemType;
    effect: ShopItemEffect;
  },
): CosmeticEffect {
  if (item.type !== "COSMETIC") {
    throw new PlayerShopError(
      "SHOP_ITEM_NOT_EQUIPPABLE",
      `Shop item "${item.key}" is not a cosmetic item.`,
    );
  }

  switch (item.effect) {
    case "TAP_SKIN":
    case "AVATAR_FRAME":
    case "CHARM":
      return item.effect;

    default:
      throw new PlayerShopError(
        "SHOP_ITEM_NOT_EQUIPPABLE",
        `Shop item "${item.key}" does not use an equippable cosmetic effect.`,
      );
  }
}

function isRetryableTransactionError(
  error: unknown,
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

function isUniqueConstraintError(
  error: unknown,
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function findDuplicatePurchase(params: {
  userId: string;
  shopItemId: string;
  idempotencyKey: string;
}): Promise<PlayerShopPurchaseResult | null> {
  const {
    userId,
    shopItemId,
    idempotencyKey,
  } = params;

  const existingPurchase =
    await prisma.shopPurchase.findUnique({
      where: {
        idempotencyKey,
      },
    });

  if (!existingPurchase) {
    return null;
  }

  if (
    existingPurchase.userId !==
      userId ||
    existingPurchase.shopItemId !==
      shopItemId
  ) {
    throw new PlayerShopError(
      "IDEMPOTENCY_CONFLICT",
      "Shop request ID has already been used for another operation.",
    );
  }

  const [
    state,
    playerItem,
    shopItem,
  ] = await Promise.all([
    prisma.playerGameState.findUnique({
      where: {
        userId,
      },
    }),

    prisma.playerShopItem.findUnique({
      where: {
        userId_shopItemId: {
          userId,
          shopItemId,
        },
      },
    }),

    prisma.shopItem.findUnique({
      where: {
        id: shopItemId,
      },
      select: {
        key: true,
      },
    }),
  ]);

  if (!state) {
    throw new PlayerShopError(
      "PLAYER_STATE_NOT_FOUND",
      "Player game state does not exist.",
    );
  }

  if (!playerItem) {
    throw new PlayerShopError(
      "INVALID_PLAYER_SHOP_STATE",
      "Player shop item state does not exist for a completed purchase.",
    );
  }

  if (!shopItem) {
    throw new PlayerShopError(
      "SHOP_ITEM_NOT_FOUND",
      "Purchased shop item does not exist.",
    );
  }

  return {
    state,
    playerItem,
    purchase:
      existingPurchase,

    duplicate: true,

    itemId:
      existingPurchase.shopItemId,

    itemKey:
      shopItem.key,

    quantity:
      existingPurchase.quantity,

    unitPrice:
      existingPurchase.unitPrice,

    totalPrice:
      existingPurchase.totalPrice,

    balanceBefore:
      existingPurchase.balanceBefore,

    balanceAfter:
      existingPurchase.balanceAfter,

    levelBefore:
      existingPurchase.levelBefore ?? 0,

    levelAfter:
      existingPurchase.levelAfter ?? 0,
  };
}

async function executePurchaseTransaction(
  params: {
    userId: string;
    shopItemId: string;
    idempotencyKey: string;
    now: Date;
  },
): Promise<PlayerShopPurchaseResult> {
  const {
    userId,
    shopItemId,
    idempotencyKey,
    now,
  } = params;

  return prisma.$transaction(
    async (transaction) => {
      const existingPurchase =
        await transaction.shopPurchase.findUnique(
          {
            where: {
              idempotencyKey,
            },
          },
        );

      if (existingPurchase) {
        if (
          existingPurchase.userId !==
            userId ||
          existingPurchase.shopItemId !==
            shopItemId
        ) {
          throw new PlayerShopError(
            "IDEMPOTENCY_CONFLICT",
            "Shop request ID has already been used for another operation.",
          );
        }

        const [
          currentState,
          currentPlayerItem,
          currentItem,
        ] = await Promise.all([
          transaction.playerGameState.findUnique(
            {
              where: {
                userId,
              },
            },
          ),

          transaction.playerShopItem.findUnique(
            {
              where: {
                userId_shopItemId: {
                  userId,
                  shopItemId,
                },
              },
            },
          ),

          transaction.shopItem.findUnique({
            where: {
              id: shopItemId,
            },
            select: {
              key: true,
            },
          }),
        ]);

        if (!currentState) {
          throw new PlayerShopError(
            "PLAYER_STATE_NOT_FOUND",
            "Player game state does not exist.",
          );
        }

        if (!currentPlayerItem) {
          throw new PlayerShopError(
            "INVALID_PLAYER_SHOP_STATE",
            "Player shop item state does not exist for a completed purchase.",
          );
        }

        if (!currentItem) {
          throw new PlayerShopError(
            "SHOP_ITEM_NOT_FOUND",
            "Purchased shop item does not exist.",
          );
        }

        return {
          state: currentState,
          playerItem:
            currentPlayerItem,
          purchase:
            existingPurchase,

          duplicate: true,

          itemId: shopItemId,
          itemKey: currentItem.key,

          quantity:
            existingPurchase.quantity,

          unitPrice:
            existingPurchase.unitPrice,

          totalPrice:
            existingPurchase.totalPrice,

          balanceBefore:
            existingPurchase.balanceBefore,

          balanceAfter:
            existingPurchase.balanceAfter,

          levelBefore:
            existingPurchase.levelBefore ??
            0,

          levelAfter:
            existingPurchase.levelAfter ??
            0,
        };
      }

      const [
        state,
        item,
        playerItem,
      ] = await Promise.all([
        transaction.playerGameState.findUnique(
          {
            where: {
              userId,
            },
          },
        ),

        transaction.shopItem.findUnique({
          where: {
            id: shopItemId,
          },
        }),

        transaction.playerShopItem.findUnique(
          {
            where: {
              userId_shopItemId: {
                userId,
                shopItemId,
              },
            },
          },
        ),
      ]);

      if (!state) {
        throw new PlayerShopError(
          "PLAYER_STATE_NOT_FOUND",
          "Player game state does not exist.",
        );
      }

      if (state.isBlocked) {
        throw new PlayerShopError(
          "PLAYER_BLOCKED",
          "Player account is blocked.",
        );
      }

      if (!item) {
        throw new PlayerShopError(
          "SHOP_ITEM_NOT_FOUND",
          "Shop item does not exist.",
        );
      }

      assertItemAvailability({
        item,
        vipLevel: state.vipLevel,
        now,
      });

      assertPurchaseAllowed({
        item,
        playerItem,
      });

      const levelBefore =
        playerItem?.level ?? 0;

      const quantityBefore =
        playerItem?.quantity ??
        BigInt(0);

      const purchaseCountBefore =
        playerItem?.purchaseCount ?? 0;

      const unitPrice =
        calculateCurrentPrice({
          basePrice: item.basePrice,
          numerator:
            item.priceGrowthNumerator,
          denominator:
            item.priceGrowthDenominator,
          level: levelBefore,
        });

      if (unitPrice < BigInt(0)) {
        throw new PlayerShopError(
          "INVALID_PRICE_CONFIGURATION",
          "Shop item price cannot be negative.",
        );
      }

      if (
        state.balance < unitPrice
      ) {
        throw new PlayerShopError(
          "INSUFFICIENT_BALANCE",
          "Player does not have enough balance for this purchase.",
        );
      }

      if (
        item.itemAmount <= BigInt(0)
      ) {
        throw new PlayerShopError(
          "INVALID_PLAYER_SHOP_STATE",
          `Shop item "${item.key}" item amount must be greater than zero.`,
        );
      }

      if (
        item.effectValue < BigInt(0)
      ) {
        throw new PlayerShopError(
          "INVALID_PLAYER_SHOP_STATE",
          `Shop item "${item.key}" effect value cannot be negative.`,
        );
      }

      const levelIncrease =
        item.type === "UPGRADE"
          ? 1
          : 0;

      const levelAfter =
        levelBefore + levelIncrease;

      if (
        item.maxLevel !== null &&
        levelAfter > item.maxLevel
      ) {
        throw new PlayerShopError(
          "MAX_LEVEL_REACHED",
          `Shop item "${item.key}" would exceed its maximum level.`,
        );
      }

      const quantityIncrease =
        item.type === "UPGRADE"
          ? BigInt(0)
          : item.itemAmount;

      const quantityAfter =
        quantityBefore +
        quantityIncrease;

      const purchaseCountAfter =
        purchaseCountBefore + 1;

      const balanceBefore =
        state.balance;

      const balanceAfter =
        balanceBefore - unitPrice;

      let nextEnergy =
        state.energy;

      let nextMaxEnergy =
        state.maxEnergy;

      let nextTapPower =
        state.tapPower;

      let nextVipPoints =
        state.vipPoints;

      switch (item.effect) {
        case "TAP_POWER": {
          if (
            item.effectValue <=
            BigInt(0)
          ) {
            throw new PlayerShopError(
              "INVALID_PLAYER_SHOP_STATE",
              `Tap-power item "${item.key}" must have a positive effect value.`,
            );
          }

          nextTapPower +=
            item.effectValue;

          break;
        }

        case "MAX_ENERGY": {
          if (
            item.effectValue <=
            BigInt(0)
          ) {
            throw new PlayerShopError(
              "INVALID_PLAYER_SHOP_STATE",
              `Max-energy item "${item.key}" must have a positive effect value.`,
            );
          }

          nextMaxEnergy +=
            item.effectValue;

          break;
        }

        case "FULL_ENERGY": {
          nextEnergy =
            state.maxEnergy;

          break;
        }

        case "VIP_POINTS": {
          if (
            item.effectValue <=
            BigInt(0)
          ) {
            throw new PlayerShopError(
              "INVALID_PLAYER_SHOP_STATE",
              `VIP-points item "${item.key}" must have a positive effect value.`,
            );
          }

          nextVipPoints +=
            item.effectValue;

          break;
        }

        case "TAP_SKIN":
        case "AVATAR_FRAME":
        case "CHARM":
        case "SPECIAL_ITEM": {
          break;
        }

        case "ENERGY_RESTORE_AMOUNT": {
          throw new PlayerShopError(
            "UNSUPPORTED_SHOP_EFFECT",
            "Per-player energy restore amount is not present in PlayerGameState.",
          );
        }

        case "COINS": {
          throw new PlayerShopError(
            "UNSUPPORTED_SHOP_EFFECT",
            "Buying a coin package with the same coin balance requires a separate payment source.",
          );
        }

        default: {
          const exhaustiveEffect:
            never = item.effect;

          throw new PlayerShopError(
            "UNSUPPORTED_SHOP_EFFECT",
            `Unsupported shop item effect: ${String(
              exhaustiveEffect,
            )}.`,
          );
        }
      }

      const gameStateUpdate =
        await transaction.playerGameState.updateMany(
          {
            where: {
              id: state.id,
              revision:
                state.revision,
            },

            data: {
              balance:
                balanceAfter,

              energy:
                nextEnergy,

              maxEnergy:
                nextMaxEnergy,

              tapPower:
                nextTapPower,

              vipPoints:
                nextVipPoints,

              revision: {
                increment: 1,
              },
            },
          },
        );

      if (
        gameStateUpdate.count !== 1
      ) {
        throw new PlayerShopError(
          "CONCURRENT_UPDATE_FAILED",
          "Player state was changed concurrently.",
        );
      }

      const updatedPlayerItem =
        await transaction.playerShopItem.upsert(
          {
            where: {
              userId_shopItemId: {
                userId,
                shopItemId,
              },
            },

            create: {
              userId,
              shopItemId,

              level:
                levelAfter,

              quantity:
                quantityAfter,

              purchaseCount:
                purchaseCountAfter,

              isOwned: true,
              isEquipped: false,

              purchasedAt: now,
            },

            update: {
              level:
                levelAfter,

              quantity:
                quantityAfter,

              purchaseCount:
                purchaseCountAfter,

              isOwned: true,

              purchasedAt:
                playerItem?.purchasedAt ??
                now,
            },
          },
        );

      const purchase =
        await transaction.shopPurchase.create(
          {
            data: {
              userId,
              shopItemId,

              idempotencyKey,

              status: "COMPLETED",

              quantity: BigInt(1),

              unitPrice,
              totalPrice:
                unitPrice,

              balanceBefore,
              balanceAfter,

              levelBefore,
              levelAfter,

              gameStateRevisionBefore:
                state.revision,

              gameStateRevisionAfter:
                state.revision + 1,

              metadata: {
                itemKey: item.key,
                itemType: item.type,
                itemCategory:
                  item.category,
                itemEffect:
                  item.effect,
                itemAmount:
                  item.itemAmount.toString(),
                effectValue:
                  item.effectValue.toString(),
                purchaseCountBefore,
                purchaseCountAfter,
              },
            },
          },
        );

      await transaction.balanceTransaction.create(
        {
          data: {
            userId,

            direction: "DEBIT",
            source:
              "SHOP_PURCHASE",

            amount: unitPrice,

            balanceBefore,
            balanceAfter,

            idempotencyKey:
              `${idempotencyKey}:balance`,

            referenceType:
              "ShopPurchase",

            referenceId:
              purchase.id,

            description:
              `Purchase of shop item "${item.title}"`,

            createdBy: "player",

            metadata: {
              shopItemId:
                item.id,
              shopItemKey:
                item.key,
              shopPurchaseId:
                purchase.id,
            },
          },
        },
      );

      const updatedState =
        await transaction.playerGameState.findUnique(
          {
            where: {
              id: state.id,
            },
          },
        );

      if (!updatedState) {
        throw new PlayerShopError(
          "PLAYER_STATE_NOT_FOUND",
          "Player state disappeared after the shop purchase.",
        );
      }

      return {
        state:
          updatedState,

        playerItem:
          updatedPlayerItem,

        purchase,

        duplicate: false,

        itemId: item.id,
        itemKey: item.key,

        quantity: BigInt(1),

        unitPrice,
        totalPrice:
          unitPrice,

        balanceBefore,
        balanceAfter,

        levelBefore,
        levelAfter,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}

async function executeEquipmentTransaction(
  params: {
    userId: string;
    shopItemId: string;
    shouldEquip: boolean;
    now: Date;
  },
): Promise<PlayerShopEquipmentResult> {
  const {
    userId,
    shopItemId,
    shouldEquip,
    now,
  } = params;

  return prisma.$transaction(
    async (transaction) => {
      const [
        state,
        item,
        playerItem,
      ] = await Promise.all([
        transaction.playerGameState.findUnique(
          {
            where: {
              userId,
            },
            select: {
              isBlocked: true,
            },
          },
        ),

        transaction.shopItem.findUnique({
          where: {
            id: shopItemId,
          },
          select: {
            id: true,
            key: true,
            type: true,
            effect: true,
          },
        }),

        transaction.playerShopItem.findUnique(
          {
            where: {
              userId_shopItemId: {
                userId,
                shopItemId,
              },
            },
          },
        ),
      ]);

      if (!state) {
        throw new PlayerShopError(
          "PLAYER_STATE_NOT_FOUND",
          "Player game state does not exist.",
        );
      }

      if (state.isBlocked) {
        throw new PlayerShopError(
          "PLAYER_BLOCKED",
          "Player account is blocked.",
        );
      }

      if (!item) {
        throw new PlayerShopError(
          "SHOP_ITEM_NOT_FOUND",
          "Shop item does not exist.",
        );
      }

      const cosmeticEffect =
        getCosmeticEffect(item);

      if (
        !playerItem ||
        !playerItem.isOwned
      ) {
        throw new PlayerShopError(
          "SHOP_ITEM_NOT_OWNED",
          `Shop item "${item.key}" is not owned by the player.`,
        );
      }

      if (
        playerItem.isEquipped ===
        shouldEquip
      ) {
        return {
          itemId: item.id,
          itemKey: item.key,
          effect:
            cosmeticEffect,

          isEquipped:
            playerItem.isEquipped,

          changed: false,

          playerItem,
        };
      }

      if (
        shouldEquip &&
        (
          cosmeticEffect ===
            "TAP_SKIN" ||
          cosmeticEffect ===
            "AVATAR_FRAME"
        )
      ) {
        await transaction.playerShopItem.updateMany(
          {
            where: {
              userId,
              isEquipped: true,

              shopItem: {
                effect:
                  cosmeticEffect,
              },

              NOT: {
                shopItemId,
              },
            },

            data: {
              isEquipped: false,
              equippedAt: null,
            },
          },
        );
      }

      const updatedPlayerItem =
        await transaction.playerShopItem.update(
          {
            where: {
              userId_shopItemId: {
                userId,
                shopItemId,
              },
            },

            data: {
              isEquipped:
                shouldEquip,

              equippedAt:
                shouldEquip
                  ? now
                  : null,
            },
          },
        );

      return {
        itemId: item.id,
        itemKey: item.key,
        effect:
          cosmeticEffect,

        isEquipped:
          updatedPlayerItem.isEquipped,

        changed: true,

        playerItem:
          updatedPlayerItem,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}

export async function getPlayerShopCatalog(
  userId: string,
): Promise<
  SerializedPlayerShopItem[]
> {
  const normalizedUserId =
    normalizeUserId(userId);

  const now = new Date();

  const [
    gameState,
    items,
  ] = await prisma.$transaction([
    prisma.playerGameState.findUnique({
      where: {
        userId:
          normalizedUserId,
      },

      select: {
        vipLevel: true,
        isBlocked: true,
      },
    }),

    prisma.shopItem.findMany({
      where: {
        deletedAt: null,

        isActive: true,
        isVisible: true,

        minimumPlayerLevel: {
          lte: 0,
        },

        AND: [
          {
            OR: [
              {
                startsAt: null,
              },
              {
                startsAt: {
                  lte: now,
                },
              },
            ],
          },
          {
            OR: [
              {
                endsAt: null,
              },
              {
                endsAt: {
                  gt: now,
                },
              },
            ],
          },
        ],
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
        {
          id: "asc",
        },
      ],

      include: {
        playerItems: {
          where: {
            userId:
              normalizedUserId,
          },

          select: {
            level: true,
            quantity: true,
            purchaseCount: true,
            isOwned: true,
            isEquipped: true,
            purchasedAt: true,
            equippedAt: true,
          },

          take: 1,
        },
      },
    }),
  ]);

  if (!gameState) {
    throw new PlayerShopError(
      "PLAYER_STATE_NOT_FOUND",
      "Player game state does not exist.",
    );
  }

  if (gameState.isBlocked) {
    throw new PlayerShopError(
      "PLAYER_BLOCKED",
      "Player account is blocked.",
    );
  }

  return items
    .filter(
      (item) =>
        item.minimumVipLevel <=
        gameState.vipLevel,
    )
    .map(serializeShopItem);
}

export async function purchasePlayerShopItem(
  params: {
    userId: string;
    shopItemId: string;
    requestId: string;
    now?: Date;
  },
): Promise<PlayerShopPurchaseResult> {
  const userId =
    normalizeUserId(
      params.userId,
    );

  const shopItemId =
    normalizeShopItemId(
      params.shopItemId,
    );

  const requestId =
    normalizeRequestId(
      params.requestId,
    );

  const now =
    params.now ?? new Date();

  const idempotencyKey =
    `shop-purchase:${userId}:${requestId}`;

  const duplicatePurchase =
    await findDuplicatePurchase({
      userId,
      shopItemId,
      idempotencyKey,
    });

  if (duplicatePurchase) {
    return duplicatePurchase;
  }

  await syncPlayerEnergy(
    userId,
    now,
  );

  for (
    let attempt = 1;
    attempt <=
    MAX_TRANSACTION_RETRIES;
    attempt += 1
  ) {
    try {
      return await executePurchaseTransaction(
        {
          userId,
          shopItemId,
          idempotencyKey,
          now,
        },
      );
    } catch (error) {
      if (
        isUniqueConstraintError(
          error,
        )
      ) {
        const duplicate =
          await findDuplicatePurchase(
            {
              userId,
              shopItemId,
              idempotencyKey,
            },
          );

        if (duplicate) {
          return duplicate;
        }
      }

      if (
        isRetryableTransactionError(
          error,
        ) &&
        attempt <
          MAX_TRANSACTION_RETRIES
      ) {
        continue;
      }

      if (
        error instanceof
          PlayerShopError &&
        error.code ===
          "CONCURRENT_UPDATE_FAILED" &&
        attempt <
          MAX_TRANSACTION_RETRIES
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new PlayerShopError(
    "CONCURRENT_UPDATE_FAILED",
    "Could not complete the shop purchase because the player state was modified concurrently.",
  );
}

export async function setPlayerShopItemEquipped(
  params: {
    userId: string;
    shopItemId: string;
    isEquipped: boolean;
    now?: Date;
  },
): Promise<PlayerShopEquipmentResult> {
  const userId =
    normalizeUserId(
      params.userId,
    );

  const shopItemId =
    normalizeShopItemId(
      params.shopItemId,
    );

  const now =
    params.now ?? new Date();

  for (
    let attempt = 1;
    attempt <=
    MAX_TRANSACTION_RETRIES;
    attempt += 1
  ) {
    try {
      return await executeEquipmentTransaction(
        {
          userId,
          shopItemId,

          shouldEquip:
            params.isEquipped,

          now,
        },
      );
    } catch (error) {
      if (
        isRetryableTransactionError(
          error,
        ) &&
        attempt <
          MAX_TRANSACTION_RETRIES
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new PlayerShopError(
    "CONCURRENT_UPDATE_FAILED",
    "Could not update the equipped shop item because the inventory changed concurrently.",
  );
}

export function isPlayerShopError(
  error: unknown,
): error is PlayerShopError {
  return (
    error instanceof
    PlayerShopError
  );
}