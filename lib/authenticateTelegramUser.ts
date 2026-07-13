import { prisma } from "@/lib/prisma";
import {
  TelegramAuthError,
  validateTelegramInitData,
} from "@/lib/telegramAuth";

function normalizeOptionalText(
  value: string | undefined,
): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function getTelegramBotToken(): string {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is not configured.",
    );
  }

  return botToken;
}

export async function authenticateTelegramUser(
  initData: string,
) {
  const validatedData = validateTelegramInitData(
    initData,
    getTelegramBotToken(),
  );

  const now = new Date();
  const telegramUser = validatedData.user;

  const user = await prisma.user.upsert({
    where: {
      telegramId: BigInt(telegramUser.id),
    },
    create: {
      telegramId: BigInt(telegramUser.id),
      username: normalizeOptionalText(
        telegramUser.username,
      ),
      firstName: normalizeOptionalText(
        telegramUser.first_name,
      ),
      lastName: normalizeOptionalText(
        telegramUser.last_name,
      ),
      photoUrl: normalizeOptionalText(
        telegramUser.photo_url,
      ),
      lastLoginAt: now,
    },
    update: {
      username: normalizeOptionalText(
        telegramUser.username,
      ),
      firstName: normalizeOptionalText(
        telegramUser.first_name,
      ),
      lastName: normalizeOptionalText(
        telegramUser.last_name,
      ),
      photoUrl: normalizeOptionalText(
        telegramUser.photo_url,
      ),
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

  return {
    user,
    authDate: validatedData.authDate,
    queryId: validatedData.queryId,
  };
}

export function isTelegramAuthError(
  error: unknown,
): error is TelegramAuthError {
  return error instanceof TelegramAuthError;
}