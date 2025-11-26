-- AlterTable
ALTER TABLE "MercadoLibreAccount" ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "syncProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "syncStatus" TEXT NOT NULL DEFAULT 'idle';
