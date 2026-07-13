"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useRef,
  useState,
} from "react";

import { useGameStore } from "@/game/gameStore";
import {
  createPlayerRequestId,
  getTelegramInitData,
  PlayerApiError,
  submitPlayerTap,
} from "@/lib/playerApi";
import type { PlayerShopItem } from "@/lib/playerShopApi";

import styles from "./ClubScreen.module.css";

const particles = [
  { id: 1, className: styles.particleOne },
  { id: 2, className: styles.particleTwo },
  { id: 3, className: styles.particleThree },
  { id: 4, className: styles.particleFour },
  { id: 5, className: styles.particleFive },
  { id: 6, className: styles.particleSix },
  { id: 7, className: styles.particleSeven },
  { id: 8, className: styles.particleEight },
];

const charmPositions = {
  1: { x: 9, y: 42, rotate: -8, size: 42 },
  2: { x: 23, y: 18, rotate: 6, size: 40 },
  3: { x: 36, y: 48, rotate: -5, size: 42 },
  4: { x: 49, y: 24, rotate: 7, size: 40 },
  5: { x: 62, y: 46, rotate: -7, size: 42 },
  6: { x: 74, y: 16, rotate: 5, size: 40 },
  7: { x: 87, y: 40, rotate: -6, size: 42 },
  8: { x: 95, y: 20, rotate: 8, size: 40 },
} as const;

type CharmPositionStyle = CSSProperties & {
  "--charm-rotate": string;
  "--charm-delay": string;
};

type RewardStyle = CSSProperties & {
  "--reward-drift": string;
};

type ShopVisualMetadata = {
  offsetX: number;
  offsetY: number;
  scale: number;
  slot: number | null;
};

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

function readVisualMetadata(
  metadata: unknown,
): ShopVisualMetadata {
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    Array.isArray(metadata)
  ) {
    return {
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      slot: null,
    };
  }

  const record = metadata as Record<
    string,
    unknown
  >;

  const slotValue =
    typeof record.slot === "number" &&
    Number.isInteger(record.slot)
      ? record.slot
      : null;

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
    slot:
      slotValue !== null &&
      slotValue >= 1 &&
      slotValue <= 8
        ? slotValue
        : null,
  };
}

type ClubScreenProps = {
  shopItems: PlayerShopItem[];
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
};

type TapReward = {
  id: number;
  amount: number;
  x: number;
  y: number;
  drift: number;
};

function parseRewardAmount(
  value: string,
): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(
      "Tap API returned an invalid reward amount.",
    );
  }

  const amount = Number(value);

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Tap reward exceeds the supported client range.",
    );
  }

  return amount;
}

