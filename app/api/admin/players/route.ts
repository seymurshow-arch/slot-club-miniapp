import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  TelegramAuthError,
  validateTelegramInitData,
} from "@/lib/telegramAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminRequestBody = {
  initData?: unknown;
  search?: unknown;
};

function getAdminTelegramIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_TELEGRAM_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function normalizeSearch(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

export async function POST(request: Request) {
  let body: AdminRequestBody;

  try {
    body = (await request.json()) as AdminRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const initData = typeof body.initData === "string" ? body.initData : "";
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { ok: false, error: "Server authentication is not configured." },
      { status: 500 },
    );
  }

  try {
    const { user } = validateTelegramInitData(initData, botToken);
    const adminIds = getAdminTelegramIds();

    if (!adminIds.has(String(user.id))) {
      return NextResponse.json(
        { ok: false, error: "Admin access denied." },
        { status: 403 },
      );
    }

    const search = normalizeSearch(body.search);
    const telegramIdSearch = /^\d+$/.test(search) ? BigInt(search) : null;

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              ...(telegramIdSearch
                ? [{ telegramId: { equals: telegramIdSearch } }]
                : []),
            ],
          }
        : undefined,
      orderBy: { lastLoginAt: "desc" },
      take: 200,
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

    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      totalUsers,
      users: users.map((savedUser) => ({
        ...savedUser,
        telegramId: savedUser.telegramId.toString(),
      })),
    });
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return NextResponse.json(
        { ok: false, error: "Invalid Telegram authorization data." },
        { status: 401 },
      );
    }

    console.error("Failed to load admin players:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load players." },
      { status: 500 },
    );
  }
}
