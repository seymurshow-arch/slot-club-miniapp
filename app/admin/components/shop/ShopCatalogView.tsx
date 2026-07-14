"use client";

import { useEffect, useMemo, useState } from "react";

import { deleteAdminShopItem, type AdminShopItem } from "@/lib/playerShopApi";
import type { ShopCategory } from "./shopTypes";

import styles from "../../AdminPanel.module.css";

type ShopCatalogViewProps = {
  onCreateItem: () => void;
  onEditItem: (item: AdminShopItem) => void;
};

type ApiShopItem = AdminShopItem;

type ShopStats = {
  totalItems: number;
  activeItems: number;
  visibleItems: number;
  disabledItems: number;
  hiddenItems: number;
  totalPurchases: number;
  completedPurchases: number;
  purchasesToday: number;
  coinsSpent: string;
  uniqueBuyers: number;
};

type ShopCatalogResponse = {
  ok: boolean;
  error?: string;
  stats?: ShopStats;
  items?: ApiShopItem[];
};

type StatusFilter = "all" | "active" | "disabled" | "hidden" | "scheduled";

const categories: Array<{
  value: "all" | ShopCategory;
  label: string;
  apiValue?: string;
}> = [
  { value: "all", label: "All" },
  { value: "boosts", label: "Boosts", apiValue: "BOOSTS" },
  { value: "energy", label: "Energy", apiValue: "ENERGY" },
  { value: "tap-skins", label: "Tap Skins", apiValue: "TAP_SKINS" },
  { value: "avatar-frames", label: "Avatar Frames", apiValue: "AVATAR_FRAMES" },
  { value: "charms", label: "Charms", apiValue: "CHARMS" },
  { value: "special", label: "Special", apiValue: "SPECIAL" },
];

const numberFormatter = new Intl.NumberFormat("en-US");

