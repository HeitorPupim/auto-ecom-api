-- AlterTable
ALTER TABLE "MercadoLibreItem" ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "gtin" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "pictures" JSONB,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "variations" JSONB;
