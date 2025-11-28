-- CreateTable
CREATE TABLE "TinyERPAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" TEXT NOT NULL DEFAULT 'idle',
    "syncProgress" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TinyERPAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TinyERPAccount_userId_idx" ON "TinyERPAccount"("userId");

-- CreateIndex
CREATE INDEX "TinyERPAccount_expiresAt_idx" ON "TinyERPAccount"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TinyERPAccount_userId_key" ON "TinyERPAccount"("userId");

-- AddForeignKey
ALTER TABLE "TinyERPAccount" ADD CONSTRAINT "TinyERPAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
