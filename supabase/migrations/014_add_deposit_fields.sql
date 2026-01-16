-- Add deposit fields to invoices table for Phase 2: Deposits System
-- Supports "One Job → One Thread → One Link" concept

-- Add deposit-related columns
DO $$
BEGIN
  -- Deposit enabled flag
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deposit_enabled') THEN
    ALTER TABLE invoices ADD COLUMN deposit_enabled BOOLEAN DEFAULT false;
  END IF;

  -- Deposit type: 'percent' or 'fixed'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deposit_type') THEN
    ALTER TABLE invoices ADD COLUMN deposit_type TEXT CHECK (deposit_type IN ('percent', 'fixed'));
  END IF;

  -- Deposit value (percentage like 30, 50 or fixed amount in cents)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deposit_value') THEN
    ALTER TABLE invoices ADD COLUMN deposit_value INTEGER;
  END IF;

  -- Computed deposit amount in cents
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deposit_amount') THEN
    ALTER TABLE invoices ADD COLUMN deposit_amount INTEGER DEFAULT 0;
  END IF;

  -- Total amount paid so far (deposit + any partial payments)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'amount_paid') THEN
    ALTER TABLE invoices ADD COLUMN amount_paid INTEGER DEFAULT 0;
  END IF;

  -- Stripe Payment Intent for deposit
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deposit_payment_intent_id') THEN
    ALTER TABLE invoices ADD COLUMN deposit_payment_intent_id TEXT;
  END IF;

  -- Stripe Payment Intent for remaining balance
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'balance_payment_intent_id') THEN
    ALTER TABLE invoices ADD COLUMN balance_payment_intent_id TEXT;
  END IF;

  -- When customer approved the estimate (without paying)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'approved_at') THEN
    ALTER TABLE invoices ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  -- When deposit was paid
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deposit_paid_at') THEN
    ALTER TABLE invoices ADD COLUMN deposit_paid_at TIMESTAMPTZ;
  END IF;

  -- Auto-chase enabled per invoice (PRO feature)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'auto_chase_enabled') THEN
    ALTER TABLE invoices ADD COLUMN auto_chase_enabled BOOLEAN DEFAULT false;
  END IF;

  -- Late fee settings per invoice
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'late_fee_enabled') THEN
    ALTER TABLE invoices ADD COLUMN late_fee_enabled BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'late_fee_type') THEN
    ALTER TABLE invoices ADD COLUMN late_fee_type TEXT CHECK (late_fee_type IN ('percent', 'fixed'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'late_fee_value') THEN
    ALTER TABLE invoices ADD COLUMN late_fee_value INTEGER;
  END IF;
END $$;

-- Add 'deposit_paid' to status enum if not exists
-- Note: In Supabase, we handle status as text with check constraint
-- The app already has: 'draft' | 'sent' | 'paid' | 'void' | 'overdue'
-- We're adding: 'deposit_paid'

-- Create index for deposit queries
CREATE INDEX IF NOT EXISTS idx_invoices_deposit_enabled ON invoices(deposit_enabled) WHERE deposit_enabled = true;
CREATE INDEX IF NOT EXISTS idx_invoices_deposit_paid_at ON invoices(deposit_paid_at) WHERE deposit_paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_auto_chase ON invoices(auto_chase_enabled) WHERE auto_chase_enabled = true;

-- Comments
COMMENT ON COLUMN invoices.deposit_enabled IS 'Whether deposit collection is enabled for this invoice';
COMMENT ON COLUMN invoices.deposit_type IS 'Type of deposit: percent or fixed amount';
COMMENT ON COLUMN invoices.deposit_value IS 'Deposit value (percentage 1-100 or fixed amount in cents)';
COMMENT ON COLUMN invoices.deposit_amount IS 'Computed deposit amount in cents';
COMMENT ON COLUMN invoices.amount_paid IS 'Total amount paid so far in cents';
COMMENT ON COLUMN invoices.deposit_payment_intent_id IS 'Stripe PaymentIntent ID for deposit payment';
COMMENT ON COLUMN invoices.balance_payment_intent_id IS 'Stripe PaymentIntent ID for remaining balance';
COMMENT ON COLUMN invoices.approved_at IS 'When customer approved the estimate without paying';
COMMENT ON COLUMN invoices.deposit_paid_at IS 'When deposit was paid';
COMMENT ON COLUMN invoices.auto_chase_enabled IS 'Per-invoice auto-chase setting (PRO feature)';
COMMENT ON COLUMN invoices.late_fee_enabled IS 'Whether late fees are enabled for this invoice';
COMMENT ON COLUMN invoices.late_fee_type IS 'Type of late fee: percent or fixed';
COMMENT ON COLUMN invoices.late_fee_value IS 'Late fee value (percentage or cents)';
