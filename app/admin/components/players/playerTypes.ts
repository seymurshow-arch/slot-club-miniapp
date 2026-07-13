export type AdminPlayer = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
};

export type PlayerStatusFilter = "all" | "active" | "blocked" | "vip";

export type PlayerSort =
  | "newest"
  | "oldest"
  | "last-active"
  | "name";

export type PlayerDetailsTab =
  | "overview"
  | "economy"
  | "tasks"
  | "purchases"
  | "daily"
  | "referrals"
  | "rewards"
  | "notes";