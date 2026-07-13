-- CreateEnum
CREATE TYPE "ShopItemType" AS ENUM ('UPGRADE', 'CONSUMABLE', 'COSMETIC');

-- CreateEnum
CREATE TYPE "ShopItemCategory" AS ENUM ('BOOSTS', 'ENERGY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "ShopItemEffect" AS ENUM ('TAP_POWER', 'MAX_ENERGY', 'ENERGY_RESTORE_AMOUNT', 'FULL_ENERGY', 'TAP_SKIN', 'AVATAR_FRAME', 'CHARM');

-- CreateEnum
CREATE TYPE "ShopPurchaseStatus" AS ENUM ('COMPLETED', 'REFUNDED');

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "ShopItemType" NOT NULL,
    "category" "ShopItemCategory" NOT NULL,
    "effect" "ShopItemEffect" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" BIGINT NOT NULL,
    "priceGrowthNumerator" BIGINT NOT NULL DEFAULT 1,
    "priceGrowthDenominator" BIGINT NOT NULL DEFAULT 1,
    "effectValue" BIGINT NOT NULL DEFAULT 0,
    "maxLevel" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerShopItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopItemId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "quantity" BIGINT NOT NULL DEFAULT 0,
    "isOwned" BOOLEAN NOT NULL DEFAULT false,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "purchasedAt" TIMESTAMP(3),
    "equippedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopItemId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" "ShopPurchaseStatus" NOT NULL DEFAULT 'COMPLETED',
    "quantity" BIGINT NOT NULL DEFAULT 1,
    "unitPrice" BIGINT NOT NULL,
    "totalPrice" BIGINT NOT NULL,
    "balanceBefore" BIGINT NOT NULL,
    "balanceAfter" BIGINT NOT NULL,
    "levelBefore" INTEGER,
    "levelAfter" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "ShopPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_key_key" ON "ShopItem"("key");

-- CreateIndex
CREATE INDEX "ShopItem_type_isActive_isVisible_idx" ON "ShopItem"("type", "isActive", "isVisible");

-- CreateIndex
CREATE INDEX "ShopItem_category_isActive_isVisible_sortOrder_idx" ON "ShopItem"("category", "isActive", "isVisible", "sortOrder");

-- CreateIndex
CREATE INDEX "ShopItem_effect_idx" ON "ShopItem"("effect");

-- CreateIndex
CREATE INDEX "ShopItem_sortOrder_idx" ON "ShopItem"("sortOrder");

-- CreateIndex
CREATE INDEX "PlayerShopItem_userId_isOwned_idx" ON "PlayerShopItem"("userId", "isOwned");

-- CreateIndex
CREATE INDEX "PlayerShopItem_userId_isEquipped_idx" ON "PlayerShopItem"("userId", "isEquipped");

-- CreateIndex
CREATE INDEX "PlayerShopItem_shopItemId_idx" ON "PlayerShopItem"("shopItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerShopItem_userId_shopItemId_key" ON "PlayerShopItem"("userId", "shopItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopPurchase_idempotencyKey_key" ON "ShopPurchase"("idempotencyKey");

-- CreateIndex
CREATE INDEX "ShopPurchase_userId_createdAt_idx" ON "ShopPurchase"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ShopPurchase_shopItemId_createdAt_idx" ON "ShopPurchase"("shopItemId", "createdAt");

-- CreateIndex
CREATE INDEX "ShopPurchase_status_createdAt_idx" ON "ShopPurchase"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ShopPurchase_createdAt_idx" ON "ShopPurchase"("createdAt");

-- AddForeignKey
ALTER TABLE "PlayerShopItem" ADD CONSTRAINT "PlayerShopItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerShopItem" ADD CONSTRAINT "PlayerShopItem_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPurchase" ADD CONSTRAINT "ShopPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPurchase" ADD CONSTRAINT "ShopPurchase_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