function formatInteger(value: number | string): string {
  try {
    return numberFormatter.format(typeof value === "number" ? value : BigInt(value));
  } catch {
    return String(value);
  }
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getItemStatus(item: ApiShopItem): "active" | "disabled" | "hidden" | "scheduled" {
  if (!item.isActive) {
    return "disabled";
  }

  if (!item.isVisible) {
    return "hidden";
  }

  const now = Date.now();
  const startsAt = item.startsAt ? new Date(item.startsAt).getTime() : null;
  const endsAt = item.endsAt ? new Date(item.endsAt).getTime() : null;

  if ((startsAt !== null && startsAt > now) || (endsAt !== null && endsAt <= now)) {
    return "scheduled";
  }

  return "active";
}

function getStatusLabel(status: ReturnType<typeof getItemStatus>): string {
  if (status === "active") return "Active";
  if (status === "disabled") return "Disabled";
  if (status === "hidden") return "Hidden";
  return "Scheduled";
}

export function ShopCatalogView({ onCreateItem, onEditItem }: ShopCatalogViewProps) {
  const [category, setCategory] = useState<"all" | ShopCategory>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ApiShopItem[]>([]);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/shop", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = (await response.json()) as ShopCatalogResponse;

        if (!response.ok || !data.ok || !data.items || !data.stats) {
          throw new Error(data.error || "Не вдалося завантажити каталог магазину.");
        }

        setItems(data.items);
        setStats(data.stats);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не вдалося завантажити каталог магазину.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

  
  return () => controller.abort();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const selectedCategory = categories.find((item) => item.value === category)?.apiValue;

    return items.filter((item) => {
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      const itemStatus = getItemStatus(item);

      if (status !== "all" && itemStatus !== status) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        item.title,
        item.key,
        item.description ?? "",
        item.cosmeticId ?? "",
        item.category,
        item.effect,
        item.acquisitionMethod,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [category, items, search, status]);

  async function handleDelete(item: AdminShopItem): Promise<void> {
    if (deletingItemId) return;

    const confirmed = window.confirm(
      `Delete "${item.title}"? The item will disappear from the player shop, while purchase history remains intact.`,
    );

    if (!confirmed) return;

    setDeletingItemId(item.id);
    setError("");

    try {
      await deleteAdminShopItem(item.id);
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setStats((current) =>
        current
          ? {
              ...current,
              totalItems: Math.max(0, current.totalItems - 1),
              activeItems: Math.max(0, current.activeItems - (item.isActive ? 1 : 0)),
              visibleItems: Math.max(0, current.visibleItems - (item.isVisible ? 1 : 0)),
              disabledItems: Math.max(0, current.disabledItems - (!item.isActive ? 1 : 0)),
              hiddenItems: Math.max(0, current.hiddenItems - (!item.isVisible ? 1 : 0)),
            }
          : current,
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Не вдалося видалити товар.",
      );
    } finally {
      setDeletingItemId(null);
    }
  }

  return (
    <section className={styles.shopCatalogView}>
      <div className={styles.shopStatsGrid}>
        <article>
          <span>All items</span>
          <strong>{stats ? formatInteger(stats.totalItems) : "—"}</strong>
          <small>Усі товари магазину</small>
        </article>

        <article>
          <span>Active items</span>
          <strong>{stats ? formatInteger(stats.activeItems) : "—"}</strong>
          <small>{stats ? `${formatInteger(stats.visibleItems)} видимих` : "Доступні для покупки"}</small>
        </article>

        <article>
          <span>Disabled / hidden</span>
          <strong>
            {stats ? formatInteger(stats.disabledItems + stats.hiddenItems) : "—"}
          </strong>
          <small>
            {stats
              ? `${formatInteger(stats.disabledItems)} вимкнено, ${formatInteger(stats.hiddenItems)} приховано`
              : "Недоступні товари"}
          </small>
        </article>

        <article>
          <span>Total purchases</span>
          <strong>{stats ? formatInteger(stats.totalPurchases) : "—"}</strong>
          <small>{stats ? `${formatInteger(stats.purchasesToday)} сьогодні` : "Реальні записи ShopPurchase"}</small>
        </article>
      </div>

      <article className={styles.shopCatalogCard}>
        <header className={styles.shopCatalogHeader}>
          <div>
            <h2>Shop Catalog</h2>
            <p>Керування товарами, цінами та способами отримання</p>
          </div>

          <button type="button" className={styles.shopCreateButton} onClick={onCreateItem}>
            <span>+</span>
            Create item
          </button>
        </header>

        <div className={styles.shopCatalogToolbar}>
          <label className={styles.shopSearch}>
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search shop items..."
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Очистити пошук">
                ×
              </button>
            )}
          </label>

          <div className={styles.shopCategoryFilters}>
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                className={
                  category === item.value
                    ? styles.shopCategoryFilterActive
                    : styles.shopCategoryFilter
                }
                onClick={() => setCategory(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="hidden">Hidden</option>
            <option value="scheduled">Scheduled / expired</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.shopCatalogEmpty}>
            <span>◇</span>
            <strong>Loading shop catalog...</strong>
            <p>Завантажуємо реальні товари та статистику з PostgreSQL.</p>
          </div>
        ) : error ? (
          <div className={styles.shopCatalogEmpty}>
            <span>!</span>
            <strong>Не вдалося завантажити каталог</strong>
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.shopCatalogEmpty}>
            <span>◇</span>
            <strong>{items.length === 0 ? "No shop items created yet" : "No items match the filters"}</strong>
            <p>
              {items.length === 0
                ? "Створи перший товар — після збереження він одразу з’явиться в PostgreSQL і каталозі гравця відповідно до налаштувань доступності."
                : "Зміни категорію, статус або пошуковий запит."}
            </p>
            {items.length === 0 && (
              <button type="button" onClick={onCreateItem}>
                <span>+</span>
                Create first item
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1060,
                color: "#cdd0d5",
                fontSize: 11,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Item", "Category", "Effect", "Price", "Access", "Limits", "Players", "Purchases", "Status", "Updated", "Actions"].map(
                    (label) => (
                      <th
                        key={label}
                        style={{
                          padding: "12px 14px",
                          textAlign: "left",
                          color: "#747a84",
                          fontSize: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const itemStatus = getItemStatus(item);

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.045)" }}>
                      <td style={{ padding: "13px 14px", minWidth: 220 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              width={38}
                              height={38}
                              style={{
                                width: 38,
                                height: 38,
                                objectFit: "contain",
                                borderRadius: 9,
                                background: "rgba(255,255,255,0.035)",
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                width: 38,
                                height: 38,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 9,
                                background: "rgba(255,255,255,0.035)",
                                color: "#747a84",
                              }}
                            >
                              ◇
                            </span>
                          )}
                          <div>
                            <strong style={{ display: "block", color: "#eef0f2", fontSize: 11 }}>
                              {item.title}
                              {item.isFeatured ? " ★" : ""}
                            </strong>
                            <small style={{ display: "block", marginTop: 4, color: "#666c76" }}>
                              {item.key}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>{formatEnum(item.category)}</td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>{formatEnum(item.effect)}</td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        {item.acquisitionMethod === "FREE" || item.acquisitionMethod === "ACTION"
                          ? formatEnum(item.acquisitionMethod)
                          : `${formatInteger(item.basePrice)} coins`}
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        VIP {item.minimumVipLevel} · LVL {item.minimumPlayerLevel}
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        {item.maxLevel !== null ? `Max LVL ${item.maxLevel}` : formatEnum(item.purchaseLimit)}
                        {item.maximumPurchases !== null ? ` · ${item.maximumPurchases}x` : ""}
                      </td>
                      <td style={{ padding: "13px 14px" }}>{formatInteger(item._count?.playerItems ?? 0)}</td>
                      <td style={{ padding: "13px 14px" }}>{formatInteger(item._count?.purchases ?? 0)}</td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "5px 8px",
                            borderRadius: 999,
                            color: itemStatus === "active" ? "#b8ffac" : "#9ca2ac",
                            background:
                              itemStatus === "active"
                                ? "rgba(123,255,101,0.07)"
                                : "rgba(255,255,255,0.045)",
                            border:
                              itemStatus === "active"
                                ? "1px solid rgba(123,255,101,0.14)"
                                : "1px solid rgba(255,255,255,0.065)",
                            fontSize: 8,
                            fontWeight: 800,
                          }}
                        >
                          {getStatusLabel(itemStatus)}
                        </span>
                      </td>
                      <td style={{ padding: "13px 14px", color: "#737983", whiteSpace: "nowrap" }}>
                        {formatDate(item.updatedAt)}
                      </td>
                      <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => onEditItem(item)}
                            disabled={deletingItemId !== null}
                            style={{ padding: "7px 10px", borderRadius: 8 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            disabled={deletingItemId !== null}
                            style={{ padding: "7px 10px", borderRadius: 8 }}
                          >
                            {deletingItemId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}