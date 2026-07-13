"use client";

import {
  useEffect,
  useState,
} from "react";

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
import { useGameStore } from "@/game/gameStore";
import {
  fetchPlayerState,
  getTelegramInitData,
  PlayerApiError,
} from "@/lib/playerApi";

type AppScreen =
  | NavigationTab
  | "shop"
  | "leaderboard";

type LoadingStatus =
  | "loading"
  | "ready"
  | "error";

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
};

function initializeTelegramWebApp() {
  const telegram = (
    window as Window & {
      Telegram?: {
        WebApp?: TelegramWebApp;
      };
    }
  ).Telegram?.WebApp;

  telegram?.ready?.();
  telegram?.expand?.();
}

export default function HomePage() {
  const [activeScreen, setActiveScreen] =
    useState<AppScreen>("club");

  const [loadingStatus, setLoadingStatus] =
    useState<LoadingStatus>("loading");

  const [loadingError, setLoadingError] =
    useState<string | null>(null);

  const applyServerState = useGameStore(
    (state) => state.applyServerState,
  );

  useEffect(() => {
    initializeTelegramWebApp();

    const telegramInitData =
      getTelegramInitData();

    if (!telegramInitData) {
      setLoadingStatus("error");
      setLoadingError(
        "Telegram authorization data is unavailable. Open the game through the Telegram bot.",
      );

      return;
    }

    const initData: string =
      telegramInitData;

    const controller =
      new AbortController();

    async function loadPlayerState() {
      try {
        const serverState =
          await fetchPlayerState({
            initData,
            signal: controller.signal,
          });

        applyServerState(serverState);

        setLoadingError(null);
        setLoadingStatus("ready");
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Player state loading failed:",
          error,
        );

        setLoadingStatus("error");

        if (error instanceof PlayerApiError) {
          setLoadingError(error.message);
          return;
        }

        setLoadingError(
          "Failed to load player state.",
        );
      }
    }

    void loadPlayerState();

    return () => {
      controller.abort();
    };
  }, [applyServerState]);

  function handleNavigationChange(
    tab: NavigationTab,
  ) {
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
            onBack={() =>
              setActiveScreen("club")
            }
          />
        );

      case "leaderboard":
        return (
          <LeaderboardScreen
            onBack={() =>
              setActiveScreen("club")
            }
          />
        );

      case "club":
      default:
        return (
          <ClubScreen
            onOpenShop={() =>
              setActiveScreen("shop")
            }
            onOpenLeaderboard={() =>
              setActiveScreen(
                "leaderboard",
              )
            }
          />
        );
    }
  }

  if (loadingStatus !== "ready") {
    return (
      <CasinoBackground>
        <main
          className="app-content"
          style={{
            display: "flex",
            minHeight: "100dvh",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div>
            <strong>
              {loadingStatus === "loading"
                ? "Loading player data..."
                : "Unable to start the game"}
            </strong>

            {loadingError && (
              <p
                style={{
                  marginTop: "12px",
                  maxWidth: "320px",
                  opacity: 0.75,
                }}
              >
                {loadingError}
              </p>
            )}
          </div>
        </main>
      </CasinoBackground>
    );
  }

  const activeNavigationTab:
    NavigationTab =
    activeScreen === "shop" ||
    activeScreen === "leaderboard"
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
        onChange={
          handleNavigationChange
        }
      />
    </CasinoBackground>
  );
}