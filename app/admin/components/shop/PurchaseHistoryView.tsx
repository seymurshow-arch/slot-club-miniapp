"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "../../AdminPanel.module.css";

type PurchaseStatus = "COMPLETED" | "REFUNDED";
type AcquisitionMethod =
  | "PURCHASE"
  | "ACTION"
  | "PURCHASE_OR_ACTION"
  | "FREE";

type ShopCategory =
  | "BOOSTS"
  | "ENERGY"
  | "TAP_SKINS"
  | "AVATAR_FRAMES"
  | "CHARMS"
  | "SPECIAL";

type PurchaseHistoryItem = {
  id: string;
  status: PurchaseStatus;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  balanceBefore: string;
  balanceAfter: string;
  levelBefore: number;
  levelAfter: number;
  createdAt: string;
  refundedAt: string | null;
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  item: {
    id: string;
    key: string;
    title: string;
    category: ShopCategory;
    acquisitionMethod: AcquisitionMethod;
  };
};

type ShopHistoryStats = {
  totalPurchases: number;
  completedPurchases: number;
  purchasesToday: number;
  coinsSpent: string;
  uniqueBuyers: number;
};

type AdminShopResponse = {
  ok: boolean;
  error?: string;
  stats?: ShopHistoryStats;
  purchases?: PurchaseHistoryItem[];
};

type MethodFilter =
  | "all"
  | "purchase"
  | "action"
  | "free";

type StatusFilter = "all" | PurchaseStatus;

const categoryLabels: Record<ShopCategory, string> = {
  BOOSTS: "Boosts",
  ENERGY: "Energy",
  TAP_SKINS: "Tap Skins",
  AVATAR_FRAMES: "Avatar Frames",
  CHARMS: "Charms",
  SPECIAL: "Special",
};

