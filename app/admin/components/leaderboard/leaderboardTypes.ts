export type LeaderboardPlayer = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: string;
  lastLoginAt: string;
};

export type LeaderboardSort =
  | "balance"
  | "total-earned"
  | "total-taps"
  | "vip"
  | "last-active";