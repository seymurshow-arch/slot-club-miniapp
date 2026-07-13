export type StatisticsView =
  | "overview"
  | "player-activity"
  | "economy"
  | "content";

export type StatisticsPeriod =
  | "today"
  | "7-days"
  | "30-days"
  | "all-time";

export type StatisticsPlayer = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  createdAt: string;
  lastLoginAt: string;
};