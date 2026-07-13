export type PopupsView =
  | "catalog"
  | "create"
  | "history";

export type PopupType =
  | "onboarding"
  | "news"
  | "task-reward"
  | "season"
  | "promotion"
  | "warning"
  | "custom";

export type PopupStyle =
  | "standard"
  | "reward"
  | "news"
  | "season"
  | "warning"
  | "premium";

export type PopupTrigger =
  | "first-login"
  | "every-login"
  | "once-per-player"
  | "once-per-day"
  | "task-completion"
  | "daily-reward"
  | "purchase"
  | "vip-level-up"
  | "referral-reward"
  | "date-range"
  | "manual";

export type PopupAudience =
  | "all"
  | "new-players"
  | "selected"
  | "vip"
  | "active"
  | "inactive"
  | "completed-task"
  | "not-completed-task"
  | "purchased-item"
  | "leaderboard-position";

export type PopupButtonAction =
  | "close"
  | "open-task"
  | "open-shop"
  | "open-leaderboard"
  | "open-daily"
  | "open-vip"
  | "open-referral"
  | "telegram-link"
  | "external-url";

export type PopupFormState = {
  internalName: string;
  type: PopupType;
  style: PopupStyle;

  title: string;
  subtitle: string;
  body: string;

  accentColor: string;
  imagePreview: string | null;

  primaryButtonEnabled: boolean;
  primaryButtonText: string;
  primaryButtonAction: PopupButtonAction;
  primaryButtonTarget: string;

  secondaryButtonEnabled: boolean;
  secondaryButtonText: string;
  secondaryButtonAction: PopupButtonAction;
  secondaryButtonTarget: string;

  audience: PopupAudience;
  selectedPlayerIds: string;
  minimumVipLevel: string;
  activeDuringDays: string;
  relatedAudienceTaskId: string;
  leaderboardMaximumPosition: string;

  trigger: PopupTrigger;
  relatedTriggerTaskId: string;

  startDate: string;
  endDate: string;

  priority: string;
  delaySeconds: string;
  maximumDisplays: string;

  allowClose: boolean;
  closeOnBackdrop: boolean;
  hideAfterClose: boolean;
  hideAfterAction: boolean;
  isActive: boolean;
};