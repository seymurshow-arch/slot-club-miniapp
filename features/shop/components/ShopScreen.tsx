"use client";

import Image from "next/image";
import { useState } from "react";

import { GAME_CONFIG } from "@/config/gameConfig";
import {
  AVATAR_FRAMES,
  CHARMS,
  TAP_SKINS,
  type AvatarFrameId,
  type CharmId,
  type TapSkinId,
} from "@/config/shopItems";
import { useCosmeticsStore } from "@/game/cosmeticsStore";
import {
  getUpgradePrice,
  useGameStore,
} from "@/game/gameStore";

import styles from "./ShopScreen.module.css";

const categories = [
  "All",
  "Boosts",
  "Energy",
  "Special",
] as const;

type ShopCategory =
  (typeof categories)[number];

type ShopScreenProps = {
  onBack: () => void;
};

function formatPrice(value: number): string {
  if (value === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function ShopScreen({
  onBack,
}: ShopScreenProps) {
  const [activeCategory, setActiveCategory] =
    useState<ShopCategory>("All");

  const balance = useGameStore(
    (state) => state.balance,
  );

  const energy = useGameStore(
    (state) => state.energy,
  );

  const maxEnergy = useGameStore(
    (state) => state.maxEnergy,
  );

  const tapPower = useGameStore(
    (state) => state.tapPower,
  );

  const energyRestoreAmount = useGameStore(
    (state) => state.energyRestoreAmount,
  );

  const tapPowerUpgradeLevel = useGameStore(
    (state) => state.tapPowerUpgradeLevel,
  );

  const maxEnergyUpgradeLevel = useGameStore(
    (state) => state.maxEnergyUpgradeLevel,
  );

  const energyRecoveryUpgradeLevel =
    useGameStore(
      (state) =>
        state.energyRecoveryUpgradeLevel,
    );

  const buyUpgrade = useGameStore(
    (state) => state.buyUpgrade,
  );

  const buyFullEnergy = useGameStore(
    (state) => state.buyFullEnergy,
  );

  const ownedTapSkinIds =
    useCosmeticsStore(
      (state) => state.ownedTapSkinIds,
    );

  const equippedTapSkinId =
    useCosmeticsStore(
      (state) => state.equippedTapSkinId,
    );

  const ownedAvatarFrameIds =
    useCosmeticsStore(
      (state) =>
        state.ownedAvatarFrameIds,
    );

  const equippedAvatarFrameId =
    useCosmeticsStore(
      (state) =>
        state.equippedAvatarFrameId,
    );

  const ownedCharmIds =
    useCosmeticsStore(
      (state) => state.ownedCharmIds,
    );

  const equippedCharmIds =
    useCosmeticsStore(
      (state) => state.equippedCharmIds,
    );

  const buyTapSkin =
    useCosmeticsStore(
      (state) => state.buyTapSkin,
    );

  const equipTapSkin =
    useCosmeticsStore(
      (state) => state.equipTapSkin,
    );

  const buyAvatarFrame =
    useCosmeticsStore(
      (state) => state.buyAvatarFrame,
    );

  const equipAvatarFrame =
    useCosmeticsStore(
      (state) => state.equipAvatarFrame,
    );

  const buyCharm =
    useCosmeticsStore(
      (state) => state.buyCharm,
    );

  const toggleCharm =
    useCosmeticsStore(
      (state) => state.toggleCharm,
    );

  const tapPowerConfig =
    GAME_CONFIG.upgrades.tapPower;

  const maxEnergyConfig =
    GAME_CONFIG.upgrades.maxEnergy;

  const energyRecoveryConfig =
    GAME_CONFIG.upgrades.energyRecovery;

  const tapPowerPrice = getUpgradePrice(
    "tapPower",
    tapPowerUpgradeLevel,
  );

  const maxEnergyPrice = getUpgradePrice(
    "maxEnergy",
    maxEnergyUpgradeLevel,
  );

  const energyRecoveryPrice =
    getUpgradePrice(
      "energyRecovery",
      energyRecoveryUpgradeLevel,
    );

  const fullEnergyPrice =
    GAME_CONFIG.consumables.fullEnergy.price;

  const tapPowerIsMax =
    tapPowerUpgradeLevel >=
    tapPowerConfig.maxLevel;

  const maxEnergyIsMax =
    maxEnergyUpgradeLevel >=
    maxEnergyConfig.maxLevel;

  const energyRecoveryIsMax =
    energyRecoveryUpgradeLevel >=
    energyRecoveryConfig.maxLevel;

  const isEnergyFull = energy >= maxEnergy;

  const showBoosts =
    activeCategory === "All" ||
    activeCategory === "Boosts";

  const showEnergy =
    activeCategory === "All" ||
    activeCategory === "Energy";

  const showSpecial =
    activeCategory === "All" ||
    activeCategory === "Special";

  function handleTapSkin(
    id: TapSkinId,
  ): void {
    const isOwned =
      ownedTapSkinIds.includes(id);

    if (isOwned) {
      equipTapSkin(id);
      return;
    }

    buyTapSkin(id);
  }

  function handleAvatarFrame(
    id: AvatarFrameId,
  ): void {
    const isOwned =
      ownedAvatarFrameIds.includes(id);

    if (isOwned) {
      equipAvatarFrame(id);
      return;
    }

    buyAvatarFrame(id);
  }

  function handleCharm(
    id: CharmId,
  ): void {
    const isOwned =
      ownedCharmIds.includes(id);

    if (isOwned) {
      toggleCharm(id);
      return;
    }

    buyCharm(id);
  }

  return (
    <section className={styles.screen}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
      >
        <span>←</span>
        Back to Club
      </button>

      <div className={styles.heading}>
        <span className={styles.eyebrow}>
          Shop
        </span>

        <h1 className={styles.title}>
          Game Store
        </h1>

        <p className={styles.description}>
          Spend your coins on boosts, energy
          and exclusive items.
        </p>
      </div>

      <div className={styles.categories}>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`${styles.category} ${
              activeCategory === category
                ? styles.activeCategory
                : ""
            }`}
            onClick={() =>
              setActiveCategory(category)
            }
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.items}>
        {showBoosts && (
          <>
            <article className={styles.itemCard}>
              <div className={styles.itemTop}>
                <div className={styles.itemIcon}>
                  ⚡
                </div>

                <span className={styles.badge}>
                  Level {tapPowerUpgradeLevel}
                </span>
              </div>

              <h3>Tap Power</h3>

              <p>
                {tapPowerIsMax
                  ? `${tapPower} coins per tap`
                  : `${tapPower} → ${
                      tapPower +
                      tapPowerConfig.valuePerLevel
                    } coins per tap`}
              </p>

              <div className={styles.itemBottom}>
                <strong>
                  {tapPowerIsMax
                    ? "MAX"
                    : formatPrice(
                        tapPowerPrice,
                      )}
                </strong>

                <button
                  type="button"
                  disabled={
                    tapPowerIsMax ||
                    balance < tapPowerPrice
                  }
                  onClick={() =>
                    buyUpgrade("tapPower")
                  }
                >
                  {tapPowerIsMax
                    ? "MAX"
                    : balance < tapPowerPrice
                      ? "Not enough"
                      : "Buy"}
                </button>
              </div>
            </article>

            <article className={styles.itemCard}>
              <div className={styles.itemTop}>
                <div className={styles.itemIcon}>
                  🔋
                </div>

                <span className={styles.badge}>
                  Level {maxEnergyUpgradeLevel}
                </span>
              </div>

              <h3>Max Energy</h3>

              <p>
                {maxEnergyIsMax
                  ? `${maxEnergy.toLocaleString(
                      "en-US",
                    )} max energy`
                  : `${maxEnergy.toLocaleString(
                      "en-US",
                    )} → ${(
                      maxEnergy +
                      maxEnergyConfig.valuePerLevel
                    ).toLocaleString(
                      "en-US",
                    )} max energy`}
              </p>

              <div className={styles.itemBottom}>
                <strong>
                  {maxEnergyIsMax
                    ? "MAX"
                    : formatPrice(
                        maxEnergyPrice,
                      )}
                </strong>

                <button
                  type="button"
                  disabled={
                    maxEnergyIsMax ||
                    balance < maxEnergyPrice
                  }
                  onClick={() =>
                    buyUpgrade("maxEnergy")
                  }
                >
                  {maxEnergyIsMax
                    ? "MAX"
                    : balance < maxEnergyPrice
                      ? "Not enough"
                      : "Buy"}
                </button>
              </div>
            </article>

            <article className={styles.itemCard}>
              <div className={styles.itemTop}>
                <div className={styles.itemIcon}>
                  ♻️
                </div>

                <span className={styles.badge}>
                  Level{" "}
                  {energyRecoveryUpgradeLevel}
                </span>
              </div>

              <h3>Energy Recovery</h3>

              <p>
                {energyRecoveryIsMax
                  ? `${energyRestoreAmount} energy per minute`
                  : `${energyRestoreAmount} → ${
                      energyRestoreAmount +
                      energyRecoveryConfig.valuePerLevel
                    } energy per minute`}
              </p>

              <div className={styles.itemBottom}>
                <strong>
                  {energyRecoveryIsMax
                    ? "MAX"
                    : formatPrice(
                        energyRecoveryPrice,
                      )}
                </strong>

                <button
                  type="button"
                  disabled={
                    energyRecoveryIsMax ||
                    balance <
                      energyRecoveryPrice
                  }
                  onClick={() =>
                    buyUpgrade(
                      "energyRecovery",
                    )
                  }
                >
                  {energyRecoveryIsMax
                    ? "MAX"
                    : balance <
                        energyRecoveryPrice
                      ? "Not enough"
                      : "Buy"}
                </button>
              </div>
            </article>
          </>
        )}

        {showEnergy && (
          <article className={styles.itemCard}>
            <div className={styles.itemTop}>
              <div className={styles.itemIcon}>
                ⚡
              </div>

              <span className={styles.badge}>
                Energy
              </span>
            </div>

            <h3>Full Energy</h3>

            <p>
              {energy.toLocaleString("en-US")} /{" "}
              {maxEnergy.toLocaleString("en-US")}
            </p>

            <div className={styles.itemBottom}>
              <strong>
                {formatPrice(fullEnergyPrice)}
              </strong>

              <button
                type="button"
                disabled={
                  isEnergyFull ||
                  balance < fullEnergyPrice
                }
                onClick={buyFullEnergy}
              >
                {isEnergyFull
                  ? "Full"
                  : balance < fullEnergyPrice
                    ? "Not enough"
                    : "Buy"}
              </button>
            </div>
          </article>
        )}

        {showSpecial &&
          TAP_SKINS.map((skin) => {
            const isOwned =
              ownedTapSkinIds.includes(
                skin.id,
              );

            const isEquipped =
              equippedTapSkinId === skin.id;

            const cannotAfford =
              !isOwned &&
              balance < skin.price;

            return (
              <article
                key={skin.id}
                className={styles.itemCard}
              >
                <div className={styles.itemTop}>
                  <div className={styles.itemIcon}>
                    <Image
                      src={skin.image}
                      alt={skin.name}
                      width={42}
                      height={42}
                      style={{
                        width: "42px",
                        height: "42px",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <span className={styles.badge}>
                    Tap Skin
                  </span>
                </div>

                <h3>{skin.name}</h3>

                <p>{skin.description}</p>

                <div className={styles.itemBottom}>
                  <strong>
                    {formatPrice(skin.price)}
                  </strong>

                  <button
                    type="button"
                    disabled={
                      isEquipped ||
                      cannotAfford
                    }
                    onClick={() =>
                      handleTapSkin(skin.id)
                    }
                  >
                    {isEquipped
                      ? "Equipped"
                      : isOwned
                        ? "Equip"
                        : cannotAfford
                          ? "Not enough"
                          : "Buy"}
                  </button>
                </div>
              </article>
            );
          })}

        {showSpecial &&
          AVATAR_FRAMES.map((frame) => {
            const isOwned =
              ownedAvatarFrameIds.includes(
                frame.id,
              );

            const isEquipped =
              equippedAvatarFrameId ===
              frame.id;

            const cannotAfford =
              !isOwned &&
              balance < frame.price;

            return (
              <article
                key={frame.id}
                className={styles.itemCard}
              >
                <div className={styles.itemTop}>
                  <div className={styles.itemIcon}>
                    <Image
                      src={frame.image}
                      alt={frame.name}
                      width={42}
                      height={42}
                      style={{
                        width: "42px",
                        height: "42px",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <span className={styles.badge}>
                    Frame
                  </span>
                </div>

                <h3>{frame.name}</h3>

                <p>{frame.description}</p>

                <div className={styles.itemBottom}>
                  <strong>
                    {formatPrice(frame.price)}
                  </strong>

                  <button
                    type="button"
                    disabled={
                      isEquipped ||
                      cannotAfford
                    }
                    onClick={() =>
                      handleAvatarFrame(
                        frame.id,
                      )
                    }
                  >
                    {isEquipped
                      ? "Equipped"
                      : isOwned
                        ? "Equip"
                        : cannotAfford
                          ? "Not enough"
                          : "Buy"}
                  </button>
                </div>
              </article>
            );
          })}

        {showSpecial &&
          CHARMS.map((charm) => {
            const isOwned =
              ownedCharmIds.includes(
                charm.id,
              );

            const isEquipped =
              equippedCharmIds.includes(
                charm.id,
              );

            const cannotAfford =
              !isOwned &&
              balance < charm.price;

            return (
              <article
                key={charm.id}
                className={styles.itemCard}
              >
                <div className={styles.itemTop}>
                  <div className={styles.itemIcon}>
                    <Image
                      src={charm.image}
                      alt={charm.name}
                      width={42}
                      height={42}
                      style={{
                        width: "42px",
                        height: "42px",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <span className={styles.badge}>
                    Charm {charm.slot}
                  </span>
                </div>

                <h3>{charm.name}</h3>

                <p>{charm.description}</p>

                <div className={styles.itemBottom}>
                  <strong>
                    {formatPrice(charm.price)}
                  </strong>

                  <button
                    type="button"
                    disabled={cannotAfford}
                    onClick={() =>
                      handleCharm(charm.id)
                    }
                  >
                    {!isOwned
                      ? cannotAfford
                        ? "Not enough"
                        : "Buy"
                      : isEquipped
                        ? "Unequip"
                        : "Equip"}
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}