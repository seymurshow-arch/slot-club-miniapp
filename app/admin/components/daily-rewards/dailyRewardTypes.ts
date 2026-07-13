export type DailyRewardsView =
  | "cycle"
  | "vip-scaling"
  | "claims";

export type MissedDayBehavior =
  | "reset"
  | "keep"
  | "step-back";

export type FinalDayBehavior =
  | "restart"
  | "stay-final";

export type DailyRewardDay = {
  id: string;
  day: number;
  coins: number;
  energy: number;
  vipPoints: number;
  itemName: string;
  imagePreview: string | null;
  isActive: boolean;
};

export type VipRewardScaling = {
  id: string;
  level: number;
  name: string;
  coinsMultiplier: number;
  energyMultiplier: number;
  extraVipPoints: number;
  isActive: boolean;
};

export type DailyRewardSettings = {
  resetTime: string;
  timezone: string;
  missedDayBehavior: MissedDayBehavior;
  finalDayBehavior: FinalDayBehavior;
};