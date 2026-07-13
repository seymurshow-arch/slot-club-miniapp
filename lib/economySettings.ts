import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const GLOBAL_ECONOMY_SETTINGS_ID = "global";

const INITIAL_ECONOMY_SETTINGS = {
  version: 1,

  initialBalance: BigInt(10_000),
  initialEnergy: BigInt(3_000),
  initialMaxEnergy: BigInt(3_000),

  baseTapReward: BigInt(1),
  energyCostPerTap: BigInt(1),

  energyRestoreAmount: BigInt(2),
  energyRestoreIntervalSeconds: 60,

  maximumTapsPerSecond: 10,
  maximumBalance: BigInt("9000000000000000"),

  manualRewardPerActionLimit: BigInt(1_000_000),
  manualRewardDailyLimit: BigInt(10_000_000),
} as const;

type EconomySettingsRecord = Awaited<
  ReturnType<typeof prisma.economySettings.findUniqueOrThrow>
>;

export type SerializedEconomySettings = {
  id: string;
  version: number;

  initialBalance: string;
  initialEnergy: string;
  initialMaxEnergy: string;

  baseTapReward: string;
  energyCostPerTap: string;

  energyRestoreAmount: string;
  energyRestoreIntervalSeconds: number;

  maximumTapsPerSecond: number;
  maximumBalance: string;

  manualRewardPerActionLimit: string;
  manualRewardDailyLimit: string;

  createdAt: string;
  updatedAt: string;
};

export function serializeEconomySettings(
  settings: EconomySettingsRecord,
): SerializedEconomySettings {
  return {
    id: settings.id,
    version: settings.version,

    initialBalance: settings.initialBalance.toString(),
    initialEnergy: settings.initialEnergy.toString(),
    initialMaxEnergy: settings.initialMaxEnergy.toString(),

    baseTapReward: settings.baseTapReward.toString(),
    energyCostPerTap: settings.energyCostPerTap.toString(),

    energyRestoreAmount:
      settings.energyRestoreAmount.toString(),
    energyRestoreIntervalSeconds:
      settings.energyRestoreIntervalSeconds,

    maximumTapsPerSecond:
      settings.maximumTapsPerSecond,
    maximumBalance: settings.maximumBalance.toString(),

    manualRewardPerActionLimit:
      settings.manualRewardPerActionLimit.toString(),
    manualRewardDailyLimit:
      settings.manualRewardDailyLimit.toString(),

    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

function createEconomySnapshot(
  settings: EconomySettingsRecord,
): Prisma.InputJsonObject {
  const serialized = serializeEconomySettings(settings);

  return {
    id: serialized.id,
    version: serialized.version,

    initialBalance: serialized.initialBalance,
    initialEnergy: serialized.initialEnergy,
    initialMaxEnergy: serialized.initialMaxEnergy,

    baseTapReward: serialized.baseTapReward,
    energyCostPerTap: serialized.energyCostPerTap,

    energyRestoreAmount: serialized.energyRestoreAmount,
    energyRestoreIntervalSeconds:
      serialized.energyRestoreIntervalSeconds,

    maximumTapsPerSecond:
      serialized.maximumTapsPerSecond,
    maximumBalance: serialized.maximumBalance,

    manualRewardPerActionLimit:
      serialized.manualRewardPerActionLimit,
    manualRewardDailyLimit:
      serialized.manualRewardDailyLimit,

    createdAt: serialized.createdAt,
    updatedAt: serialized.updatedAt,
  };
}

export async function getEconomySettings() {
  return prisma.$transaction(async (transaction) => {
    const settings = await transaction.economySettings.upsert({
      where: {
        id: GLOBAL_ECONOMY_SETTINGS_ID,
      },
      update: {},
      create: {
        id: GLOBAL_ECONOMY_SETTINGS_ID,
        ...INITIAL_ECONOMY_SETTINGS,
      },
    });

    await transaction.economySettingsHistory.upsert({
      where: {
        economySettingsId_version: {
          economySettingsId: settings.id,
          version: settings.version,
        },
      },
      update: {},
      create: {
        economySettingsId: settings.id,
        version: settings.version,
        snapshot: createEconomySnapshot(settings),
        changedBy: "system",
        reason: "Initial economy configuration",
      },
    });

    return settings;
  });
}