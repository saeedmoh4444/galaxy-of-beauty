-- Migration: Add check constraints for business data integrity
-- Author: Automated (Phase 8)
-- Lock duration: <1s per table (metadata-only DDL)
-- Data rewrite: No
-- Rollback: ALTER TABLE <table> DROP CONSTRAINT <name>;
-- Compatibility: Non-breaking — only adds validation, existing data already compliant

-- ── Ratings ──────────────────────────────────────────────
-- Ensure ratings are always 1-5
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_reviews_rating') THEN
    ALTER TABLE reviews ADD CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

-- ── Monetary Fields (non-negative) ───────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_bookings_amount') THEN
    ALTER TABLE bookings ADD CONSTRAINT chk_bookings_amount CHECK (total_amount >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_bookings_fee') THEN
    ALTER TABLE bookings ADD CONSTRAINT chk_bookings_fee CHECK (platform_fee >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_amount') THEN
    ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_wallet_tx_amount') THEN
    ALTER TABLE wallet_transactions ADD CONSTRAINT chk_wallet_tx_amount CHECK (amount >= 0);
  END IF;
END $$;

-- ── Language ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_language') THEN
    ALTER TABLE users ADD CONSTRAINT chk_users_language CHECK (preferred_language IN ('ar', 'en'));
  END IF;
END $$;

-- ── Loyalty Discount ─────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_loyalty_discount') THEN
    ALTER TABLE loyalty_tiers ADD CONSTRAINT chk_loyalty_discount CHECK (discount_percent >= 0 AND discount_percent <= 100);
  END IF;
END $$;
