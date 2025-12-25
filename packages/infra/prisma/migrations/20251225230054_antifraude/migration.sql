-- CreateTable
CREATE TABLE "fraud_event" (
    "id" TEXT NOT NULL,
    "gift_id" TEXT,
    "event_type" TEXT NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_block" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fraud_event_gift_id_idx" ON "fraud_event"("gift_id");

-- CreateIndex
CREATE INDEX "fraud_event_event_type_idx" ON "fraud_event"("event_type");

-- CreateIndex
CREATE INDEX "fraud_block_entity_type_entity_id_idx" ON "fraud_block"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "fraud_event" ADD CONSTRAINT "fraud_event_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
