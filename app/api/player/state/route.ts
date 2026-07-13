import { NextResponse } from "next/server";

import {
  authenticateTelegramUser,
  isTelegramAuthError,
} from "@/lib/authenticateTelegramUser";
import { syncPlayerEnergy } from "@/lib/playerEnergy";
import {
  getOrCreatePlayerGameState,
  serializePlayerGameState,
} from "@/lib/playerGameState";

export const runtime = "nodejs";

type PlayerStateRequestBody = {
  initData?: unknown;
};

function extractInitData(body: unknown): string | null {
  if (
    typeof body !== "object" ||
    body === null ||
    !("initData" in body)
  ) {
    return null;
  }

  const { initData } = body as PlayerStateRequestBody;

  if (typeof initData !== "string") {
    return null;
  }

  const normalizedInitData = initData.trim();

  return normalizedInitData.length > 0
    ? normalizedInitData
    : null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
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

  const initData = extractInitData(body);

  if (!initData) {
    return NextResponse.json(
      {
        ok: false,
        error: "Telegram initData is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const { user } =
      await authenticateTelegramUser(initData);

    const initialState =
      await getOrCreatePlayerGameState(user.id);

    if (initialState.isBlocked) {
      return NextResponse.json(
        {
          ok: false,
          error: "Player account is blocked.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Reuse the state that was already loaded by
     * getOrCreatePlayerGameState. The energy service will only
     * re-read it if an optimistic-lock conflict occurs.
     */
    const energySync = await syncPlayerEnergy(
      user.id,
      new Date(),
      initialState,
    );
    const state = energySync.state;

    if (state.isBlocked) {
      return NextResponse.json(
        {
          ok: false,
          error: "Player account is blocked.",
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json({
      ok: true,
      player: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
      },
      state: serializePlayerGameState(state),
      energySync: {
        restoredEnergy:
          energySync.restoredEnergy.toString(),
        elapsedIntervals:
          energySync.elapsedIntervals.toString(),
      },
    });
  } catch (error) {
    if (isTelegramAuthError(error)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid Telegram authorization data.",
        },
        {
          status: 401,
        },
      );
    }

    console.error("Failed to load player state:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load player state.",
      },
      {
        status: 500,
      },
    );
  }
}
