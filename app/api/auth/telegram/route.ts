import { NextResponse } from "next/server";

import {
  authenticateTelegramUser,
  isTelegramAuthError,
} from "@/lib/authenticateTelegramUser";

export const runtime = "nodejs";

type TelegramAuthRequestBody = {
  initData?: unknown;
};

function getInitData(body: unknown): string | null {
  if (
    typeof body !== "object" ||
    body === null ||
    !("initData" in body)
  ) {
    return null;
  }

  const { initData } = body as TelegramAuthRequestBody;

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

  const initData = getInitData(body);

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

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLoginAt: user.lastLoginAt.toISOString(),
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

    console.error("Telegram authentication failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Telegram authentication failed.",
      },
      {
        status: 500,
      },
    );
  }
}