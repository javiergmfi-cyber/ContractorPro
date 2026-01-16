-- ============================================================================
-- Migration: Payment Safety + Idempotency Tables
-- Phase 5: Prevent double-charges, race conditions, and ensure atomic updates
-- ============================================================================

-- 5.1 Payments table for idempotency tracking
-- Each successful payment is recorded here to prevent double-counting
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL, -- Stripe event ID for idempotency
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'full')),
  amount INTEGER NOT NULL CHECK (amount > 0), -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_event_id ON payments(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- 6.2 Chase events table for auto-reminder tracking
-- Prevents duplicate reminders and tracks chase attempts
CREATE TABLE IF NOT EXISTS chase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1 AND attempt_number <= 5),
  channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'email', 'push')),
  message_type TEXT NOT NULL DEFAULT 'reminder',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  -- Unique constraint: only one reminder per attempt number per invoice
  UNIQUE(invoice_id, attempt_number)
);

-- Index for chase schedule queries
CREATE INDEX IF NOT EXISTS idx_chase_events_invoice_id ON chase_events(invoice_id);
CREATE INDEX IF NOT EXISTS idx_chase_events_sent_at ON chase_events(sent_at);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chase_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chase_events
CREATE POLICY "Users can view their own chase events"
  ON chase_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage chase events"
  ON chase_events FOR ALL
  WITH CHECK (true);

-- ============================================================================
-- 5.2 Atomic invoice update function
-- This function safely updates invoice payment state with proper locking
-- ============================================================================
CREATE OR REPLACE FUNCTION process_payment(
  p_invoice_id UUID,
  p_amount INTEGER,
  p_payment_type TEXT,
  p_stripe_event_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_invoice RECORD;
  v_new_amount_paid INTEGER;
  v_new_status TEXT;
  v_result JSONB;
BEGIN
  -- Lock the invoice row for update (prevents race conditions)
  SELECT id, total, amount_paid, status, deposit_enabled, deposit_amount
  INTO v_invoice
  FROM invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
  END IF;

  -- Calculate new amount_paid, clamped to total (5.3)
  v_new_amount_paid := LEAST(v_invoice.total, COALESCE(v_invoice.amount_paid, 0) + p_amount);

  -- Determine new status
  IF v_new_amount_paid >= v_invoice.total THEN
    -- Fully paid
    v_new_status := 'paid';
  ELSIF p_payment_type = 'deposit' AND v_invoice.deposit_enabled THEN
    -- Deposit payment
    v_new_status := 'deposit_paid';
  ELSE
    -- Partial payment (keep current status or set to deposit_paid if applicable)
    v_new_status := COALESCE(v_invoice.status, 'sent');
  END IF;

  -- Update invoice atomically
  UPDATE invoices
  SET
    amount_paid = v_new_amount_paid,
    status = v_new_status,
    deposit_paid_at = CASE
      WHEN p_payment_type = 'deposit' AND deposit_paid_at IS NULL
      THEN NOW()
      ELSE deposit_paid_at
    END,
    paid_at = CASE
      WHEN v_new_status = 'paid' AND paid_at IS NULL
      THEN NOW()
      ELSE paid_at
    END,
    approved_at = CASE
      WHEN approved_at IS NULL
      THEN NOW()
      ELSE approved_at
    END
  WHERE id = p_invoice_id;

  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'invoice_id', p_invoice_id,
    'previous_amount_paid', COALESCE(v_invoice.amount_paid, 0),
    'new_amount_paid', v_new_amount_paid,
    'previous_status', v_invoice.status,
    'new_status', v_new_status,
    'remaining_balance', v_invoice.total - v_new_amount_paid
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Helper function to get invoices due for auto-chase
-- ============================================================================
CREATE OR REPLACE FUNCTION get_invoices_for_chase()
RETURNS TABLE (
  invoice_id UUID,
  user_id UUID,
  client_name TEXT,
  client_phone TEXT,
  total INTEGER,
  amount_paid INTEGER,
  remaining_balance INTEGER,
  currency TEXT,
  sent_at TIMESTAMPTZ,
  tracking_id UUID,
  hours_since_sent NUMERIC,
  chase_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id as invoice_id,
    i.user_id,
    i.client_name,
    i.client_phone,
    i.total,
    COALESCE(i.amount_paid, 0) as amount_paid,
    (i.total - COALESCE(i.amount_paid, 0)) as remaining_balance,
    i.currency,
    i.sent_at,
    i.tracking_id,
    EXTRACT(EPOCH FROM (NOW() - i.sent_at)) / 3600 as hours_since_sent,
    COALESCE((SELECT COUNT(*) FROM chase_events ce WHERE ce.invoice_id = i.id), 0)::INTEGER as chase_count
  FROM invoices i
  WHERE
    i.auto_chase_enabled = true
    AND i.status IN ('sent', 'overdue', 'deposit_paid')
    AND (i.total - COALESCE(i.amount_paid, 0)) > 0  -- Has remaining balance
    AND i.sent_at IS NOT NULL
    AND i.sent_at < NOW() - INTERVAL '24 hours'  -- At least 24h since sent
  ORDER BY i.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
