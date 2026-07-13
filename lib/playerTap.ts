import { Prisma } from "@/generated/prisma/client";
import { syncPlayerEnergy } from "@/lib/playerEnergy";
import { prisma } from "@/lib/prisma";

const ECONOMY_SETTINGS_ID = "global";
const RATE_LIMIT_WINDOW_MS = 1_000;
const MAX_TRANSACTION_RETRIES = 5;

export type PlayerTapErrorCode =
  | "PLAYER_STATE_NOT_FOUND"
  | "PLAYER_BLOCKED"
  | "INVALID_TAP_CONFIGURATION"
  | "INSUFFICIENT_ENERGY"
  | "RATE_LIMIT_EXCEEDED"
  | "MAXIMUM_BALANCE_REACHED"
  | "INVALID_REQUEST_ID"
  | "CONCURRENT_UPDATE_FAILED";

export class PlayerTapError extends Error {
  readonly code: PlayerTapErrorCode;

  constructor(code: PlayerTapErrorCode, message: string) {
    super(message);

    this.name = "PlayerTapError";
    this.code = code;
  }
}

type PlayerGameStateRecord = Awaited<
  ReturnType<typeof prisma.playerGameState.findUniqueOrThrow>
>;

export type PlayerTapResult = {
  state: PlayerGameStateRecord;
  earned: bigint;
  energySpent: bigint;
  duplicate: boolean;
  transactionId: string;
};

