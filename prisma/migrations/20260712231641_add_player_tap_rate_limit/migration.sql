-- CreateTable
CREATE TABLE "PlayerTapRateLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "tapCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerTapRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTapRateLimit_userId_key" ON "PlayerTapRateLimit"("userId");

-- CreateIndex
CREATE INDEX "PlayerTapRateLimit_windowStartedAt_idx" ON "PlayerTapRateLimit"("windowStartedAt");

-- AddForeignKey
ALTER TABLE "PlayerTapRateLimit" ADD CONSTRAINT "PlayerTapRateLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
