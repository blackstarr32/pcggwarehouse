-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECEIVER');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateTable
CREATE TABLE "User" ("id" TEXT NOT NULL,"email" TEXT NOT NULL,"name" TEXT,"passwordHash" TEXT NOT NULL,"role" "UserRole" NOT NULL DEFAULT 'RECEIVER',"active" BOOLEAN NOT NULL DEFAULT true,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Warehouse" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"shipstationWarehouseId" TEXT,"active" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id"));
CREATE TABLE "BinLocation" ("id" TEXT NOT NULL,"warehouseId" TEXT NOT NULL,"zone" TEXT NOT NULL,"aisle" TEXT NOT NULL,"rack" TEXT NOT NULL,"level" TEXT NOT NULL,"label" TEXT NOT NULL,"shipstationInventoryLocationId" TEXT,"isHold" BOOLEAN NOT NULL DEFAULT false,"active" BOOLEAN NOT NULL DEFAULT true,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "BinLocation_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Product" ("id" TEXT NOT NULL,"sku" TEXT NOT NULL,"name" TEXT NOT NULL,"thumbnailUrl" TEXT,"category" TEXT,"tag1" TEXT,"tag2" TEXT,"tag3" TEXT,"tag4" TEXT,"tag5" TEXT,"active" BOOLEAN NOT NULL DEFAULT true,"warehouseId" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Product_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProductUpc" ("id" TEXT NOT NULL,"productId" TEXT NOT NULL,"upc" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "ProductUpc_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Receipt" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"productId" TEXT NOT NULL,"warehouseId" TEXT NOT NULL,"binLocationId" TEXT,"scannedUpc" TEXT NOT NULL,"sku" TEXT NOT NULL,"quantity" INTEGER NOT NULL,"skippedBin" BOOLEAN NOT NULL DEFAULT false,"status" "ReceiptStatus" NOT NULL DEFAULT 'PENDING',"shipstationRequest" JSONB,"shipstationResponse" JSONB,"errorMessage" TEXT,"retryCount" INTEGER NOT NULL DEFAULT 0,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,"syncedAt" TIMESTAMP(3),CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ImportBatch" ("id" TEXT NOT NULL,"type" TEXT NOT NULL,"filename" TEXT NOT NULL,"rowCount" INTEGER NOT NULL,"warningCount" INTEGER NOT NULL DEFAULT 0,"warnings" JSONB,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AppSetting" ("key" TEXT NOT NULL,"value" TEXT NOT NULL,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key"));
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");
CREATE INDEX "Warehouse_active_idx" ON "Warehouse"("active");
CREATE INDEX "BinLocation_warehouseId_isHold_idx" ON "BinLocation"("warehouseId", "isHold");
CREATE UNIQUE INDEX "BinLocation_warehouseId_zone_aisle_rack_level_key" ON "BinLocation"("warehouseId", "zone", "aisle", "rack", "level");
CREATE INDEX "Product_sku_idx" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_sku_warehouseId_key" ON "Product"("sku", "warehouseId");
CREATE INDEX "ProductUpc_upc_idx" ON "ProductUpc"("upc");
CREATE UNIQUE INDEX "ProductUpc_upc_productId_key" ON "ProductUpc"("upc", "productId");
CREATE INDEX "Receipt_status_createdAt_idx" ON "Receipt"("status", "createdAt");
CREATE INDEX "Receipt_sku_idx" ON "Receipt"("sku");
ALTER TABLE "BinLocation" ADD CONSTRAINT "BinLocation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductUpc" ADD CONSTRAINT "ProductUpc_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_binLocationId_fkey" FOREIGN KEY ("binLocationId") REFERENCES "BinLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
