/*
  Warnings:

  - A unique constraint covering the columns `[whatsappToken]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('WHATSAPP');

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "productSlug" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "checkoutSessionHash" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "paymentMethod" "OrderPaymentMethod",
ADD COLUMN     "stockCommittedAt" TIMESTAMP(3),
ADD COLUMN     "whatsappToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_whatsappToken_key" ON "orders"("whatsappToken");

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotencyKey_key" ON "orders"("idempotencyKey");

-- CreateIndex
CREATE INDEX "orders_customerPhone_createdAt_idx" ON "orders"("customerPhone", "createdAt");
