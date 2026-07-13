"use client";

import {
  useCallback,
  useEffect,
  useRef,
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
import {
  fetchPlayerShop,
  type PlayerShopItem,
} from "@/lib/playerShopApi";

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

const PLAYER_STATE_SYNC_INTERVAL_MS = 60_000;
const FOREGROUND_REFRESH_MIN_HIDDEN_MS = 30_000;
const FOREGROUND_REFRESH_COOLDOWN_MS = 30_000;

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

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    error.name === "AbortError"
  );
}

function getShopErrorMessage(
  error: unknown,
): string {
  if (error instanceof PlayerApiError) {
    return error.message;
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Failed to load the shop catalog.";
}

export default function HomePage() {
  const [activeScreen, setActiveScreen] =
    useState<AppScreen>("club");

  const [loadingStatus, setLoadingStatus] =
    useState<LoadingStatus>("loading");

  const [loadingError, setLoadingError] =
    useState<string | null>(null);

  const [shopItems, setShopItems] =
    useState<PlayerShopItem[]>([]);

  const [isShopLoading, setIsShopLoading] =
    useState(true);

  const [shopLoadingError, setShopLoadingError] =
    useState<string | null>(null);

  const applyServerState = useGameStore(
    (state) => state.applyServerState,
  );

  const lastPlayerStateSyncAtRef =
    useRef(0);
  const lastShopSyncAtRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(
    null,
  );
  const stateRequestPromiseRef =
    useRef<Promise<void> | null>(null);
  const shopRequestPromiseRef =
    useRef<Promise<void> | null>(null);

  const refreshShopCatalog = useCallback(
    async (signal?: AbortSignal) => {
      if (shopRequestPromiseRef.current) {
        return shopRequestPromiseRef.current;
      }

      const requestPromise = (async () => {
        setIsShopLoading(true);
        setShopLoadingError(null);

        try {
          const catalog = await fetchPlayerShop(
            signal,
          );

          setShopItems(catalog);
          lastShopSyncAtRef.current =
            Date.now();
        } catch (error) {
          if (isAbortError(error)) {
            throw error;
          }

          setShopLoadingError(
            getShopErrorMessage(error),
          );

          throw error;
        } finally {
          if (!signal?.aborted) {
            setIsShopLoading(false);
          }
        }
      })();

      shopRequestPromiseRef.current =
        requestPromise;

      try {
        await requestPromise;
      } finally {
        if (
          shopRequestPromiseRef.current ===
          requestPromise
        ) {
          shopRequestPromiseRef.current = null;
        }
      }
    },
    [],
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
      setIsShopLoading(false);

      return;
    }

    const initData: string =
      telegramInitData;

    let isDisposed = false;
    let activeStateController:
      | AbortController
      | null = null;
    let activeShopController:
      | AbortController
      | null = null;

    async function synchronizePlayerState() {
      if (stateRequestPromiseRef.current) {
        return stateRequestPromiseRef.current;
      }

      activeStateController?.abort();

      const controller =
        new AbortController();

      activeStateController = controller;

      const requestPromise = (async () => {
        try {
          const serverState =
            await fetchPlayerState({
              initData,
              signal: controller.signal,
            });

          if (isDisposed) {
            return;
          }

          const currentRevision =
            useGameStore.getState()
              .serverRevision;

          if (
            serverState.revision >=
            currentRevision
          ) {
            applyServerState(serverState);
          }

          lastPlayerStateSyncAtRef.current =
            Date.now();
        } catch (error) {
          if (isAbortError(error)) {
            return;
          }

          console.error(
            "Player state synchronization failed:",
            error,
          );
        }
      })();

      stateRequestPromiseRef.current =
        requestPromise;

      try {
        await requestPromise;
      } finally {
        if (
          stateRequestPromiseRef.current ===
          requestPromise
        ) {
          stateRequestPromiseRef.current = null;
        }
      }
    }

    async function synchronizeShopCatalog() {
      activeShopController?.abort();

      const controller =
        new AbortController();

      activeShopController = controller;

      try {
        await refreshShopCatalog(
          controller.signal,
        );
      } catch (error) {
        if (!isAbortError(error)) {
          console.error(
            "Player shop synchronization failed:",
            error,
          );
        }
      }
    }

    async function loadInitialData() {
      const [stateResult, shopResult] =
        await Promise.allSettled([
          fetchPlayerState({
            initData,
          }),
          fetchPlayerShop(),
        ]);

      if (isDisposed) {
        return;
      }

      const now = Date.now();

      if (stateResult.status === "fulfilled") {
        applyServerState(stateResult.value);
        lastPlayerStateSyncAtRef.current = now;
        setLoadingError(null);
        setLoadingStatus("ready");
      } else {
        const error = stateResult.reason;

        console.error(
          "Player state loading failed:",
          error,
        );

        setLoadingStatus("error");

        if (error instanceof PlayerApiError) {
          setLoadingError(error.message);
        } else {
          setLoadingError(
            "Failed to load player state.",
          );
        }
      }

      if (shopResult.status === "fulfilled") {
        setShopItems(shopResult.value);
        lastShopSyncAtRef.current = now;
        setShopLoadingError(null);
      } else {
        setShopLoadingError(
          getShopErrorMessage(
            shopResult.reason,
          ),
        );
      }

      setIsShopLoading(false);
    }

    void loadInitialData();

    const intervalId = window.setInterval(
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void synchronizePlayerState();
        }
      },
      PLAYER_STATE_SYNC_INTERVAL_MS,
    );

    function handleVisibilityChange() {
      const now = Date.now();

      if (
        document.visibilityState ===
        "hidden"
      ) {
        hiddenAtRef.current = now;
        return;
      }

      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;

      if (hiddenAt === null) {
        return;
      }

      const hiddenDuration = now - hiddenAt;

      if (
        hiddenDuration <
        FOREGROUND_REFRESH_MIN_HIDDEN_MS
      ) {
        return;
      }

      if (
        now -
          lastPlayerStateSyncAtRef.current >=
        FOREGROUND_REFRESH_COOLDOWN_MS
      ) {
        void synchronizePlayerState();
      }

      if (
        now - lastShopSyncAtRef.current >=
        FOREGROUND_REFRESH_COOLDOWN_MS
      ) {
        void synchronizeShopCatalog();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      isDisposed = true;
      activeStateController?.abort();
      activeShopController?.abort();
      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [applyServerState, refreshShopCatalog]);

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
            items={shopItems}
            isLoading={isShopLoading}
            loadingError={shopLoadingError}
            onRefresh={refreshShopCatalog}
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
            shopItems={shopItems}
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
      <AppHeader shopItems={shopItems} />

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
