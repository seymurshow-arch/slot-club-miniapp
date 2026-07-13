import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  TelegramAuthError,
  validateTelegramInitData,
} from "@/lib/telegramAuth";

const LAST_LOGIN_WRITE_INTERVAL_MS =
  15 * 60 * 1000;

const userSelect = {
  id: true,
  telegramId: true,
  username: true,
  firstName: true,
  lastName: true,
  photoUrl: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} satisfies Prisma.UserSelect;

type SelectedUser = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

type TelegramProfile = {
  telegramId: bigint;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
};

function normalizeOptionalText(
  value: string | undefined,
): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue
    ? normalizedValue
    : null;
}

function getTelegramBotToken(): string {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!botToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN is not configured.",
    );
  }

  return botToken;
}

function buildTelegramProfile(
  telegramUser: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  },
): TelegramProfile {
  return {
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
  };
}

function hasProfileChanged(
  user: SelectedUser,
  profile: TelegramProfile,
): boolean {
  return (
    user.username !== profile.username ||
    user.firstName !== profile.firstName ||
    user.lastName !== profile.lastName ||
    user.photoUrl !== profile.photoUrl
  );
}

function shouldRefreshLastLogin(
  lastLoginAt: Date,
  now: Date,
): boolean {
  return (
    now.getTime() - lastLoginAt.getTime() >=
    LAST_LOGIN_WRITE_INTERVAL_MS
  );
}

async function findUserByTelegramId(
  telegramId: bigint,
): Promise<SelectedUser | null> {
  return prisma.user.findUnique({
    where: {
      telegramId,
    },
    select: userSelect,
  });
}

async function createUser(
  profile: TelegramProfile,
  now: Date,
): Promise<SelectedUser> {
  try {
    return await prisma.user.create({
      data: {
        telegramId: profile.telegramId,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        photoUrl: profile.photoUrl,
        lastLoginAt: now,
      },
      select: userSelect,
    });
  } catch (error) {
    /*
     * /api/player/state and /api/player/shop are intentionally
     * started in parallel during bootstrap. For a brand-new
     * Telegram user, both requests can observe that the user is
     * missing and attempt to create it simultaneously.
     *
     * The unique telegramId constraint is the final authority.
     * If another request won the race, read and return that row.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const concurrentUser =
        await findUserByTelegramId(
          profile.telegramId,
        );

      if (concurrentUser) {
        return concurrentUser;
      }
    }

    throw error;
  }
}

async function updateUserWhenNeeded(
  user: SelectedUser,
  profile: TelegramProfile,
  now: Date,
): Promise<SelectedUser> {
  const profileChanged = hasProfileChanged(
    user,
    profile,
  );
  const refreshLastLogin =
    shouldRefreshLastLogin(
      user.lastLoginAt,
      now,
    );

  if (!profileChanged && !refreshLastLogin) {
    return user;
  }

  return prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      ...(profileChanged
        ? {
            username: profile.username,
            firstName: profile.firstName,
            lastName: profile.lastName,
            photoUrl: profile.photoUrl,
          }
        : {}),
      ...(refreshLastLogin
        ? {
            lastLoginAt: now,
          }
        : {}),
    },
    select: userSelect,
  });
}

export async function authenticateTelegramUser(
  initData: string,
) {
  const validatedData =
    validateTelegramInitData(
      initData,
      getTelegramBotToken(),
    );

  const now = new Date();
  const profile = buildTelegramProfile(
    validatedData.user,
  );

  const existingUser =
    await findUserByTelegramId(
      profile.telegramId,
    );

  const user = existingUser
    ? await updateUserWhenNeeded(
        existingUser,
        profile,
        now,
      )
    : await createUser(profile, now);

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
