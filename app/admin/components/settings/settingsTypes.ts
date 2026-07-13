export type SettingsView =
  | "general"
  | "economy"
  | "notifications"
  | "security"
  | "system";

export type GameStatus =
  | "online"
  | "maintenance"
  | "closed";

export type GeneralSettings = {
  gameName: string;
  description: string;
  gameStatus: GameStatus;
  maintenanceMessage: string;

  telegramBotUsername: string;
  miniAppUrl: string;

  timezone: string;
  defaultLanguage: string;
  currencyName: string;
  currencySymbol: string;
};

export type EconomySettings = {
  initialBalance: number;
  initialEnergy: number;
  initialMaxEnergy: number;

  baseTapReward: number;
  energyCostPerTap: number;

  energyRestoreAmount: number;
  energyRestoreIntervalSeconds: number;

  maximumTapsPerSecond: number;
  maximumBalance: number;

  tapPowerBasePrice: number;
  tapPowerGrowthRate: number;

  maxEnergyBasePrice: number;
  maxEnergyGrowthRate: number;

  energyRecoveryBasePrice: number;
  energyRecoveryGrowthRate: number;

  manualRewardLimit: number;
};

export type NotificationSettings = {
  newTaskEnabled: boolean;
  newTaskMessage: string;

  dailyRewardEnabled: boolean;
  dailyRewardMessage: string;

  vipLevelUpEnabled: boolean;
  vipLevelUpMessage: string;

  referralRewardEnabled: boolean;
  referralRewardMessage: string;

  newShopItemEnabled: boolean;
  newShopItemMessage: string;
};

export type SecuritySettings = {
  sessionDurationHours: number;
  automaticLogoutEnabled: boolean;
  confirmDangerousActions: boolean;
  doubleConfirmDeletion: boolean;

  maximumBalanceChange: number;
  maximumEnergyChange: number;
  maximumVipPointsChange: number;
};