"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useRef,
  useState,
} from "react";

import {
  CHARMS,
  DEFAULT_TAP_SKIN_ID,
  getTapSkinById,
} from "@/config/shopItems";
import { useCosmeticsStore } from "@/game/cosmeticsStore";
import { useGameStore } from "@/game/gameStore";

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

type ClubScreenProps = {
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

type RewardStyle = CSSProperties & {
  "--reward-drift": string;
};

export function ClubScreen({
  onOpenShop,
  onOpenLeaderboard,
}: ClubScreenProps) {
  const tap = useGameStore((state) => state.tap);

  const energy = useGameStore(
    (state) => state.energy,
  );

  const energyCostPerTap = useGameStore(
    (state) => state.energyCostPerTap,
  );

  const equippedTapSkinId =
    useCosmeticsStore(
      (state) => state.equippedTapSkinId,
    );

  const equippedCharmIds =
    useCosmeticsStore(
      (state) => state.equippedCharmIds,
    );

  const tapAreaRef =
    useRef<HTMLDivElement | null>(null);

  const rewardIdRef = useRef(0);

  const [tapRewards, setTapRewards] =
    useState<TapReward[]>([]);

  const canTap =
    energy >= energyCostPerTap;

  const equippedTapSkin =
    getTapSkinById(equippedTapSkinId) ??
    getTapSkinById(DEFAULT_TAP_SKIN_ID);

  function createTapReward(
    clientX?: number,
    clientY?: number,
  ) {
    const result = tap();

    if (!result.success) {
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

    rewardIdRef.current += 1;

    const rewardId = rewardIdRef.current;

    const newReward: TapReward = {
      id: rewardId,
      amount: result.earned,
      x,
      y,
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

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    createTapReward(
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

    createTapReward();
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
          {CHARMS.map((charm) => {
            if (
              !equippedCharmIds.includes(
                charm.id,
              )
            ) {
              return null;
            }

            const position =
              charmPositions[
                charm.slot as keyof typeof charmPositions
              ];

            if (!position) {
              return null;
            }

            const charmStyle: CharmPositionStyle = {
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.size}px`,
              height: `${position.size}px`,
              "--charm-rotate": `${position.rotate}deg`,
              "--charm-delay": `${
                (charm.slot - 1) * -0.35
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
                    src={charm.image}
                    alt=""
                    width={position.size}
                    height={position.size}
                    className={styles.charmImage}
                  />
                </div>
              </div>
            );
          })}
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
            {equippedTapSkin && (
             <Image
  src={equippedTapSkin.image}
  alt=""
  fill
  priority
  sizes="(max-width: 360px) 220px, 260px"
  className={styles.tapSkinImage}
  style={{
    transform: `translate(${equippedTapSkin.offsetX}px, ${equippedTapSkin.offsetY}px) scale(${equippedTapSkin.scale})`,
  }}
/>
            )}
          </button>
        </div>

        <span className={styles.tapHint}>
          {canTap
            ? "Tap to earn"
            : "Not enough energy"}
        </span>
      </div>
    </section>
  );
}