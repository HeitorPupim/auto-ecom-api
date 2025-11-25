-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MercadoLibreAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mlUserId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoLibreAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MercadoLibreAccount_userId_idx" ON "MercadoLibreAccount"("userId");

-- CreateIndex
CREATE INDEX "MercadoLibreAccount_expiresAt_idx" ON "MercadoLibreAccount"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MercadoLibreAccount_userId_mlUserId_key" ON "MercadoLibreAccount"("userId", "mlUserId");

-- AddForeignKey
ALTER TABLE "MercadoLibreAccount" ADD CONSTRAINT "MercadoLibreAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