export function ClubScreen({
  shopItems,
  onOpenShop,
  onOpenLeaderboard,
}: ClubScreenProps) {
  const energy = useGameStore(
    (state) => state.energy,
  );

  const energyCostPerTap = useGameStore(
    (state) => state.energyCostPerTap,
  );

  const applyServerState = useGameStore(
    (state) => state.applyServerState,
  );

  const tapAreaRef =
    useRef<HTMLDivElement | null>(null);

  const rewardIdRef = useRef(0);

  const pendingTapCountRef = useRef(0);

  const [tapRewards, setTapRewards] =
    useState<TapReward[]>([]);

  const [isTapRequestPending, setIsTapRequestPending] =
    useState(false);


  const canTap =
    energy >= energyCostPerTap &&
    !isTapRequestPending;

  const equippedTapSkin =
    shopItems.find(
      (item) =>
        item.effect === "TAP_SKIN" &&
        item.player.isEquipped &&
        Boolean(item.imageUrl),
    ) ?? null;

  const equippedCharms =
    shopItems.filter(
      (item) =>
        item.effect === "CHARM" &&
        item.player.isEquipped &&
        Boolean(item.imageUrl),
    );


  function showTapReward(params: {
    amount: number;
    x: number;
    y: number;
  }) {
    rewardIdRef.current += 1;

    const rewardId = rewardIdRef.current;

    const newReward: TapReward = {
      id: rewardId,
      amount: params.amount,
      x: params.x,
      y: params.y,
      drift: Math.round(
        Math.random() * 40 - 20,
      ),
    };

    setTapRewards((currentRewards) => [
      ...currentRewards,
      newReward,
    ]);

    window.setTimeout(() => {
      setTapRewards((currentRewards) =>
        currentRewards.filter(
          (reward) =>
            reward.id !== rewardId,
        ),
      );
    }, 850);
  }

  async function submitTap(params: {
    x: number;
    y: number;
  }) {
    const initData = getTelegramInitData();

    if (!initData) {
      console.error(
        "Cannot process tap without Telegram initData.",
      );

      return;
    }

    const requestId =
      createPlayerRequestId();

    pendingTapCountRef.current += 1;
    setIsTapRequestPending(true);

    try {
      const result =
        await submitPlayerTap({
          initData,
          requestId,
        });

      const currentRevision =
        useGameStore.getState()
          .serverRevision;

      if (
        result.state.revision >=
        currentRevision
      ) {
        applyServerState(result.state);
      }

      if (!result.duplicate) {
        showTapReward({
          amount: parseRewardAmount(
            result.earned,
          ),
          x: params.x,
          y: params.y,
        });
      }
    } catch (error) {
      if (error instanceof PlayerApiError) {
        if (
          error.code !==
            "RATE_LIMIT_EXCEEDED" &&
          error.code !==
            "INSUFFICIENT_ENERGY"
        ) {
          console.error(
            "Player tap request failed:",
            {
              code: error.code,
              status: error.status,
              message: error.message,
            },
          );
        }

        return;
      }

      console.error(
        "Failed to send player tap:",
        error,
      );
    } finally {
      pendingTapCountRef.current =
        Math.max(
          0,
          pendingTapCountRef.current - 1,
        );

      setIsTapRequestPending(
        pendingTapCountRef.current > 0,
      );
    }
  }

  function processTap(
    clientX?: number,
    clientY?: number,
  ) {
    if (!canTap) {
      return;
    }

    const tapArea = tapAreaRef.current;

    if (!tapArea) {
      return;
    }

    const areaRect =
      tapArea.getBoundingClientRect();

    const x =
      typeof clientX === "number"
        ? clientX - areaRect.left
        : areaRect.width / 2;

    const y =
      typeof clientY === "number"
        ? clientY - areaRect.top
        : areaRect.height / 2;

    void submitTap({
      x,
      y,
    });
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    processTap(
      event.clientX,
      event.clientY,
    );
  }

  function handleKeyboardClick(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    if (event.detail !== 0) {
      return;
    }

    processTap();
  }

  return (
    <section className={styles.screen}>
      <div className={styles.quickActions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onOpenShop}
        >
          <span className={styles.actionIcon}>
            🛍
          </span>

          <span className={styles.actionText}>
            <strong>Shop</strong>
            <small>Upgrades</small>
          </span>
        </button>

        <button
          type="button"
          className={styles.actionButton}
          onClick={onOpenLeaderboard}
        >
          <span className={styles.actionIcon}>
            🏆
          </span>

          <span className={styles.actionText}>
            <strong>Top Users</strong>
            <small>Leaderboard</small>
          </span>
        </button>
      </div>

      <div
        ref={tapAreaRef}
        className={styles.tapArea}
      >
        <div
          className={styles.backgroundPulse}
        />

        <div
          className={
            styles.backgroundPulseSecond
          }
        />

        <div className={styles.lightRing} />

        <div
          className={styles.lightRingSecond}
        />

        <div className={styles.particles}>
          {particles.map((particle) => (
            <span
              key={particle.id}
              className={`${styles.particle} ${particle.className}`}
            />
          ))}
        </div>

        <div className={styles.charmsLayer}>
          {equippedCharms.map(
            (charm, index) => {
              if (!charm.imageUrl) {
                return null;
              }

              const metadata =
                readVisualMetadata(
                  charm.metadata,
                );

              const slot =
                metadata.slot ??
                ((index % 8) + 1);

              const position =
                charmPositions[
                  slot as keyof typeof charmPositions
                ];

              const charmStyle: CharmPositionStyle = {
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${position.size}px`,
                height: `${position.size}px`,
                "--charm-rotate": `${position.rotate}deg`,
                "--charm-delay": `${
                  (slot - 1) * -0.35
                }s`,
              };

              return (
                <div
                  key={charm.id}
                  className={styles.charmPosition}
                  style={charmStyle}
                >
                  <div className={styles.charmFloat}>
                    <Image
                      src={charm.imageUrl}
                      alt=""
                      width={position.size}
                      height={position.size}
                      className={styles.charmImage}
                      unoptimized
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>

        <div className={styles.tapDecor}>
          <span
            className={`${styles.star} ${styles.starOne}`}
          >
            ✦
          </span>

          <span
            className={`${styles.star} ${styles.starTwo}`}
          >
            ✧
          </span>

          <span
            className={`${styles.star} ${styles.starThree}`}
          >
            ✦
          </span>

          <span
            className={`${styles.star} ${styles.starFour}`}
          >
            ✧
          </span>

          <span
            className={`${styles.star} ${styles.starFive}`}
          >
            ✦
          </span>

          <span
            className={`${styles.star} ${styles.starSix}`}
          >
            ✧
          </span>
        </div>

        <div className={styles.tapRewards}>
          {tapRewards.map((reward) => {
            const rewardStyle: RewardStyle = {
              left: reward.x,
              top: reward.y,
              "--reward-drift": `${reward.drift}px`,
            };

            return (
              <span
                key={reward.id}
                className={styles.tapReward}
                style={rewardStyle}
              >
                +
                {reward.amount.toLocaleString(
                  "en-US",
                )}
              </span>
            );
          })}
        </div>

        <div className={styles.tapButtonWrap}>
          <div className={styles.tapGlow} />

          <button
            type="button"
            className={styles.tapButton}
            aria-label="Tap"
            onPointerDown={handlePointerDown}
            onClick={handleKeyboardClick}
            disabled={!canTap}
          >
            {equippedTapSkin?.imageUrl && (() => {
              const metadata =
                readVisualMetadata(
                  equippedTapSkin.metadata,
                );

              return (
                <Image
                  src={equippedTapSkin.imageUrl}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 360px) 220px, 260px"
                  className={
                    styles.tapSkinImage
                  }
                  style={{
                    transform: `translate(${metadata.offsetX}px, ${metadata.offsetY}px) scale(${metadata.scale})`,
                  }}
                  unoptimized
                />
              );
            })()}
          </button>
        </div>

        <span className={styles.tapHint}>
          {energy < energyCostPerTap
            ? "Not enough energy"
            : isTapRequestPending
              ? "Processing..."
              : "Tap to earn"}
        </span>
      </div>
    </section>
  );
}