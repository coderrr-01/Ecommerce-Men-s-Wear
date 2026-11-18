-- CreateIndex
CREATE INDEX "orders_userId_placedAt_idx" ON "orders"("userId", "placedAt");

-- CreateIndex
CREATE INDEX "orders_customerPhone_placedAt_idx" ON "orders"("customerPhone", "placedAt");

-- CreateIndex
CREATE INDEX "orders_status_placedAt_idx" ON "orders"("status", "placedAt");

-- CreateIndex
CREATE INDEX "products_isActive_deletedAt_idx" ON "products"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "reviews_productId_status_deletedAt_idx" ON "reviews"("productId", "status", "deletedAt");
