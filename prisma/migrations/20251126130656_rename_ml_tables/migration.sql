/*
  Warnings:

  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_mercadoLibreAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_mercadoLibreAccountId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- CreateTable
CREATE TABLE "MercadoLibreOrder" (
    "id" TEXT NOT NULL,
    "mercadoLibreAccountId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "marketplaceFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "buyerId" TEXT,
    "buyerNickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoLibreOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MercadoLibreOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sku" TEXT,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "fullUnitPrice" DECIMAL(10,2) NOT NULL,
    "listingTypeId" TEXT,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "MercadoLibreOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MercadoLibreItem" (
    "id" TEXT NOT NULL,
    "mercadoLibreAccountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "currencyId" TEXT NOT NULL,
    "initialQuantity" INTEGER NOT NULL,
    "availableQuantity" INTEGER NOT NULL,
    "soldQuantity" INTEGER NOT NULL,
    "permalink" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "listingTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoLibreItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MercadoLibreOrder_externalId_key" ON "MercadoLibreOrder"("externalId");

-- CreateIndex
CREATE INDEX "MercadoLibreOrder_mercadoLibreAccountId_idx" ON "MercadoLibreOrder"("mercadoLibreAccountId");

-- CreateIndex
CREATE INDEX "MercadoLibreOrder_date_idx" ON "MercadoLibreOrder"("date");

-- CreateIndex
CREATE INDEX "MercadoLibreOrder_status_idx" ON "MercadoLibreOrder"("status");

-- CreateIndex
CREATE INDEX "MercadoLibreOrderItem_orderId_idx" ON "MercadoLibreOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "MercadoLibreOrderItem_itemId_idx" ON "MercadoLibreOrderItem"("itemId");

-- CreateIndex
CREATE INDEX "MercadoLibreOrderItem_sku_idx" ON "MercadoLibreOrderItem"("sku");

-- CreateIndex
CREATE INDEX "MercadoLibreItem_mercadoLibreAccountId_idx" ON "MercadoLibreItem"("mercadoLibreAccountId");

-- CreateIndex
CREATE INDEX "MercadoLibreItem_status_idx" ON "MercadoLibreItem"("status");

-- AddForeignKey
ALTER TABLE "MercadoLibreOrder" ADD CONSTRAINT "MercadoLibreOrder_mercadoLibreAccountId_fkey" FOREIGN KEY ("mercadoLibreAccountId") REFERENCES "MercadoLibreAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoLibreOrderItem" ADD CONSTRAINT "MercadoLibreOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MercadoLibreOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoLibreOrderItem" ADD CONSTRAINT "MercadoLibreOrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MercadoLibreItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoLibreItem" ADD CONSTRAINT "MercadoLibreItem_mercadoLibreAccountId_fkey" FOREIGN KEY ("mercadoLibreAccountId") REFERENCES "MercadoLibreAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
