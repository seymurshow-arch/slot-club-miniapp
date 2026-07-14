"use client";

import { useState } from "react";

import type { AdminShopItem } from "@/lib/playerShopApi";

import { CreateShopItemView } from "./CreateShopItemView";
import { PurchaseHistoryView } from "./PurchaseHistoryView";
import { ShopCatalogView } from "./ShopCatalogView";

import type { ShopView } from "./shopTypes";

import styles from "../../AdminPanel.module.css";

export function ShopSection() {
  const [activeView, setActiveView] =
    useState<ShopView>("catalog");

  const [editingItem, setEditingItem] =
    useState<AdminShopItem | null>(null);

  function openCatalog(): void {
    setEditingItem(null);
    setActiveView("catalog");
  }

  function openCreate(): void {
    setEditingItem(null);
    setActiveView("create");
  }

  function openEdit(item: AdminShopItem): void {
    setEditingItem(item);
    setActiveView("create");
  }

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
            onClick={openCatalog}
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
            onClick={openCreate}
          >
            <span>{editingItem ? "✎" : "+"}</span>
            {editingItem ? "Edit Item" : "Create Item"}
          </button>

          <button
            type="button"
            className={
              activeView === "history"
                ? styles.shopViewTabActive
                : styles.shopViewTab
            }
            onClick={() => {
              setEditingItem(null);
              setActiveView("history");
            }}
          >
            <span>≡</span>
            Purchase History
          </button>
        </div>
      </header>

      {activeView === "catalog" && (
        <ShopCatalogView
          onCreateItem={openCreate}
          onEditItem={openEdit}
        />
      )}

      {activeView === "create" && (
        <CreateShopItemView
          item={editingItem}
          onBackToCatalog={openCatalog}
        />
      )}

      {activeView === "history" && (
        <PurchaseHistoryView />
      )}
    </section>
  );
}