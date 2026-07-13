"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";

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

import styles from "./AppHeader.module.css";

const PLAYER_STATE_SYNC_INTERVAL_MS = 15_000;

type AvatarFrameStyle = CSSProperties & {
  "--avatar-frame-offset-x": string;
  "--avatar-frame-offset-y": string;
  "--avatar-frame-scale": number;
};

type AvatarFrameVisualMetadata = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

function formatCompactNumber(
  value: number,
): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function readFiniteNumber(
  value: unknown,
  fallback: number,
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
      ? value
      : fallback
  );
}

function readAvatarFrameMetadata(
  metadata: unknown,
): AvatarFrameVisualMetadata {
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    Array.isArray(metadata)
  ) {
    return {
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    };
  }

  const record = metadata as Record<
    string,
    unknown
  >;

  return {
    offsetX: readFiniteNumber(
      record.offsetX,
      0,
    ),
    offsetY: readFiniteNumber(
      record.offsetY,
      0,
    ),
    scale: Math.max(
      0.1,
      readFiniteNumber(
        record.scale,
        1,
      ),
    ),
  };
}

export function AppHeader() {
  const balance = useGameStore(
    (state) => state.balance,
  );

  const energy = useGameStore(
    (state) => state.energy,
  );

  const maxEnergy = useGameStore(
    (state) => state.maxEnergy,
  );

  const vipLevel = useGameStore(
    (state) => state.vipLevel,
  );

  const applyServerState = useGameStore(
    (state) => state.applyServerState,
  );

  const [shopItems, setShopItems] =
    useState<PlayerShopItem[]>([]);

  const equippedAvatarFrame =
    shopItems.find(
      (item) =>
        item.effect === "AVATAR_FRAME" &&
        item.player.isEquipped &&
        Boolean(item.imageUrl),
    ) ?? null;

  const avatarFrameMetadata =
    equippedAvatarFrame
      ? readAvatarFrameMetadata(
          equippedAvatarFrame.metadata,
        )
      : null;

  const avatarFrameStyle:
    | AvatarFrameStyle
    | undefined = avatarFrameMetadata
    ? {
        "--avatar-frame-offset-x": `${avatarFrameMetadata.offsetX}px`,
        "--avatar-frame-offset-y": `${avatarFrameMetadata.offsetY}px`,
        "--avatar-frame-scale":
          avatarFrameMetadata.scale,
      }
    : undefined;

  useEffect(() => {
    const telegramInitData =
      getTelegramInitData();

    if (!telegramInitData) {
      return;
    }

    const initData: string =
      telegramInitData;

    let isDisposed = false;

    let activeController:
      | AbortController
      | null = null;

    async function synchronizePlayerState() {
      activeController?.abort();

      const controller =
        new AbortController();

      activeController = controller;

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
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (
          error instanceof PlayerApiError
        ) {
          console.error(
            "Player state synchronization failed:",
            {
              code: error.code,
              status: error.status,
              message: error.message,
            },
          );

          return;
        }

        console.error(
          "Player state synchronization failed:",
          error,
        );
      }
    }

    const intervalId =
      window.setInterval(() => {
        void synchronizePlayerState();
      }, PLAYER_STATE_SYNC_INTERVAL_MS);

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void synchronizePlayerState();
      }
    }

    function handleWindowFocus() {
      void synchronizePlayerState();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener(
      "focus",
      handleWindowFocus,
    );

    return () => {
      isDisposed = true;

      activeController?.abort();

      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus,
      );
    };
  }, [applyServerState]);

  useEffect(() => {
    const telegramInitData =
      getTelegramInitData();

    if (!telegramInitData) {
      return;
    }

    let isDisposed = false;
    let activeController:
      | AbortController
      | null = null;

    async function synchronizeShopCatalog() {
      activeController?.abort();

      const controller =
        new AbortController();

      activeController = controller;

      try {
        const items = await fetchPlayerShop(
          controller.signal,
        );

        if (!isDisposed) {
          setShopItems(items);
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (
          error instanceof PlayerApiError
        ) {
          console.error(
            "Player shop synchronization failed:",
            {
              code: error.code,
              status: error.status,
              message: error.message,
            },
          );

          return;
        }

        console.error(
          "Player shop synchronization failed:",
          error,
        );
      }
    }

    void synchronizeShopCatalog();

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void synchronizeShopCatalog();
      }
    }

    function handleWindowFocus() {
      void synchronizeShopCatalog();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener(
      "focus",
      handleWindowFocus,
    );

    return () => {
      isDisposed = true;
      activeController?.abort();

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus,
      );
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.profile}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            <span>S</span>
          </div>

          {equippedAvatarFrame?.imageUrl && (
            <Image
              className={styles.avatarFrame}
              src={
                equippedAvatarFrame.imageUrl
              }
              alt=""
              fill
              sizes="64px"
              style={avatarFrameStyle}
              priority
            />
          )}
        </div>

        <div className={styles.profileInfo}>
          <span className={styles.playerName}>
            Player
          </span>

          <div className={styles.vipBadge}>
            <span className={styles.vipIcon}>
              ◆
            </span>

            <span>VIP {vipLevel}</span>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span
            className={styles.balanceIcon}
          />

          <div className={styles.statText}>
            <span
              className={styles.statLabel}
            >
              Balance
            </span>

            <strong
              className={styles.statValue}
            >
              {formatCompactNumber(balance)}
            </strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <span
            className={styles.energyIcon}
          >
            ⚡
          </span>

          <div className={styles.statText}>
            <span
              className={styles.statLabel}
            >
              Energy
            </span>

            <strong
              className={styles.statValue}
            >
              {energy.toLocaleString(
                "en-US",
              )}

              <span className={styles.statMax}>
                /
                {maxEnergy.toLocaleString(
                  "en-US",
                )}
              </span>
            </strong>
          </div>
        </div>
      </div>
    </header>
  );
}