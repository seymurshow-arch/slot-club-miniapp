export const ADMIN_SECTIONS = [
  "dashboard",
  "players",
  "tasks",
  "popups",
  "daily-rewards",
  "shop",
  "vip",
  "referral",
  "leaderboard",
  "statistics",
  "settings",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export function isAdminSection(
  value: string | undefined,
): value is AdminSection {
  return (
    typeof value === "string" &&
    ADMIN_SECTIONS.some((section) => section === value)
  );
}

export function resolveAdminSection(
  value: string | undefined,
): AdminSection {
  return isAdminSection(value) ? value : "players";
}