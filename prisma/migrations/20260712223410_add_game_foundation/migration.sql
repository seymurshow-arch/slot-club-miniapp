-- CreateEnum
CREATE TYPE "BalanceTransactionDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "BalanceTransactionSource" AS ENUM ('INITIAL_BALANCE', 'TAP_REWARD', 'TASK_REWARD', 'DAILY_REWARD', 'REFERRAL_REWARD', 'SHOP_PURCHASE', 'SHOP_REFUND', 'ADMIN_ADJUSTMENT', 'SYSTEM_ADJUSTMENT', 'MIGRATION');

-- CreateTable
CREATE TABLE "PlayerGameState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" BIGINT NOT NULL,
    "energy" BIGINT NOT NULL,
    "maxEnergy" BIGINT NOT NULL,
    "lastEnergyUpdate" TIMESTAMP(3) NOT NULL,
    "tapPower" BIGINT NOT NULL,
    "energyCostPerTap" BIGINT NOT NULL,
    "totalTaps" BIGINT NOT NULL DEFAULT 0,
    "totalEarned" BIGINT NOT NULL DEFAULT 0,
    "vipPoints" BIGINT NOT NULL DEFAULT 0,
    "vipLevel" INTEGER NOT NULL DEFAULT 0,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isLeaderboardVisible" BOOLEAN NOT NULL DEFAULT true,
    "adminNote" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerGameState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomySettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "version" INTEGER NOT NULL DEFAULT 1,
    "initialBalance" BIGINT NOT NULL,
    "initialEnergy" BIGINT NOT NULL,
    "initialMaxEnergy" BIGINT NOT NULL,
    "baseTapReward" BIGINT NOT NULL,
    "energyCostPerTap" BIGINT NOT NULL,
    "energyRestoreAmount" BIGINT NOT NULL,
    "energyRestoreIntervalSeconds" INTEGER NOT NULL,
    "maximumTapsPerSecond" INTEGER NOT NULL,
    "maximumBalance" BIGINT NOT NULL,
    "manualRewardPerActionLimit" BIGINT NOT NULL,
    "manualRewardDailyLimit" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EconomySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomySettingsHistory" (
    "id" TEXT NOT NULL,
    "economySettingsId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomySettingsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" "BalanceTransactionDirection" NOT NULL,
    "source" "BalanceTransactionSource" NOT NULL,
    "amount" BIGINT NOT NULL,
    "balanceBefore" BIGINT NOT NULL,
    "balanceAfter" BIGINT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "targetUserId" TEXT,
    "reason" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGameState_userId_key" ON "PlayerGameState"("userId");

-- CreateIndex
CREATE INDEX "PlayerGameState_isBlocked_idx" ON "PlayerGameState"("isBlocked");

-- CreateIndex
CREATE INDEX "PlayerGameState_isLeaderboardVisible_totalEarned_idx" ON "PlayerGameState"("isLeaderboardVisible", "totalEarned");

-- CreateIndex
CREATE INDEX "PlayerGameState_isLeaderboardVisible_balance_idx" ON "PlayerGameState"("isLeaderboardVisible", "balance");

-- CreateIndex
CREATE INDEX "PlayerGameState_updatedAt_idx" ON "PlayerGameState"("updatedAt");

-- CreateIndex
CREATE INDEX "EconomySettingsHistory_createdAt_idx" ON "EconomySettingsHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EconomySettingsHistory_economySettingsId_version_key" ON "EconomySettingsHistory"("economySettingsId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceTransaction_idempotencyKey_key" ON "BalanceTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "BalanceTransaction_userId_createdAt_idx" ON "BalanceTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BalanceTransaction_source_createdAt_idx" ON "BalanceTransaction"("source", "createdAt");

-- CreateIndex
CREATE INDEX "BalanceTransaction_referenceType_referenceId_idx" ON "BalanceTransaction"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "BalanceTransaction_createdAt_idx" ON "BalanceTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actor_createdAt_idx" ON "AdminAuditLog"("actor", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetUserId_createdAt_idx" ON "AdminAuditLog"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- AddForeignKey
ALTER TABLE "PlayerGameState" ADD CONSTRAINT "PlayerGameState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EconomySettingsHistory" ADD CONSTRAINT "EconomySettingsHistory_economySettingsId_fkey" FOREIGN KEY ("economySettingsId") REFERENCES "EconomySettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
