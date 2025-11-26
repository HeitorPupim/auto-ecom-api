-- CreateTable
CREATE TABLE "Order" (
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

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sku" TEXT,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "fullUnitPrice" DECIMAL(10,2) NOT NULL,
    "listingTypeId" TEXT,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
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

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_externalId_key" ON "Order"("externalId");

-- CreateIndex
CREATE INDEX "Order_mercadoLibreAccountId_idx" ON "Order"("mercadoLibreAccountId");

-- CreateIndex
CREATE INDEX "Order_date_idx" ON "Order"("date");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_itemId_idx" ON "OrderItem"("itemId");

-- CreateIndex
CREATE INDEX "OrderItem_sku_idx" ON "OrderItem"("sku");

-- CreateIndex
CREATE INDEX "Item_mercadoLibreAccountId_idx" ON "Item"("mercadoLibreAccountId");

-- CreateIndex
CREATE INDEX "Item_status_idx" ON "Item"("status");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_mercadoLibreAccountId_fkey" FOREIGN KEY ("mercadoLibreAccountId") REFERENCES "MercadoLibreAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_mercadoLibreAccountId_fkey" FOREIGN KEY ("mercadoLibreAccountId") REFERENCES "MercadoLibreAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
