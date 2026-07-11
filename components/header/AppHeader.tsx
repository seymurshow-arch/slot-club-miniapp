"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
} from "react";

import {
  DEFAULT_AVATAR_FRAME_ID,
  getAvatarFrameById,
} from "@/config/shopItems";
import { useCosmeticsStore } from "@/game/cosmeticsStore";
import { useGameStore } from "@/game/gameStore";
import styles from "./AppHeader.module.css";

type AvatarFrameStyle = CSSProperties & {
  "--avatar-frame-offset-x": string;
  "--avatar-frame-offset-y": string;
  "--avatar-frame-scale": number;
};

function formatCompactNumber(
  value: number,
): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
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

  const syncEnergy = useGameStore(
    (state) => state.syncEnergy,
  );

  const equippedAvatarFrameId =
    useCosmeticsStore(
      (state) =>
        state.equippedAvatarFrameId,
    );

  const equippedAvatarFrame =
    getAvatarFrameById(
      equippedAvatarFrameId,
    ) ??
    getAvatarFrameById(
      DEFAULT_AVATAR_FRAME_ID,
    );

  const avatarFrameStyle:
    | AvatarFrameStyle
    | undefined = equippedAvatarFrame
    ? {
        "--avatar-frame-offset-x": `${equippedAvatarFrame.offsetX}px`,
        "--avatar-frame-offset-y": `${equippedAvatarFrame.offsetY}px`,
        "--avatar-frame-scale":
          equippedAvatarFrame.scale,
      }
    : undefined;

  useEffect(() => {
    syncEnergy();

    const intervalId = window.setInterval(
      () => {
        syncEnergy();
      },
      1_000,
    );

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        syncEnergy();
      }
    }

    function handleWindowFocus() {
      syncEnergy();
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
  }, [syncEnergy]);

  return (
    <header className={styles.header}>
      <div className={styles.profile}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            <span>S</span>
          </div>

          {equippedAvatarFrame && (
            <Image
              className={styles.avatarFrame}
              src={equippedAvatarFrame.image}
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

            <span>VIP 1</span>
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
