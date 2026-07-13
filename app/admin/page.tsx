import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";

import { resolveAdminSection } from "./adminTypes";
import { AdminLayout } from "./components/AdminLayout";
import { DashboardSection } from "./components/DashboardSection";
import { DailyRewardsSection } from "./components/daily-rewards/DailyRewardsSection";
import { LeaderboardSection } from "./components/leaderboard/LeaderboardSection";
import { PlayersSection } from "./components/players/PlayersSection";
import { PopupsSection } from "./components/popups/PopupsSection";
import { ReferralSection } from "./components/referral/ReferralSection";
import { SettingsSection } from "./components/settings/SettingsSection";
import { ShopSection } from "./components/shop/ShopSection";
import { StatisticsSection } from "./components/statistics/StatisticsSection";
import { TasksSection } from "./components/tasks/TasksSection";
import { VipSection } from "./components/vip/VipSection";

type AdminPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

function getStartOfToday() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
}

export default async function AdminPage({
  searchParams,
}: AdminPageProps) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(
    ADMIN_SESSION_COOKIE,
  )?.value;

  if (
    !sessionToken ||
    !verifyAdminSessionToken(sessionToken)
  ) {
    redirect("/admin/login");
  }

  const resolvedSearchParams = await searchParams;

  const activeSection = resolveAdminSection(
    resolvedSearchParams.section,
  );

  const startOfToday = getStartOfToday();

  const [
    totalPlayers,
    registeredToday,
    activeToday,
    players,
    latestPlayers,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),

    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: startOfToday,
        },
      },
    }),

    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),

    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  const serializedPlayers = players.map((player) => ({
    id: player.id,
    telegramId: player.telegramId.toString(),
    username: player.username,
    firstName: player.firstName,
    lastName: player.lastName,
    photoUrl: player.photoUrl,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
    lastLoginAt: player.lastLoginAt.toISOString(),
  }));

  return (
    <AdminLayout
      activeSection={activeSection}
      totalPlayers={totalPlayers}
    >
      {activeSection === "dashboard" && (
        <DashboardSection
          totalPlayers={totalPlayers}
          registeredToday={registeredToday}
          activeToday={activeToday}
          latestPlayers={latestPlayers}
        />
      )}

      {activeSection === "players" && (
        <PlayersSection players={serializedPlayers} />
      )}

      {activeSection === "tasks" && <TasksSection />}

      {activeSection === "popups" && <PopupsSection />}

      {activeSection === "daily-rewards" && (
        <DailyRewardsSection />
      )}

      {activeSection === "shop" && <ShopSection />}

      {activeSection === "vip" && <VipSection />}

      {activeSection === "referral" && (
        <ReferralSection players={serializedPlayers} />
      )}

      {activeSection === "leaderboard" && (
        <LeaderboardSection players={serializedPlayers} />
      )}

      {activeSection === "statistics" && (
        <StatisticsSection
          totalPlayers={totalPlayers}
          registeredToday={registeredToday}
          activeToday={activeToday}
          players={serializedPlayers}
        />
      )}

      {activeSection === "settings" && (
        <SettingsSection />
      )}
    </AdminLayout>
  );
}