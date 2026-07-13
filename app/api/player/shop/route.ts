import { NextResponse } from "next/server";

import {
  authenticateTelegramUser,
  isTelegramAuthError,
} from "@/lib/authenticateTelegramUser";
import { serializePlayerGameState } from "@/lib/playerGameState";
import {
  getPlayerShopCatalog,
  isPlayerShopError,
  purchasePlayerShopItem,
  setPlayerShopItemEquipped,
  type PlayerShopErrorCode,
} from "@/lib/playerShop";

export const runtime = "nodejs";

type ParsedCatalogRequest = {
  action: "catalog";
  initData: string;
};

type ParsedPurchaseRequest = {
  action: "purchase";
  initData: string;
  shopItemId: string;
  requestId: string;
};

type ParsedEquipmentRequest = {
  action: "equip" | "unequip";
  initData: string;
  shopItemId: string;
};

type ParsedShopRequest =
  | ParsedCatalogRequest
  | ParsedPurchaseRequest
  | ParsedEquipmentRequest;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function normalizeRequiredString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}

function parseShopRequestBody(
  body: unknown,
): ParsedShopRequest | null {
  if (!isRecord(body)) {
    return null;
  }

  const initData =
    normalizeRequiredString(
      body.initData,
    );

  if (!initData) {
    return null;
  }

  const actionValue = body.action;

  const action =
    actionValue === undefined ||
    actionValue === null
      ? "catalog"
      : actionValue;

  if (action === "catalog") {
    return {
      action: "catalog",
      initData,
    };
  }

  if (action === "purchase") {
    const shopItemId =
      normalizeRequiredString(
        body.shopItemId,
      );

    const requestId =
      normalizeRequiredString(
        body.requestId,
      );

    if (
      !shopItemId ||
      !requestId
    ) {
      return null;
    }

    return {
      action: "purchase",
      initData,
      shopItemId,
      requestId,
    };
  }

  if (
    action === "equip" ||
    action === "unequip"
  ) {
    const shopItemId =
      normalizeRequiredString(
        body.shopItemId,
      );

    if (!shopItemId) {
      return null;
    }

    return {
      action,
      initData,
      shopItemId,
    };
  }

  return null;
}

function getPlayerShopErrorStatus(
  code: PlayerShopErrorCode,
): number {
  switch (code) {
    case "INVALID_REQUEST_ID":
    case "INVALID_PLAYER_SHOP_STATE":
      return 400;

    case "PLAYER_BLOCKED":
    case "VIP_LEVEL_REQUIRED":
    case "PLAYER_LEVEL_REQUIRED":
      return 403;

    case "PLAYER_STATE_NOT_FOUND":
    case "SHOP_ITEM_NOT_FOUND":
      return 404;

    case "SHOP_ITEM_UNAVAILABLE":
    case "SHOP_ITEM_NOT_PURCHASABLE":
    case "SHOP_ITEM_NOT_OWNED":
    case "SHOP_ITEM_NOT_EQUIPPABLE":
    case "PURCHASE_LIMIT_REACHED":
    case "MAX_LEVEL_REACHED":
    case "INSUFFICIENT_BALANCE":
    case "IDEMPOTENCY_CONFLICT":
    case "CONCURRENT_UPDATE_FAILED":
      return 409;

    case "INVALID_PRICE_CONFIGURATION":
    case "UNSUPPORTED_SHOP_EFFECT":
      return 500;

    default:
      return 500;
  }
}

function serializePlayerShopItem(
  playerItem: {
    id: string;
    shopItemId: string;

    level: number;
    quantity: bigint;
    purchaseCount: number;

    isOwned: boolean;
    isEquipped: boolean;

    purchasedAt: Date | null;
    equippedAt: Date | null;

    createdAt: Date;
    updatedAt: Date;
  },
) {
  return {
    id: playerItem.id,

    shopItemId:
      playerItem.shopItemId,

    level:
      playerItem.level,

    quantity:
      playerItem.quantity.toString(),

    purchaseCount:
      playerItem.purchaseCount,

    isOwned:
      playerItem.isOwned,

    isEquipped:
      playerItem.isEquipped,

    purchasedAt:
      playerItem.purchasedAt?.toISOString() ??
      null,

    equippedAt:
      playerItem.equippedAt?.toISOString() ??
      null,

    createdAt:
      playerItem.createdAt.toISOString(),

    updatedAt:
      playerItem.updatedAt.toISOString(),
  };
}

