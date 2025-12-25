-- Add new status values to enums (idempotent add)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'giftstatus' AND e.enumlabel = 'REFUNDED') THEN
    ALTER TYPE "GiftStatus" ADD VALUE 'REFUNDED';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'paymentstatus' AND e.enumlabel = 'PROCESSING') THEN
    ALTER TYPE "PaymentStatus" ADD VALUE 'PROCESSING';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'paymentstatus' AND e.enumlabel = 'REFUNDED') THEN
    ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';
  END IF;
END
$$;

-- Add column to payment
ALTER TABLE "payment"
  ADD COLUMN IF NOT EXISTS "last_checked_at" TIMESTAMPTZ;

-- Pix transaction table
CREATE TABLE IF NOT EXISTS "pix_transaction" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "gift_id" UUID NOT NULL,
  "psp_transaction_id" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "last_checked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_pix_transaction_gift FOREIGN KEY ("gift_id") REFERENCES "gift"("id")
);

CREATE INDEX IF NOT EXISTS pix_transaction_gift_idx ON "pix_transaction"("gift_id");
CREATE INDEX IF NOT EXISTS pix_transaction_status_idx ON "pix_transaction"("status");

-- System config key/value
CREATE TABLE IF NOT EXISTS "system_config" (
  "key" TEXT PRIMARY KEY,
  "value" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default refund days if missing
INSERT INTO "system_config" ("key", "value")
VALUES ('refund_days_not_redeemed', '30')
ON CONFLICT ("key") DO NOTHING;
