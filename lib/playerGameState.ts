import { Prisma } from "@/generated/prisma/client";
import { getEconomySettings } from "@/lib/economySettings";
import { prisma } from "@/lib/prisma";

type PlayerGameStateRecord = Awaited<
  ReturnType<typeof prisma.playerGameState.findUniqueOrThrow>
>;

export type SerializedPlayerGameState = {
  id: string;
  userId: string;

  balance: string;
  energy: string;
  maxEnergy: string;
  lastEnergyUpdate: string;

  tapPower: string;
  energyCostPerTap: string;

  totalTaps: string;
  totalEarned: string;

  vipPoints: string;
  vipLevel: number;

  isBlocked: boolean;
  isLeaderboardVisible: boolean;
  adminNote: string | null;

  revision: number;

  createdAt: string;
  updatedAt: string;
};

export function serializePlayerGameState(
  state: PlayerGameStateRecord,
): SerializedPlayerGameState {
  return {
    id: state.id,
    userId: state.userId,

    balance: state.balance.toString(),
    energy: state.energy.toString(),
    maxEnergy: state.maxEnergy.toString(),
    lastEnergyUpdate: state.lastEnergyUpdate.toISOString(),

    tapPower: state.tapPower.toString(),
    energyCostPerTap: state.energyCostPerTap.toString(),

    totalTaps: state.totalTaps.toString(),
    totalEarned: state.totalEarned.toString(),

    vipPoints: state.vipPoints.toString(),
    vipLevel: state.vipLevel,

    isBlocked: state.isBlocked,
    isLeaderboardVisible:
      state.isLeaderboardVisible,
    adminNote: state.adminNote,

    revision: state.revision,

    createdAt: state.createdAt.toISOString(),
    updatedAt: state.updatedAt.toISOString(),
  };
}

async function findExistingPlayerGameState(
  userId: string,
) {
  return prisma.playerGameState.findUnique({
    where: {
      userId,
    },
  });
}

export async function getOrCreatePlayerGameState(
  userId: string,
): Promise<PlayerGameStateRecord> {
  const existingState =
    await findExistingPlayerGameState(userId);

  if (existingState) {
    return existingState;
  }

  /*
   * This guarantees that the global economy record exists.
   * Actual starting values are then read again inside the
   * database transaction, so PostgreSQL remains the source
   * of truth at the moment the player state is created.
   */
  await getEconomySettings();

  try {
    return await prisma.$transaction(
      async (transaction) => {
        const user = await transaction.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        });

        if (!user) {
          throw new Error(
            `Cannot create game state: user ${userId} does not exist.`,
          );
        }

        const stateAlreadyCreated =
          await transaction.playerGameState.findUnique({
            where: {
              userId,
            },
          });

        if (stateAlreadyCreated) {
          return stateAlreadyCreated;
        }

        const economy =
          await transaction.economySettings.findUnique({
            where: {
              id: "global",
            },
          });

        if (!economy) {
          throw new Error(
            "Global economy settings are missing.",
          );
        }

        if (economy.initialBalance < BigInt(0)) {
          throw new Error(
            "Economy initialBalance cannot be negative.",
          );
        }

        if (economy.initialEnergy < BigInt(0)) {
          throw new Error(
            "Economy initialEnergy cannot be negative.",
          );
        }

        if (economy.initialMaxEnergy <= BigInt(0)) {
          throw new Error(
            "Economy initialMaxEnergy must be greater than zero.",
          );
        }

        if (
          economy.initialEnergy >
          economy.initialMaxEnergy
        ) {
          throw new Error(
            "Economy initialEnergy cannot exceed initialMaxEnergy.",
          );
        }

        if (economy.baseTapReward <= BigInt(0)) {
          throw new Error(
            "Economy baseTapReward must be greater than zero.",
          );
        }

        if (economy.energyCostPerTap <= BigInt(0)) {
          throw new Error(
            "Economy energyCostPerTap must be greater than zero.",
          );
        }

        const createdState =
          await transaction.playerGameState.create({
            data: {
              userId: user.id,

              balance: economy.initialBalance,
              energy: economy.initialEnergy,
              maxEnergy: economy.initialMaxEnergy,
              lastEnergyUpdate: new Date(),

              tapPower: economy.baseTapReward,
              energyCostPerTap:
                economy.energyCostPerTap,

              totalTaps: BigInt(0),
              totalEarned: BigInt(0),

              vipPoints: BigInt(0),
              vipLevel: 0,

              isBlocked: false,
              isLeaderboardVisible: true,

              revision: 0,
            },
          });

        await transaction.balanceTransaction.create({
          data: {
            userId: user.id,
            direction: "CREDIT",
            source: "INITIAL_BALANCE",

            amount: economy.initialBalance,
            balanceBefore: BigInt(0),
            balanceAfter: economy.initialBalance,

            idempotencyKey: `initial-balance:${user.id}`,

            referenceType: "PlayerGameState",
            referenceId: createdState.id,

            description:
              "Initial player balance from economy settings",
            createdBy: "system",

            metadata: {
              economySettingsVersion: economy.version,
            },
          },
        });

        return createdState;
      },
    );
  } catch (error) {
    /*
     * Two simultaneous requests may both try to create the
     * same state. The unique userId constraint allows only
     * one creation. The losing request safely returns the
     * state that was created by the other request.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const state =
        await findExistingPlayerGameState(userId);

      if (state) {
        return state;
      }
    }

    throw error;
  }
}

export async function getPlayerGameState(
  userId: string,
): Promise<PlayerGameStateRecord | null> {
  return prisma.playerGameState.findUnique({
    where: {
      userId,
    },
  });
}