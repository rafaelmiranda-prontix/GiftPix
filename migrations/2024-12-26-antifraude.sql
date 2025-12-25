-- Enums already handled in previous migration; here create fraud tables

CREATE TABLE IF NOT EXISTS "fraud_event" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "gift_id" UUID,
  "event_type" TEXT NOT NULL,
  "risk_score" INT NOT NULL,
  "ip" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_fraud_event_gift FOREIGN KEY ("gift_id") REFERENCES "gift"("id")
);

CREATE INDEX IF NOT EXISTS fraud_event_gift_idx ON "fraud_event"("gift_id");
CREATE INDEX IF NOT EXISTS fraud_event_type_idx ON "fraud_event"("event_type");

CREATE TABLE IF NOT EXISTS "fraud_block" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fraud_block_entity_idx ON "fraud_block"("entity_type", "entity_id");
