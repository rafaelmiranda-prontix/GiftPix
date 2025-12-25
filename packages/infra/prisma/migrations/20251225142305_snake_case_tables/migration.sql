/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GiftRedemption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GiftRedemption" DROP CONSTRAINT "GiftRedemption_giftId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_giftId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Gift";

-- DropTable
DROP TABLE "GiftRedemption";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "TransactionLog";

-- CreateTable
CREATE TABLE "gift" (
    "id" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "GiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "message" TEXT,
    "pin_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_redemption" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "pix_key" TEXT NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "Provider" NOT NULL,
    "provider_ref" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_ref" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_log" (
    "id" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "pix_key" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "provider" "Provider" NOT NULL,
    "provider_transaction_id" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_reference_id_key" ON "gift"("reference_id");

-- CreateIndex
CREATE INDEX "gift_status_idx" ON "gift"("status");

-- CreateIndex
CREATE INDEX "gift_expires_at_idx" ON "gift"("expires_at");

-- CreateIndex
CREATE INDEX "audit_log_entity_created_at_idx" ON "audit_log"("entity", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_log_reference_id_key" ON "transaction_log"("reference_id");

-- CreateIndex
CREATE INDEX "transaction_log_provider_transaction_id_idx" ON "transaction_log"("provider_transaction_id");

-- CreateIndex
CREATE INDEX "transaction_log_status_idx" ON "transaction_log"("status");

-- AddForeignKey
ALTER TABLE "gift_redemption" ADD CONSTRAINT "gift_redemption_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
