-- CreateTable
CREATE TABLE "TinyERPProduct" (
    "id" TEXT NOT NULL,
    "tinyERPAccountId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER,
    "maxStock" INTEGER,
    "gtin" TEXT,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TinyERPProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TinyERPProduct_tinyERPAccountId_idx" ON "TinyERPProduct"("tinyERPAccountId");

-- CreateIndex
CREATE INDEX "TinyERPProduct_sku_idx" ON "TinyERPProduct"("sku");

-- AddForeignKey
ALTER TABLE "TinyERPProduct" ADD CONSTRAINT "TinyERPProduct_tinyERPAccountId_fkey" FOREIGN KEY ("tinyERPAccountId") REFERENCES "TinyERPAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
