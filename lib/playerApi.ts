import type { ServerGameStateSnapshot } from "@/game/gameStore";

export type PlayerApiErrorCode =
  | "INVALID_JSON"
  | "INVALID_REQUEST_BODY"
  | "TELEGRAM_AUTH_FAILED"
  | "INVALID_REQUEST_ID"
  | "PLAYER_BLOCKED"
  | "PLAYER_STATE_NOT_FOUND"
  | "INSUFFICIENT_ENERGY"
  | "RATE_LIMIT_EXCEEDED"
  | "MAXIMUM_BALANCE_REACHED"
  | "INVALID_TAP_CONFIGURATION"
  | "INVALID_PRICE_CONFIGURATION"
  | "INVALID_PLAYER_SHOP_STATE"
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
  | "CONCURRENT_UPDATE_FAILED"
  | "INTERNAL_SERVER_ERROR"
  | "INVALID_RESPONSE"
  | "NETWORK_ERROR";

export class PlayerApiError extends Error {
  readonly code: PlayerApiErrorCode;
  readonly status: number | null;

  constructor(params: {
    code: PlayerApiErrorCode;
    message: string;
    status?: number | null;
  }) {
    super(params.message);

    this.name = "PlayerApiError";
    this.code = params.code;
    this.status = params.status ?? null;
  }
}

export type PlayerTapResult = {
  duplicate: boolean;
  earned: string;
  energySpent: string;
  transactionId: string;
  state: ServerGameStateSnapshot;
};

type TelegramWebApp = {
  initData?: string;
};

type PlayerStateSuccessResponse = {
  ok: true;
  state: ServerGameStateSnapshot;
};

type PlayerTapSuccessResponse = {
  ok: true;
  duplicate: boolean;
  earned: string;
  energySpent: string;
  transactionId: string;
  state: ServerGameStateSnapshot;
};

type PlayerApiErrorResponse = {
  ok: false;
  code?: unknown;
  error?: unknown;
};

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

function isPlayerStateSuccessResponse(
  value: unknown,
): value is PlayerStateSuccessResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    isServerGameStateSnapshot(value.state)
  );
}

function isPlayerTapSuccessResponse(
  value: unknown,
): value is PlayerTapSuccessResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    typeof value.duplicate === "boolean" &&
    isSerializedInteger(value.earned) &&
    isSerializedInteger(
      value.energySpent,
    ) &&
    typeof value.transactionId ===
      "string" &&
    value.transactionId.length > 0 &&
    isServerGameStateSnapshot(value.state)
  );
}

function parseErrorCode(
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

async function readJsonResponse(
  response: Response,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new PlayerApiError({
      code: "INVALID_RESPONSE",
      status: response.status,
      message:
        "The server returned an invalid JSON response.",
    });
  }
}

function createResponseError(
  response: Response,
  body: unknown,
): PlayerApiError {
  const errorBody: PlayerApiErrorResponse =
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
    code: parseErrorCode(errorBody.code),
    status: response.status,
    message:
      typeof errorBody.error === "string" &&
      errorBody.error.trim().length > 0
        ? errorBody.error
        : "The player API request failed.",
  });
}

async function executePlayerRequest(
  path: string,
  body: Record<string, string>,
  signal?: AbortSignal,
): Promise<{
  response: Response;
  responseBody: unknown;
}> {
  let response: Response;

  try {
    response = await fetch(path, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(body),

      cache: "no-store",
      signal,
    });
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
        "The player API request could not reach the server.",
    });
  }

  const responseBody =
    await readJsonResponse(response);

  if (!response.ok) {
    throw createResponseError(
      response,
      responseBody,
    );
  }

  return {
    response,
    responseBody,
  };
}

export function getTelegramInitData():
  | string
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const telegram = (
    window as Window & {
      Telegram?: {
        WebApp?: TelegramWebApp;
      };
    }
  ).Telegram?.WebApp;

  const initData =
    telegram?.initData?.trim();

  return initData || null;
}

export function createPlayerRequestId(): string {
  if (
    typeof window === "undefined" ||
    !window.crypto
  ) {
    throw new PlayerApiError({
      code: "NETWORK_ERROR",
      message:
        "Secure request ID generation is unavailable.",
    });
  }

  if (
    typeof window.crypto.randomUUID ===
    "function"
  ) {
    return window.crypto.randomUUID();
  }

  const randomBytes =
    new Uint8Array(16);

  window.crypto.getRandomValues(
    randomBytes,
  );

  return Array.from(
    randomBytes,
    (value) =>
      value.toString(16).padStart(2, "0"),
  ).join("");
}

export async function fetchPlayerState(
  params: {
    initData: string;
    signal?: AbortSignal;
  },
): Promise<ServerGameStateSnapshot> {
  const initData = params.initData.trim();

  if (!initData) {
    throw new PlayerApiError({
      code: "TELEGRAM_AUTH_FAILED",
      message:
        "Telegram authorization data is unavailable.",
    });
  }

  const { response, responseBody } =
    await executePlayerRequest(
      "/api/player/state",
      {
        initData,
      },
      params.signal,
    );

  if (
    !isPlayerStateSuccessResponse(
      responseBody,
    )
  ) {
    throw new PlayerApiError({
      code: "INVALID_RESPONSE",
      status: response.status,
      message:
        "The server returned an invalid player state.",
    });
  }

  return responseBody.state;
}

export async function submitPlayerTap(
  params: {
    initData: string;
    requestId: string;
    signal?: AbortSignal;
  },
): Promise<PlayerTapResult> {
  const initData = params.initData.trim();

  const requestId =
    params.requestId.trim();

  if (!initData) {
    throw new PlayerApiError({
      code: "TELEGRAM_AUTH_FAILED",
      message:
        "Telegram authorization data is unavailable.",
    });
  }

  if (!requestId) {
    throw new PlayerApiError({
      code: "INVALID_REQUEST_ID",
      message:
        "A tap request ID is required.",
    });
  }

  const { response, responseBody } =
    await executePlayerRequest(
      "/api/player/tap",
      {
        initData,
        requestId,
      },
      params.signal,
    );

  if (
    !isPlayerTapSuccessResponse(
      responseBody,
    )
  ) {
    throw new PlayerApiError({
      code: "INVALID_RESPONSE",
      status: response.status,
      message:
        "The server returned an invalid tap result.",
    });
  }

  return {
    duplicate: responseBody.duplicate,
    earned: responseBody.earned,

    energySpent:
      responseBody.energySpent,

    transactionId:
      responseBody.transactionId,

    state: responseBody.state,
  };
}