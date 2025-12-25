-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "TransactionLog" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "pixKey" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "provider" "Provider" NOT NULL,
    "providerTransactionId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionLog_referenceId_key" ON "TransactionLog"("referenceId");

-- CreateIndex
CREATE INDEX "TransactionLog_providerTransactionId_idx" ON "TransactionLog"("providerTransactionId");

-- CreateIndex
CREATE INDEX "TransactionLog_status_idx" ON "TransactionLog"("status");
