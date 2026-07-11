import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  TelegramAuthError,
  validateTelegramInitData,
} from "@/lib/telegramAuth";

export const runtime = "nodejs";

type SavedUser = {
  id: string;
  telegramId: bigint;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
};

type UserDelegate = {
  upsert(args: {
    where: { telegramId: bigint };
    create: {
      telegramId: bigint;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      photoUrl: string | null;
      lastLoginAt: Date;
    };
    update: {
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      photoUrl: string | null;
      lastLoginAt: Date;
    };
    select: Record<keyof SavedUser, true>;
  }): Promise<SavedUser>;
};

function normalizeOptionalText(value: string | undefined): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const initData =
    typeof body === "object" &&
    body !== null &&
    "initData" in body &&
    typeof body.initData === "string"
      ? body.initData
      : "";

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN is not configured.");
      return NextResponse.json(
        { ok: false, error: "Server authentication is not configured." },
        { status: 500 },
      );
    }

    const { user } = validateTelegramInitData(initData, botToken);
    const now = new Date();

    const userDelegate = (prisma as unknown as { user: UserDelegate }).user;
    const savedUser = await userDelegate.upsert({
      where: {
        telegramId: BigInt(user.id),
      },
      create: {
        telegramId: BigInt(user.id),
        username: normalizeOptionalText(user.username),
        firstName: normalizeOptionalText(user.first_name),
        lastName: normalizeOptionalText(user.last_name),
        photoUrl: normalizeOptionalText(user.photo_url),
        lastLoginAt: now,
      },
      update: {
        username: normalizeOptionalText(user.username),
        firstName: normalizeOptionalText(user.first_name),
        lastName: normalizeOptionalText(user.last_name),
        photoUrl: normalizeOptionalText(user.photo_url),
        lastLoginAt: now,
      },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        ...savedUser,
        telegramId: savedUser.telegramId.toString(),
      },
    });
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return NextResponse.json(
        { ok: false, error: "Invalid Telegram authorization data." },
        { status: 401 },
      );
    }

    console.error("Telegram authentication failed:", error);
    return NextResponse.json(
      { ok: false, error: "Telegram authentication failed." },
      { status: 500 },
    );
  }
}
