export type ReferralAdminPlayer = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: string;
  lastLoginAt: string;
};

export type ReferralFilter =
  | "all"
  | "with-referrals"
  | "without-referrals"
  | "invited";

export type ReferralDetailsFilter =
  | "all"
  | "active"
  | "blocked"
  | "rewarded";