const methodLabels: Record<AcquisitionMethod, string> = {
  PURCHASE: "Coins",
  ACTION: "Action",
  PURCHASE_OR_ACTION: "Coins / Action",
  FREE: "Free",
};

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatInteger(value: string | number): string {
  try {
    return numberFormatter.format(BigInt(value));
  } catch {
    return String(value);
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateFormatter.format(date);
}

function getPlayerName(
  purchase: PurchaseHistoryItem,
): string {
  const fullName = [
    purchase.user.firstName,
    purchase.user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  if (purchase.user.username) {
    return `@${purchase.user.username}`;
  }

  return `Telegram ${purchase.user.telegramId}`;
}

function matchesMethod(
  purchase: PurchaseHistoryItem,
  filter: MethodFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "purchase") {
    return (
      purchase.item.acquisitionMethod === "PURCHASE" ||
      purchase.item.acquisitionMethod ===
        "PURCHASE_OR_ACTION"
    );
  }

  if (filter === "action") {
    return (
      purchase.item.acquisitionMethod === "ACTION" ||
      purchase.item.acquisitionMethod ===
        "PURCHASE_OR_ACTION"
    );
  }

  return purchase.item.acquisitionMethod === "FREE";
}

export function PurchaseHistoryView() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] =
    useState<MethodFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [stats, setStats] =
    useState<ShopHistoryStats | null>(null);
  const [purchases, setPurchases] = useState<
    PurchaseHistoryItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPurchaseHistory() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/shop", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        const payload =
          (await response.json()) as AdminShopResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(
            payload.error ??
              "Failed to load purchase history.",
          );
        }

        if (!payload.stats || !payload.purchases) {
          throw new Error(
            "The shop API returned an incomplete response.",
          );
        }

        setStats(payload.stats);
        setPurchases(payload.purchases);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load purchase history.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPurchaseHistory();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredPurchases = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return purchases.filter((purchase) => {
      if (
        statusFilter !== "all" &&
        purchase.status !== statusFilter
      ) {
        return false;
      }

      if (!matchesMethod(purchase, methodFilter)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        getPlayerName(purchase),
        purchase.user.username ?? "",
        purchase.user.telegramId,
        purchase.item.title,
        purchase.item.key,
        categoryLabels[purchase.item.category],
        methodLabels[purchase.item.acquisitionMethod],
        purchase.status,
      ];

      return searchableValues.some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [methodFilter, purchases, search, statusFilter]);

  return (
    <section className={styles.shopHistoryView}>
      <div className={styles.shopHistoryStats}>
        <article>
          <span>Purchases today</span>
          <strong>
            {isLoading
              ? "…"
              : numberFormatter.format(
                  stats?.purchasesToday ?? 0,
                )}
          </strong>
          <small>Успішні покупки за сьогодні</small>
        </article>

        <article>
          <span>Coins spent</span>
          <strong>
            {isLoading
              ? "…"
              : formatInteger(stats?.coinsSpent ?? "0")}
          </strong>
          <small>Сума завершених покупок</small>
        </article>

        <article>
          <span>Completed purchases</span>
          <strong>
            {isLoading
              ? "…"
              : numberFormatter.format(
                  stats?.completedPurchases ?? 0,
                )}
          </strong>
          <small>
            Із {numberFormatter.format(
              stats?.totalPurchases ?? 0,
            )} операцій
          </small>
        </article>

        <article>
          <span>Unique buyers</span>
          <strong>
            {isLoading
              ? "…"
              : numberFormatter.format(
                  stats?.uniqueBuyers ?? 0,
                )}
          </strong>
          <small>Унікальні покупці</small>
        </article>
      </div>

      <article className={styles.shopHistoryCard}>
        <header className={styles.shopHistoryHeader}>
          <div>
            <h2>Purchase History</h2>

            <p>
              Останні 100 операцій із таблиці ShopPurchase
            </p>
          </div>

          <div className={styles.shopHistoryActions}>
            <label>
              <span>⌕</span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search player or item..."
                aria-label="Пошук покупок"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Очистити пошук"
                >
                  ×
                </button>
              )}
            </label>

            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(
                  event.target.value as MethodFilter,
                )
              }
              aria-label="Фільтр способу отримання"
            >
              <option value="all">All methods</option>
              <option value="purchase">Coins</option>
              <option value="action">Action unlock</option>
              <option value="free">Free</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter,
                )
              }
              aria-label="Фільтр статусу покупки"
            >
              <option value="all">All statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </header>

        <div className={styles.shopHistoryTableHeader}>
          <span>Player</span>
          <span>Item</span>
          <span>Category</span>
          <span>Method</span>
          <span>Price</span>
          <span>Purchased at</span>
          <span>Status</span>
        </div>

        {isLoading && (
          <div className={styles.shopHistoryEmpty}>
            <span>◌</span>
            <strong>Loading purchase history…</strong>
            <p>
              Завантажуємо реальні операції магазину з
              PostgreSQL.
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.shopHistoryEmpty}>
            <span>!</span>
            <strong>Failed to load purchase history</strong>
            <p>{error}</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          filteredPurchases.length === 0 && (
            <div className={styles.shopHistoryEmpty}>
              <span>◇</span>

              <strong>
                {purchases.length === 0
                  ? "No purchases yet"
                  : "No matching purchases"}
              </strong>

              <p>
                {purchases.length === 0
                  ? "Після першої серверної покупки тут автоматично з’явиться запис із ShopPurchase."
                  : "Змініть пошуковий запит або активні фільтри."}
              </p>
            </div>
          )}

        {!isLoading &&
          !error &&
          filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className={styles.shopHistoryTableHeader}
              style={{
                minHeight: 62,
                color: "#aeb3bc",
                fontSize: 9,
                fontWeight: 600,
                textTransform: "none",
                borderTop:
                  "1px solid rgba(255, 255, 255, 0.045)",
                background: "transparent",
              }}
            >
              <span
                title={`Telegram ID: ${purchase.user.telegramId}`}
                style={{
                  display: "grid",
                  gap: 4,
                  overflow: "hidden",
                }}
              >
                <strong
                  style={{
                    overflow: "hidden",
                    color: "#e1e4e8",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getPlayerName(purchase)}
                </strong>
                <small style={{ color: "#666d78" }}>
                  {purchase.user.username
                    ? `@${purchase.user.username}`
                    : purchase.user.telegramId}
                </small>
              </span>

              <span
                title={purchase.item.key}
                style={{
                  display: "grid",
                  gap: 4,
                  overflow: "hidden",
                }}
              >
                <strong
                  style={{
                    overflow: "hidden",
                    color: "#e1e4e8",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {purchase.item.title}
                </strong>
                <small style={{ color: "#666d78" }}>
                  Level {purchase.levelBefore} →{" "}
                  {purchase.levelAfter}
                  {purchase.quantity !== "1"
                    ? ` · ×${purchase.quantity}`
                    : ""}
                </small>
              </span>

              <span>
                {categoryLabels[purchase.item.category]}
              </span>

              <span>
                {methodLabels[
                  purchase.item.acquisitionMethod
                ]}
              </span>

              <span
                title={`Balance: ${formatInteger(
                  purchase.balanceBefore,
                )} → ${formatInteger(
                  purchase.balanceAfter,
                )}`}
                style={{ color: "#e9c868" }}
              >
                {formatInteger(purchase.totalPrice)}
              </span>

              <span>{formatDate(purchase.createdAt)}</span>

              <span
                title={
                  purchase.refundedAt
                    ? `Refunded: ${formatDate(
                        purchase.refundedAt,
                      )}`
                    : undefined
                }
                style={{
                  width: "fit-content",
                  padding: "5px 8px",
                  border:
                    purchase.status === "COMPLETED"
                      ? "1px solid rgba(123, 255, 101, 0.16)"
                      : "1px solid rgba(255, 177, 86, 0.18)",
                  borderRadius: 999,
                  color:
                    purchase.status === "COMPLETED"
                      ? "#adf0a2"
                      : "#ffc17a",
                  background:
                    purchase.status === "COMPLETED"
                      ? "rgba(123, 255, 101, 0.05)"
                      : "rgba(255, 177, 86, 0.055)",
                  fontSize: 7,
                  fontWeight: 900,
                }}
              >
                {purchase.status === "COMPLETED"
                  ? "Completed"
                  : "Refunded"}
              </span>
            </div>
          ))}
      </article>
    </section>
  );
}