function serializeShopPurchase(
  purchase: {
    id: string;
    shopItemId: string;

    status: string;

    quantity: bigint;
    unitPrice: bigint;
    totalPrice: bigint;

    balanceBefore: bigint;
    balanceAfter: bigint;

    levelBefore: number | null;
    levelAfter: number | null;

    gameStateRevisionBefore:
      | number
      | null;

    gameStateRevisionAfter:
      | number
      | null;

    createdAt: Date;
    refundedAt: Date | null;
  },
) {
  return {
    id: purchase.id,

    shopItemId:
      purchase.shopItemId,

    status:
      purchase.status,

    quantity:
      purchase.quantity.toString(),

    unitPrice:
      purchase.unitPrice.toString(),

    totalPrice:
      purchase.totalPrice.toString(),

    balanceBefore:
      purchase.balanceBefore.toString(),

    balanceAfter:
      purchase.balanceAfter.toString(),

    levelBefore:
      purchase.levelBefore,

    levelAfter:
      purchase.levelAfter,

    gameStateRevisionBefore:
      purchase.gameStateRevisionBefore,

    gameStateRevisionAfter:
      purchase.gameStateRevisionAfter,

    createdAt:
      purchase.createdAt.toISOString(),

    refundedAt:
      purchase.refundedAt?.toISOString() ??
      null,
  };
}

export async function POST(
  request: Request,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_JSON",
        error:
          "Request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const payload =
    parseShopRequestBody(body);

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_REQUEST_BODY",
        error:
          "A valid initData and shop action payload are required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const { user } =
      await authenticateTelegramUser(
        payload.initData,
      );

    if (
      payload.action ===
      "catalog"
    ) {
      const items =
        await getPlayerShopCatalog(
          user.id,
        );

      return NextResponse.json({
        ok: true,
        action: "catalog",
        items,
      });
    }

    if (
      payload.action ===
      "purchase"
    ) {
      const result =
        await purchasePlayerShopItem({
          userId: user.id,

          shopItemId:
            payload.shopItemId,

          requestId:
            payload.requestId,
        });

      return NextResponse.json({
        ok: true,
        action: "purchase",

        duplicate:
          result.duplicate,

        itemId:
          result.itemId,

        itemKey:
          result.itemKey,

        quantity:
          result.quantity.toString(),

        unitPrice:
          result.unitPrice.toString(),

        totalPrice:
          result.totalPrice.toString(),

        balanceBefore:
          result.balanceBefore.toString(),

        balanceAfter:
          result.balanceAfter.toString(),

        levelBefore:
          result.levelBefore,

        levelAfter:
          result.levelAfter,

        state:
          serializePlayerGameState(
            result.state,
          ),

        playerItem:
          serializePlayerShopItem(
            result.playerItem,
          ),

        purchase:
          serializeShopPurchase(
            result.purchase,
          ),
      });
    }

    const result =
      await setPlayerShopItemEquipped({
        userId: user.id,

        shopItemId:
          payload.shopItemId,

        isEquipped:
          payload.action === "equip",
      });

    return NextResponse.json({
      ok: true,
      action:
        payload.action,

      itemId:
        result.itemId,

      itemKey:
        result.itemKey,

      effect:
        result.effect,

      isEquipped:
        result.isEquipped,

      changed:
        result.changed,

      playerItem:
        serializePlayerShopItem(
          result.playerItem,
        ),
    });
  } catch (error) {
    if (isTelegramAuthError(error)) {
      return NextResponse.json(
        {
          ok: false,
          code: "TELEGRAM_AUTH_FAILED",
          error:
            "Telegram authorization data is invalid or expired.",
        },
        {
          status: 401,
        },
      );
    }

    if (isPlayerShopError(error)) {
      const status =
        getPlayerShopErrorStatus(
          error.code,
        );

      if (status >= 500) {
        console.error(
          "Player shop server error:",
          {
            code: error.code,
            message: error.message,
          },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: error.code,
          error: error.message,
        },
        {
          status,
        },
      );
    }

    console.error(
      "Unexpected player shop API error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_SERVER_ERROR",
        error:
          "An unexpected error occurred while processing the shop request.",
      },
      {
        status: 500,
      },
    );
  }
}