function normalizeRequestId(requestId: string): string {
  const normalizedRequestId = requestId.trim();

  const isValidLength =
    normalizedRequestId.length >= 16 &&
    normalizedRequestId.length <= 128;

  const containsOnlySafeCharacters =
    /^[A-Za-z0-9_-]+$/.test(normalizedRequestId);

  if (!isValidLength || !containsOnlySafeCharacters) {
    throw new PlayerTapError(
      "INVALID_REQUEST_ID",
      "Tap request ID is invalid.",
    );
  }

  return normalizedRequestId;
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

function assertValidTapConfiguration(params: {
  tapPower: bigint;
  energyCostPerTap: bigint;
  maximumTapsPerSecond: number;
  maximumBalance: bigint;
}) {
  if (params.tapPower <= BigInt(0)) {
    throw new PlayerTapError(
      "INVALID_TAP_CONFIGURATION",
      "Player tap power must be greater than zero.",
    );
  }

  if (params.energyCostPerTap <= BigInt(0)) {
    throw new PlayerTapError(
      "INVALID_TAP_CONFIGURATION",
      "Energy cost per tap must be greater than zero.",
    );
  }

  if (
    !Number.isInteger(params.maximumTapsPerSecond) ||
    params.maximumTapsPerSecond <= 0
  ) {
    throw new PlayerTapError(
      "INVALID_TAP_CONFIGURATION",
      "Maximum taps per second must be a positive integer.",
    );
  }

  if (params.maximumBalance <= BigInt(0)) {
    throw new PlayerTapError(
      "INVALID_TAP_CONFIGURATION",
      "Maximum balance must be greater than zero.",
    );
  }
}

async function consumeTapRateLimit(
  transaction: Prisma.TransactionClient,
  userId: string,
  now: Date,
  maximumTapsPerSecond: number,
) {
  const currentLimit =
    await transaction.playerTapRateLimit.findUnique({
      where: {
        userId,
      },
    });

  if (!currentLimit) {
    await transaction.playerTapRateLimit.create({
      data: {
        userId,
        windowStartedAt: now,
        tapCount: 1,
      },
    });

    return;
  }

  const elapsedMilliseconds =
    now.getTime() -
    currentLimit.windowStartedAt.getTime();

  if (
    elapsedMilliseconds < 0 ||
    elapsedMilliseconds >= RATE_LIMIT_WINDOW_MS
  ) {
    await transaction.playerTapRateLimit.update({
      where: {
        userId,
      },
      data: {
        windowStartedAt: now,
        tapCount: 1,
      },
    });

    return;
  }

  if (
    currentLimit.tapCount >= maximumTapsPerSecond
  ) {
    throw new PlayerTapError(
      "RATE_LIMIT_EXCEEDED",
      "Maximum taps per second exceeded.",
    );
  }

  await transaction.playerTapRateLimit.update({
    where: {
      userId,
    },
    data: {
      tapCount: {
        increment: 1,
      },
    },
  });
}

async function executeTapTransaction(params: {
  userId: string;
  idempotencyKey: string;
  now: Date;
}): Promise<PlayerTapResult> {
  const { userId, idempotencyKey, now } = params;

  return prisma.$transaction(
    async (transaction) => {
      const existingTransaction =
        await transaction.balanceTransaction.findUnique({
          where: {
            idempotencyKey,
          },
        });

      if (existingTransaction) {
        if (
          existingTransaction.userId !== userId ||
          existingTransaction.source !== "TAP_REWARD"
        ) {
          throw new PlayerTapError(
            "INVALID_REQUEST_ID",
            "Tap request ID is already used by another operation.",
          );
        }

        const currentState =
          await transaction.playerGameState.findUnique({
            where: {
              userId,
            },
          });

        if (!currentState) {
          throw new PlayerTapError(
            "PLAYER_STATE_NOT_FOUND",
            "Player game state does not exist.",
          );
        }

        return {
          state: currentState,
          earned: existingTransaction.amount,
          energySpent: currentState.energyCostPerTap,
          duplicate: true,
          transactionId: existingTransaction.id,
        };
      }

      const [state, economy] = await Promise.all([
        transaction.playerGameState.findUnique({
          where: {
            userId,
          },
        }),

        transaction.economySettings.findUnique({
          where: {
            id: ECONOMY_SETTINGS_ID,
          },
        }),
      ]);

      if (!state) {
        throw new PlayerTapError(
          "PLAYER_STATE_NOT_FOUND",
          "Player game state does not exist.",
        );
      }

      if (!economy) {
        throw new PlayerTapError(
          "INVALID_TAP_CONFIGURATION",
          "Global economy settings do not exist.",
        );
      }

      if (state.isBlocked) {
        throw new PlayerTapError(
          "PLAYER_BLOCKED",
          "Player account is blocked.",
        );
      }

      assertValidTapConfiguration({
        tapPower: state.tapPower,
        energyCostPerTap: state.energyCostPerTap,
        maximumTapsPerSecond:
          economy.maximumTapsPerSecond,
        maximumBalance: economy.maximumBalance,
      });

      if (state.energy < state.energyCostPerTap) {
        throw new PlayerTapError(
          "INSUFFICIENT_ENERGY",
          "Player does not have enough energy.",
        );
      }

      if (state.balance >= economy.maximumBalance) {
        throw new PlayerTapError(
          "MAXIMUM_BALANCE_REACHED",
          "Player balance has reached the configured maximum.",
        );
      }

      const remainingBalanceCapacity =
        economy.maximumBalance - state.balance;

      const earned =
        state.tapPower > remainingBalanceCapacity
          ? remainingBalanceCapacity
          : state.tapPower;

      if (earned <= BigInt(0)) {
        throw new PlayerTapError(
          "MAXIMUM_BALANCE_REACHED",
          "Player balance has reached the configured maximum.",
        );
      }

      await consumeTapRateLimit(
        transaction,
        userId,
        now,
        economy.maximumTapsPerSecond,
      );

      const nextEnergy =
        state.energy - state.energyCostPerTap;

      const nextBalance = state.balance + earned;

      const nextLastEnergyUpdate =
        state.energy >= state.maxEnergy
          ? now
          : state.lastEnergyUpdate;

      const updateResult =
        await transaction.playerGameState.updateMany({
          where: {
            id: state.id,
            revision: state.revision,
          },
          data: {
            energy: nextEnergy,
            balance: nextBalance,
            lastEnergyUpdate: nextLastEnergyUpdate,

            totalTaps: {
              increment: BigInt(1),
            },

            totalEarned: {
              increment: earned,
            },

            revision: {
              increment: 1,
            },
          },
        });

      if (updateResult.count !== 1) {
        throw new PlayerTapError(
          "CONCURRENT_UPDATE_FAILED",
          "Player state was changed concurrently.",
        );
      }

      const balanceTransaction =
        await transaction.balanceTransaction.create({
          data: {
            userId,
            direction: "CREDIT",
            source: "TAP_REWARD",

            amount: earned,
            balanceBefore: state.balance,
            balanceAfter: nextBalance,

            idempotencyKey,

            referenceType: "tap",
            referenceId: idempotencyKey,

            description: "Server-side tap reward",
            createdBy: "player",

            metadata: {
              economySettingsVersion: economy.version,
              tapPower: state.tapPower.toString(),
              energyCost:
                state.energyCostPerTap.toString(),
            },
          },
        });

      const updatedState =
        await transaction.playerGameState.findUnique({
          where: {
            id: state.id,
          },
        });

      if (!updatedState) {
        throw new PlayerTapError(
          "PLAYER_STATE_NOT_FOUND",
          "Player state disappeared after tap.",
        );
      }

      return {
        state: updatedState,
        earned,
        energySpent: state.energyCostPerTap,
        duplicate: false,
        transactionId: balanceTransaction.id,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function performPlayerTap(params: {
  userId: string;
  requestId: string;
  now?: Date;
}): Promise<PlayerTapResult> {
  const requestId = normalizeRequestId(params.requestId);
  const now = params.now ?? new Date();

  const idempotencyKey =
    `tap:${params.userId}:${requestId}`;

  /*
   * Energy regeneration is synchronized against PostgreSQL
   * immediately before the atomic tap transaction. The tap
   * transaction then reads the newest state and performs all
   * critical changes atomically.
   */
  await syncPlayerEnergy(params.userId, now);

  for (
    let attempt = 1;
    attempt <= MAX_TRANSACTION_RETRIES;
    attempt += 1
  ) {
    try {
      return await executeTapTransaction({
        userId: params.userId,
        idempotencyKey,
        now,
      });
    } catch (error) {
      const shouldRetry =
        isRetryableTransactionError(error) ||
        (error instanceof PlayerTapError &&
          error.code ===
            "CONCURRENT_UPDATE_FAILED");

      if (
        !shouldRetry ||
        attempt === MAX_TRANSACTION_RETRIES
      ) {
        throw error;
      }
    }
  }

  throw new PlayerTapError(
    "CONCURRENT_UPDATE_FAILED",
    "Tap could not be completed after multiple attempts.",
  );
}

export function isPlayerTapError(
  error: unknown,
): error is PlayerTapError {
  return error instanceof PlayerTapError;
}