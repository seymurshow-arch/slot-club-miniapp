import { NextResponse } from "next/server";

import {
  authenticateTelegramUser,
  isTelegramAuthError,
} from "@/lib/authenticateTelegramUser";
import {
  isPlayerTapError,
  performPlayerTap,
  type PlayerTapErrorCode,
} from "@/lib/playerTap";
import { serializePlayerGameState } from "@/lib/playerGameState";

export const runtime = "nodejs";

type TapRequestBody = {
  initData?: unknown;
  requestId?: unknown;
};

function parseTapRequestBody(
  body: unknown,
): {
  initData: string;
  requestId: string;
} | null {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return null;
  }

  const requestBody = body as TapRequestBody;

  if (
    typeof requestBody.initData !== "string" ||
    typeof requestBody.requestId !== "string"
  ) {
    return null;
  }

  const initData = requestBody.initData.trim();
  const requestId = requestBody.requestId.trim();

  if (!initData || !requestId) {
    return null;
  }

  return {
    initData,
    requestId,
  };
}

function getTapErrorStatus(
  code: PlayerTapErrorCode,
): number {
  switch (code) {
    case "INVALID_REQUEST_ID":
      return 400;

    case "PLAYER_BLOCKED":
      return 403;

    case "PLAYER_STATE_NOT_FOUND":
      return 404;

    case "INSUFFICIENT_ENERGY":
    case "MAXIMUM_BALANCE_REACHED":
    case "CONCURRENT_UPDATE_FAILED":
      return 409;

    case "RATE_LIMIT_EXCEEDED":
      return 429;

    case "INVALID_TAP_CONFIGURATION":
      return 500;

    default:
      return 500;
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_JSON",
        error: "Request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const payload = parseTapRequestBody(body);

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_REQUEST_BODY",
        error:
          "initData and requestId are required.",
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

    const result = await performPlayerTap({
      userId: user.id,
      requestId: payload.requestId,
    });

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      earned: result.earned.toString(),
      energySpent:
        result.energySpent.toString(),
      transactionId: result.transactionId,
      state: serializePlayerGameState(
        result.state,
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

    if (isPlayerTapError(error)) {
      return NextResponse.json(
        {
          ok: false,
          code: error.code,
          error: error.message,
        },
        {
          status: getTapErrorStatus(
            error.code,
          ),
        },
      );
    }

    console.error(
      "Unexpected player tap API error:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_SERVER_ERROR",
        error:
          "An unexpected error occurred while processing the tap.",
      },
      {
        status: 500,
      },
    );
  }
}