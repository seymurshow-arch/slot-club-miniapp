-- AlterEnum
ALTER TYPE "ShopItemCategory"
ADD VALUE IF NOT EXISTS 'TAP_SKINS';

ALTER TYPE "ShopItemCategory"
ADD VALUE IF NOT EXISTS 'AVATAR_FRAMES';

ALTER TYPE "ShopItemCategory"
ADD VALUE IF NOT EXISTS 'CHARMS';

-- AlterEnum
ALTER TYPE "ShopItemEffect"
ADD VALUE IF NOT EXISTS 'VIP_POINTS';

ALTER TYPE "ShopItemEffect"
ADD VALUE IF NOT EXISTS 'COINS';

ALTER TYPE "ShopItemEffect"
ADD VALUE IF NOT EXISTS 'SPECIAL_ITEM';

-- CreateEnum
CREATE TYPE "ShopAcquisitionMethod" AS ENUM (
    'PURCHASE',
    'ACTION',
    'PURCHASE_OR_ACTION',
    'FREE'
);

-- CreateEnum
CREATE TYPE "ShopPurchaseLimit" AS ENUM (
    'ONCE',
    'LIMITED',
    'UNLIMITED'
);

-- CreateEnum
CREATE TYPE "ShopUnlockActionType" AS ENUM (
    'TELEGRAM_CHANNEL',
    'OPEN_LINK',
    'CUSTOM',
    'TAP_COUNT',
    'REFERRALS',
    'VIP_LEVEL',
    'MANUAL'
);

-- CreateEnum
CREATE TYPE "ShopUnlockVerification" AS ENUM (
    'TELEGRAM_API',
    'GAME_LOGIC',
    'MANUAL_REVIEW',
    'AUTO_COMPLETE',
    'NO_VERIFICATION'
);

-- AlterTable
ALTER TABLE "ShopItem"
ADD COLUMN "acquisitionMethod" "ShopAcquisitionMethod" NOT NULL DEFAULT 'PURCHASE',
ADD COLUMN "purchaseLimit" "ShopPurchaseLimit" NOT NULL DEFAULT 'UNLIMITED',
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "itemAmount" BIGINT NOT NULL DEFAULT 1,
ADD COLUMN "maximumPurchases" INTEGER,
ADD COLUMN "minimumVipLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "minimumPlayerLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "cosmeticId" TEXT,
ADD COLUMN "unlockActionType" "ShopUnlockActionType",
ADD COLUMN "unlockVerification" "ShopUnlockVerification",
ADD COLUMN "unlockInstructions" TEXT,
ADD COLUMN "actionUrl" TEXT,
ADD COLUMN "telegramChannelUsername" TEXT,
ADD COLUMN "telegramChatId" TEXT,
ADD COLUMN "targetValue" BIGINT,
ADD COLUMN "startsAt" TIMESTAMP(3),
ADD COLUMN "endsAt" TIMESTAMP(3),
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "requirements" JSONB,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PlayerShopItem"
ADD COLUMN "purchaseCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ShopPurchase"
ADD COLUMN "gameStateRevisionBefore" INTEGER,
ADD COLUMN "gameStateRevisionAfter" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_cosmeticId_key"
ON "ShopItem"("cosmeticId");

-- CreateIndex
CREATE INDEX "ShopItem_acquisitionMethod_idx"
ON "ShopItem"("acquisitionMethod");

-- CreateIndex
CREATE INDEX "ShopItem_minimumVipLevel_idx"
ON "ShopItem"("minimumVipLevel");

-- CreateIndex
CREATE INDEX "ShopItem_minimumPlayerLevel_idx"
ON "ShopItem"("minimumPlayerLevel");

-- CreateIndex
CREATE INDEX "ShopItem_startsAt_endsAt_idx"
ON "ShopItem"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "ShopItem_isActive_isVisible_deletedAt_idx"
ON "ShopItem"("isActive", "isVisible", "deletedAt");

-- CreateIndex
CREATE INDEX "PlayerShopItem_userId_purchaseCount_idx"
ON "PlayerShopItem"("userId", "purchaseCount");