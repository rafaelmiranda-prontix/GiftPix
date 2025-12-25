-- CreateEnum
CREATE TYPE "PixStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterEnum
ALTER TYPE "GiftStatus" ADD VALUE 'REFUNDED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "last_checked_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "pix_transaction" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "psp_transaction_id" TEXT NOT NULL,
    "status" "PixStatus" NOT NULL DEFAULT 'PENDING',
    "last_checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pix_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "pix_transaction_psp_transaction_id_key" ON "pix_transaction"("psp_transaction_id");

-- CreateIndex
CREATE INDEX "pix_transaction_gift_id_idx" ON "pix_transaction"("gift_id");

-- CreateIndex
CREATE INDEX "pix_transaction_status_idx" ON "pix_transaction"("status");

-- AddForeignKey
ALTER TABLE "pix_transaction" ADD CONSTRAINT "pix_transaction_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
