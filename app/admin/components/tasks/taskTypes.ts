export type TasksView = "active" | "create";

export type TaskType =
  | "telegram-channel"
  | "open-link"
  | "daily-login"
  | "tap-count"
  | "referrals"
  | "vip-level"
  | "manual"
  | "custom";

export type TaskVerification =
  | "telegram-api"
  | "game-logic"
  | "manual-review"
  | "auto-complete"
  | "no-verification";

export type TaskAudience =
  | "all"
  | "vip"
  | "selected"
  | "registered-after"
  | "active-players";

export type TaskRepeatMode =
  | "once"
  | "daily"
  | "weekly";

export type TaskFormState = {
  title: string;
  description: string;
  instructions: string;
  reward: string;

  type: TaskType;
  verification: TaskVerification;
  audience: TaskAudience;
  repeatMode: TaskRepeatMode;

  actionUrl: string;
  telegramChannelUsername: string;
  telegramChatId: string;

  targetValue: string;
  minimumVipLevel: string;
  selectedPlayerIds: string;

  startDate: string;
  endDate: string;

  imagePreview: string | null;
};