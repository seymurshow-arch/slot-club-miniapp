"use client";

import { useState } from "react";

import { CreateShopItemView } from "./CreateShopItemView";
import { PurchaseHistoryView } from "./PurchaseHistoryView";
import { ShopCatalogView } from "./ShopCatalogView";

import type { ShopView } from "./shopTypes";

import styles from "../../AdminPanel.module.css";

export function ShopSection() {
  const [activeView, setActiveView] =
    useState<ShopView>("catalog");

  return (
    <section className={styles.shopSection}>
      <header className={styles.shopSectionHeader}>
        <div>
          <h2>Shop</h2>

          <p>
            Каталог товарів, способи отримання та
            історія покупок
          </p>
        </div>

        <div className={styles.shopViewTabs}>
          <button
            type="button"
            className={
              activeView === "catalog"
                ? styles.shopViewTabActive
                : styles.shopViewTab
            }
            onClick={() =>
              setActiveView("catalog")
            }
          >
            <span>◇</span>
            Catalog
          </button>

          <button
            type="button"
            className={
              activeView === "create"
                ? styles.shopViewTabActive
                : styles.shopViewTab
            }
            onClick={() =>
              setActiveView("create")
            }
          >
            <span>+</span>
            Create Item
          </button>

          <button
            type="button"
            className={
              activeView === "history"
                ? styles.shopViewTabActive
                : styles.shopViewTab
            }
            onClick={() =>
              setActiveView("history")
            }
          >
            <span>≡</span>
            Purchase History
          </button>
        </div>
      </header>

      {activeView === "catalog" && (
        <ShopCatalogView
          onCreateItem={() =>
            setActiveView("create")
          }
        />
      )}

      {activeView === "create" && (
        <CreateShopItemView
          onBackToCatalog={() =>
            setActiveView("catalog")
          }
        />
      )}

      {activeView === "history" && (
        <PurchaseHistoryView />
      )}
    </section>
  );
}