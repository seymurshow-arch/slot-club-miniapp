import { prisma } from "@/lib/prisma";

const GLOBAL_ECONOMY_SETTINGS_ID = "global";
const MAX_SYNC_RETRIES = 5;

type PlayerGameStateRecord = Awaited<
  ReturnType<typeof prisma.playerGameState.findUniqueOrThrow>
>;

type EconomySettingsRecord = Awaited<
  ReturnType<typeof prisma.economySettings.findUniqueOrThrow>
>;

export type EnergySyncResult = {
  state: PlayerGameStateRecord;
  restoredEnergy: bigint;
  elapsedIntervals: bigint;
};

function assertValidEnergySettings(
  economy: EconomySettingsRecord,
) {
  if (economy.energyRestoreAmount < BigInt(0)) {
    throw new Error(
      "Economy energyRestoreAmount cannot be negative.",
    );
  }

  if (economy.energyRestoreIntervalSeconds <= 0) {
    throw new Error(
      "Economy energyRestoreIntervalSeconds must be greater than zero.",
    );
  }
}

function calculateEnergySync(params: {
  energy: bigint;
  maxEnergy: bigint;
  lastEnergyUpdate: Date;
  now: Date;
  restoreAmount: bigint;
  restoreIntervalSeconds: number;
}) {
  const {
    energy,
    maxEnergy,
    lastEnergyUpdate,
    now,
    restoreAmount,
    restoreIntervalSeconds,
  } = params;

  if (energy >= maxEnergy) {
    return {
      energy: maxEnergy,
      lastEnergyUpdate: now,
      restoredEnergy: BigInt(0),
      elapsedIntervals: BigInt(0),
    };
  }

  if (restoreAmount === BigInt(0)) {
    return {
      energy,
      lastEnergyUpdate,
      restoredEnergy: BigInt(0),
      elapsedIntervals: BigInt(0),
    };
  }

  const elapsedMilliseconds =
    now.getTime() - lastEnergyUpdate.getTime();

  if (elapsedMilliseconds <= 0) {
    return {
      energy,
      lastEnergyUpdate,
      restoredEnergy: BigInt(0),
      elapsedIntervals: BigInt(0),
    };
  }

  const intervalMilliseconds =
    restoreIntervalSeconds * 1000;

  const elapsedIntervals = BigInt(
    Math.floor(
      elapsedMilliseconds / intervalMilliseconds,
    ),
  );

  if (elapsedIntervals <= BigInt(0)) {
    return {
      energy,
      lastEnergyUpdate,
      restoredEnergy: BigInt(0),
      elapsedIntervals: BigInt(0),
    };
  }

  const possibleRestore =
    elapsedIntervals * restoreAmount;

  const missingEnergy = maxEnergy - energy;

  const restoredEnergy =
    possibleRestore > missingEnergy
      ? missingEnergy
      : possibleRestore;

  const nextEnergy = energy + restoredEnergy;

  const consumedIntervals =
    restoredEnergy === missingEnergy
      ? elapsedIntervals
      : restoredEnergy / restoreAmount;

  const consumedMilliseconds =
    Number(consumedIntervals) *
    intervalMilliseconds;

  const nextLastEnergyUpdate =
    nextEnergy >= maxEnergy
      ? now
      : new Date(
          lastEnergyUpdate.getTime() +
            consumedMilliseconds,
        );

  return {
    energy: nextEnergy,
    lastEnergyUpdate: nextLastEnergyUpdate,
    restoredEnergy,
    elapsedIntervals,
  };
}

async function getEconomySettings() {
  return prisma.economySettings.findUnique({
    where: {
      id: GLOBAL_ECONOMY_SETTINGS_ID,
    },
  });
}

export async function syncPlayerEnergy(
  userId: string,
  now = new Date(),
): Promise<EnergySyncResult> {
  const economy = await getEconomySettings();

  if (!economy) {
    throw new Error(
      "Global economy settings are missing.",
    );
  }

  assertValidEnergySettings(economy);

  for (
    let attempt = 1;
    attempt <= MAX_SYNC_RETRIES;
    attempt += 1
  ) {
    const state =
      await prisma.playerGameState.findUnique({
        where: {
          userId,
        },
      });

    if (!state) {
      throw new Error(
        `Player game state for user ${userId} does not exist.`,
      );
    }

    const calculated = calculateEnergySync({
      energy: state.energy,
      maxEnergy: state.maxEnergy,
      lastEnergyUpdate: state.lastEnergyUpdate,
      now,
      restoreAmount: economy.energyRestoreAmount,
      restoreIntervalSeconds:
        economy.energyRestoreIntervalSeconds,
    });

    const hasEnergyChanged =
      calculated.energy !== state.energy;

    const hasTimestampChanged =
      calculated.lastEnergyUpdate.getTime() !==
      state.lastEnergyUpdate.getTime();

    if (
      !hasEnergyChanged &&
      !hasTimestampChanged
    ) {
      return {
        state,
        restoredEnergy: BigInt(0),
        elapsedIntervals:
          calculated.elapsedIntervals,
      };
    }

    const updateResult =
      await prisma.playerGameState.updateMany({
        where: {
          id: state.id,
          revision: state.revision,
        },
        data: {
          energy: calculated.energy,
          lastEnergyUpdate:
            calculated.lastEnergyUpdate,
          revision: {
            increment: 1,
          },
        },
      });

    if (updateResult.count === 0) {
      continue;
    }

    const updatedState =
      await prisma.playerGameState.findUnique({
        where: {
          id: state.id,
        },
      });

    if (!updatedState) {
      throw new Error(
        `Player game state ${state.id} disappeared after energy sync.`,
      );
    }

    return {
      state: updatedState,
      restoredEnergy:
        calculated.restoredEnergy,
      elapsedIntervals:
        calculated.elapsedIntervals,
    };
  }

  throw new Error(
    "Could not synchronize player energy because the state was modified concurrently.",
  );
}