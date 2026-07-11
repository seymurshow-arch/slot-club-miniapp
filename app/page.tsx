"use client";

import { useEffect, useState } from "react";

import { AppHeader } from "@/components/header/AppHeader";
import { CasinoBackground } from "@/components/layout/CasinoBackground";
import {
  BottomNavigation,
  type NavigationTab,
} from "@/components/navigation/BottomNavigation";

import { ClubScreen } from "@/features/club/components/ClubScreen";
import { DailyScreen } from "@/features/daily/components/DailyScreen";
import { LeaderboardScreen } from "@/features/leaderboard/components/LeaderboardScreen";
import { ReferralScreen } from "@/features/referrals/components/ReferralScreen";
import { ShopScreen } from "@/features/shop/components/ShopScreen";
import { TasksScreen } from "@/features/tasks/components/TasksScreen";
import { VipScreen } from "@/features/vip/components/VipScreen";

type AppScreen = NavigationTab | "shop" | "leaderboard";

export default function HomePage() {
  const [activeScreen, setActiveScreen] =
    useState<AppScreen>("club");

  useEffect(() => {
    const telegram = (window as Window & {
      Telegram?: {
        WebApp?: {
          initData?: string;
          ready?: () => void;
          expand?: () => void;
        };
      };
    }).Telegram?.WebApp;

    telegram?.ready?.();
    telegram?.expand?.();

    const initData = telegram?.initData;

    if (!initData) {
      return;
    }

    const controller = new AbortController();

    async function authenticateTelegramUser() {
      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ initData }),
          signal: controller.signal,
        });

        if (!response.ok) {
          console.error("Telegram authentication failed.");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Telegram authentication request failed:", error);
      }
    }

    void authenticateTelegramUser();

    return () => controller.abort();
  }, []);

  function handleNavigationChange(tab: NavigationTab) {
    setActiveScreen(tab);
  }

  function renderActiveScreen() {
    switch (activeScreen) {
      case "tasks":
        return <TasksScreen />;

      case "daily":
        return <DailyScreen />;

      case "vip":
        return <VipScreen />;

      case "referrals":
        return <ReferralScreen />;

      case "shop":
  return (
    <ShopScreen
      onBack={() => setActiveScreen("club")}
    />
  );

case "leaderboard":
  return (
    <LeaderboardScreen
      onBack={() => setActiveScreen("club")}
    />
  );

      case "club":
      default:
        return (
          <ClubScreen
            onOpenShop={() => setActiveScreen("shop")}
            onOpenLeaderboard={() =>
              setActiveScreen("leaderboard")
            }
          />
        );
    }
  }

  const activeNavigationTab: NavigationTab =
    activeScreen === "shop" || activeScreen === "leaderboard"
      ? "club"
      : activeScreen;

  return (
    <CasinoBackground>
      <AppHeader />

      <main className="app-content">
        {renderActiveScreen()}
      </main>

      <BottomNavigation
        activeTab={activeNavigationTab}
        onChange={handleNavigationChange}
      />
    </CasinoBackground>
  );
}