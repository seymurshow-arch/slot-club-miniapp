"use client";

import { useMemo, useRef, useState } from "react";

import { useGameStore } from "@/game/gameStore";
import { PlayerApiError } from "@/lib/playerApi";
import {
  createPlayerShopRequestId,
  equipPlayerShopItem,
  purchasePlayerShopItem,
  unequipPlayerShopItem,
  type PlayerShopItem,
} from "@/lib/playerShopApi";

import styles from "./ShopScreen.module.css";

const categories = ["All", "Boosts", "Energy", "Special"] as const;

type ShopCategory = (typeof categories)[number];
type ShopAction = "purchase" | "equip" | "unequip";

type ShopScreenProps = {
  items: PlayerShopItem[];
  isLoading: boolean;
  loadingError: string | null;
  onRefresh: () => Promise<void>;
  onBack: () => void;
};

function formatPrice(value: string): string {
  try {
    const parsedValue = BigInt(value);

    if (parsedValue === BigInt(0)) {
      return "Free";
    }

    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(parsedValue);
  } catch {
    return value;
  }
}

function formatFullInteger(value: string): string {
  try {
    return new Intl.NumberFormat("en-US").format(BigInt(value));
  } catch {
    return value;
  }
}

function getItemIcon(item: PlayerShopItem): string {
  switch (item.effect) {
    case "TAP_POWER":
      return "⚡";
    case "MAX_ENERGY":
      return "🔋";
    case "ENERGY_RESTORE_AMOUNT":
      return "♻️";
    case "FULL_ENERGY":
      return "🔌";
    case "TAP_SKIN":
      return "🍀";
    case "AVATAR_FRAME":
      return "🖼️";
    case "CHARM":
      return "✨";
    case "VIP_POINTS":
      return "♛";
    case "COINS":
      return "🪙";
    case "SPECIAL_ITEM":
      return "🎁";
    default:
      return "🛍️";
  }
}

function getItemBadge(item: PlayerShopItem): string {
  if (item.player.isEquipped) {
    return "Equipped";
  }

  if (item.player.isMaxLevel) {
    return "Max";
  }

  if (isCosmeticItem(item) && item.player.isOwned) {
    return "Owned";
  }

  if (item.type === "UPGRADE") {
    return `Level ${item.player.level}`;
  }

  switch (item.category) {
    case "BOOSTS":
      return "Boost";
    case "ENERGY":
      return "Energy";
    case "TAP_SKINS":
      return "Tap Skin";
    case "AVATAR_FRAMES":
      return "Frame";
    case "CHARMS":
      return "Charm";
    case "SPECIAL":
      return "Special";
    default:
      return "Item";
  }
}

function getItemDescription(item: PlayerShopItem): string {
  if (item.player.isMaxLevel) {
    return item.description
      ? `${item.description} Maximum level reached.`
      : "Maximum level reached.";
  }

  if (item.type === "UPGRADE") {
    const nextLevel = item.player.level + 1;
    const effectValue = formatFullInteger(item.effectValue);
    const levelText = `Level ${item.player.level} → ${nextLevel}`;

    switch (item.effect) {
      case "TAP_POWER":
        return `${levelText}. +${effectValue} tap power.`;
      case "MAX_ENERGY":
        return `${levelText}. +${effectValue} maximum energy.`;
      case "ENERGY_RESTORE_AMOUNT":
        return `${levelText}. +${effectValue} energy recovery.`;
      default:
        return item.description ? `${levelText}. ${item.description}` : levelText;
    }
  }

  if (item.player.isEquipped) {
    return item.description
      ? `${item.description} Currently equipped.`
      : "Currently equipped.";
  }

  if (isCosmeticItem(item) && item.player.isOwned) {
    return item.description
      ? `${item.description} Owned and ready to equip.`
      : "Owned and ready to equip.";
  }

  return item.description ?? "Available in the game store.";
}

function isSpecialCategory(item: PlayerShopItem): boolean {
  return (
    item.category === "TAP_SKINS" ||
    item.category === "AVATAR_FRAMES" ||
    item.category === "CHARMS" ||
    item.category === "SPECIAL"
  );
}

function matchesCategory(item: PlayerShopItem, category: ShopCategory): boolean {
  switch (category) {
    case "All":
      return true;
    case "Boosts":
      return item.category === "BOOSTS";
    case "Energy":
      return item.category === "ENERGY";
    case "Special":
      return isSpecialCategory(item);
    default:
      return false;
  }
}

