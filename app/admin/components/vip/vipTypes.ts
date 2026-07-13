export type VipView =
  | "levels"
  | "benefits"
  | "history";

export type VipLevel = {
  id: string;
  level: number;
  name: string;
  requiredPoints: number;
  color: string;
  icon: string;
  isActive: boolean;
};

export type VipBenefit = {
  vipLevelId: string;

  tapMultiplier: number;
  dailyRewardMultiplier: number;

  maxEnergyBonus: number;
  energyRecoveryMultiplier: number;

  shopDiscountPercent: number;
  referralBonusPercent: number;

  extraTasks: number;
  extraVipPointsPercent: number;
};