function isCosmeticItem(item: PlayerShopItem): boolean {
  return (
    item.type === "COSMETIC" ||
    item.effect === "TAP_SKIN" ||
    item.effect === "AVATAR_FRAME" ||
    item.effect === "CHARM"
  );
}

function canAfford(balance: string | number, price: string): boolean {
  try {
    return BigInt(balance) >= BigInt(price);
  } catch {
    return false;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof PlayerApiError) {
    switch (error.code) {
      case "TELEGRAM_AUTH_FAILED":
        return "Open the game through Telegram to use the shop.";
      case "PLAYER_BLOCKED":
        return "This player account is blocked.";
      case "INSUFFICIENT_BALANCE":
        return "You do not have enough coins for this purchase.";
      case "SHOP_ITEM_NOT_FOUND":
        return "This shop item no longer exists.";
      case "SHOP_ITEM_UNAVAILABLE":
        return "This item is currently unavailable.";
      case "SHOP_ITEM_NOT_PURCHASABLE":
        return "This item cannot be purchased with coins.";
      case "SHOP_ITEM_NOT_OWNED":
        return "You must own this item before equipping it.";
      case "SHOP_ITEM_NOT_EQUIPPABLE":
        return "This item cannot be equipped.";
      case "VIP_LEVEL_REQUIRED":
        return "A higher VIP level is required.";
      case "PLAYER_LEVEL_REQUIRED":
        return "A higher player level is required.";
      case "PURCHASE_LIMIT_REACHED":
        return "The purchase limit for this item has been reached.";
      case "MAX_LEVEL_REACHED":
        return "This upgrade is already at its maximum level.";
      case "IDEMPOTENCY_CONFLICT":
        return "This purchase request conflicts with an earlier request.";
      case "CONCURRENT_UPDATE_FAILED":
        return "Your game state changed during this action. Please try again.";
      case "NETWORK_ERROR":
        return "Could not reach the server. Check your connection and try again.";
      case "INVALID_RESPONSE":
        return "The server returned an invalid shop response.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "An unexpected shop error occurred.";
}

export function ShopScreen({
  items,
  isLoading,
  loadingError,
  onRefresh,
  onBack,
}: ShopScreenProps) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("All");
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<{
    itemId: string;
    action: ShopAction;
  } | null>(null);

  const pendingRequestIds = useRef<Map<string, string>>(new Map());

  const balance = useGameStore((state) => state.balance);
  const applyServerState = useGameStore((state) => state.applyServerState);

  const visibleItems = useMemo(
    () => items.filter((item) => matchesCategory(item, activeCategory)),
    [items, activeCategory],
  );

  async function handleRetryCatalog(): Promise<void> {
    if (isLoading) {
      return;
    }

    setActionError(null);

    try {
      await onRefresh();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function handlePurchase(item: PlayerShopItem): Promise<void> {
    if (
      activeAction !== null ||
      item.player.isMaxLevel ||
      (isCosmeticItem(item) && item.player.isOwned)
    ) {
      return;
    }

    setActionError(null);
    setActiveAction({ itemId: item.id, action: "purchase" });

    let requestId = pendingRequestIds.current.get(item.id);

    if (!requestId) {
      requestId = createPlayerShopRequestId();
      pendingRequestIds.current.set(item.id, requestId);
    }

    try {
      const result = await purchasePlayerShopItem({
        shopItemId: item.id,
        requestId,
      });

      applyServerState(result.state);
      pendingRequestIds.current.delete(item.id);
      await onRefresh();
    } catch (error) {
      if (error instanceof PlayerApiError && error.code !== "NETWORK_ERROR") {
        pendingRequestIds.current.delete(item.id);
      }

      setActionError(getErrorMessage(error));
    } finally {
      setActiveAction(null);
    }
  }

  async function handleEquipment(item: PlayerShopItem): Promise<void> {
    if (
      activeAction !== null ||
      !isCosmeticItem(item) ||
      !item.player.isOwned
    ) {
      return;
    }

    const action: ShopAction = item.player.isEquipped ? "unequip" : "equip";

    setActionError(null);
    setActiveAction({ itemId: item.id, action });

    try {
      if (action === "equip") {
        await equipPlayerShopItem({ shopItemId: item.id });
      } else {
        await unequipPlayerShopItem({ shopItemId: item.id });
      }

      await onRefresh();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <section className={styles.screen}>
      <button type="button" className={styles.backButton} onClick={onBack}>
        <span>←</span>
        Back to Club
      </button>

      <div className={styles.heading}>
        <span className={styles.eyebrow}>Shop</span>
        <h1 className={styles.title}>Game Store</h1>
        <p className={styles.description}>
          Spend your coins on boosts, energy and exclusive items.
        </p>
      </div>

      <div className={styles.categories}>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`${styles.category} ${
              activeCategory === category ? styles.activeCategory : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {actionError && (
        <article className={styles.itemCard} role="alert">
          <div className={styles.itemTop}>
            <div className={styles.itemIcon}>⚠️</div>
            <span className={styles.badge}>Error</span>
          </div>
          <h3>Shop action failed</h3>
          <p>{actionError}</p>
        </article>
      )}

      {isLoading && (
        <div className={styles.items} aria-live="polite">
          <article className={styles.itemCard}>
            <div className={styles.itemTop}>
              <div className={styles.itemIcon}>⏳</div>
              <span className={styles.badge}>Loading</span>
            </div>
            <h3>Loading store</h3>
            <p>Receiving the current catalog from the server.</p>
          </article>
        </div>
      )}

      {!isLoading && loadingError && (
        <div className={styles.items}>
          <article className={styles.itemCard} role="alert">
            <div className={styles.itemTop}>
              <div className={styles.itemIcon}>⚠️</div>
              <span className={styles.badge}>Error</span>
            </div>
            <h3>Store unavailable</h3>
            <p>{loadingError}</p>
            <div className={styles.itemBottom}>
              <strong>Retry</strong>
              <button type="button" onClick={() => void handleRetryCatalog()}>
                Retry
              </button>
            </div>
          </article>
        </div>
      )}

      {!isLoading && !loadingError && visibleItems.length === 0 && (
        <div className={styles.items}>
          <article className={styles.itemCard}>
            <div className={styles.itemTop}>
              <div className={styles.itemIcon}>🛍️</div>
              <span className={styles.badge}>Empty</span>
            </div>
            <h3>No available items</h3>
            <p>There are currently no items in this category.</p>
          </article>
        </div>
      )}

      {!isLoading && !loadingError && visibleItems.length > 0 && (
        <div className={styles.items}>
          {visibleItems.map((item) => {
            const cosmetic = isCosmeticItem(item);
            const isThisAction = activeAction?.itemId === item.id;
            const anotherActionIsRunning = activeAction !== null && !isThisAction;
            const affordable = canAfford(balance, item.currentPrice);

            let buttonText = "Buy";
            let isDisabled = anotherActionIsRunning;
            let onAction = () => void handlePurchase(item);

            if (isThisAction) {
              isDisabled = true;
              buttonText =
                activeAction.action === "purchase"
                  ? "Buying..."
                  : activeAction.action === "equip"
                    ? "Equipping..."
                    : "Removing...";
            } else if (item.player.isMaxLevel) {
              isDisabled = true;
              buttonText = "Max";
            } else if (cosmetic && item.player.isOwned) {
              buttonText = item.player.isEquipped ? "Unequip" : "Equip";
              onAction = () => void handleEquipment(item);
            } else if (!affordable) {
              isDisabled = true;
              buttonText = "Not enough";
            } else if (item.type === "UPGRADE") {
              buttonText = "Upgrade";
            }

            const statusText = item.player.isEquipped
              ? "Equipped"
              : cosmetic && item.player.isOwned
                ? "Owned"
                : item.player.isMaxLevel
                  ? "Max"
                  : formatPrice(item.currentPrice);

            return (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemTop}>
                  <div className={styles.itemIcon} aria-hidden="true">
                    {getItemIcon(item)}
                  </div>
                  <span className={styles.badge}>{getItemBadge(item)}</span>
                </div>

                <h3>{item.title}</h3>
                <p>{getItemDescription(item)}</p>

                <div className={styles.itemBottom}>
                  <strong>{statusText}</strong>
                  <button
                    type="button"
                    disabled={isDisabled}
                    aria-busy={isThisAction}
                    onClick={onAction}
                  >
                    {buttonText}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}