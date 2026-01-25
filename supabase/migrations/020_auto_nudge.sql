-- Migration: Auto-Nudge for Estimates
-- Adds auto_nudge_enabled to invoices and creates nudge_events table

-- Add auto_nudge_enabled to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS auto_nudge_enabled BOOLEAN DEFAULT false;

-- Create nudge_events table to track nudge attempts
CREATE TABLE IF NOT EXISTS nudge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1 AND attempt_number <= 3),
  channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'email')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(invoice_id, attempt_number)
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_nudge_events_invoice_id ON nudge_events(invoice_id);
CREATE INDEX IF NOT EXISTS idx_nudge_events_user_id ON nudge_events(user_id);
CREATE INDEX IF NOT EXISTS idx_nudge_events_sent_at ON nudge_events(sent_at);

-- RLS policies for nudge_events
ALTER TABLE nudge_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own nudge events
CREATE POLICY nudge_events_select_own ON nudge_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert nudge events (for edge function)
CREATE POLICY nudge_events_insert_service ON nudge_events
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON nudge_events TO authenticated;
GRANT INSERT, UPDATE ON nudge_events TO service_role;

-- RPC function to get estimates eligible for nudge
-- Returns estimates where:
-- - auto_nudge_enabled = true
-- - status = 'sent' (estimate state)
-- - deposit_enabled = true (it's an estimate requiring deposit)
-- - deposit_paid_at IS NULL (deposit not yet paid)
-- - sent_at is at least 3 days ago (first nudge threshold)
-- - client has phone number
-- - client hasn't opted out of SMS
CREATE OR REPLACE FUNCTION get_estimates_for_nudge()
RETURNS TABLE(
  invoice_id UUID,
  user_id UUID,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  total BIGINT,
  deposit_amount BIGINT,
  currency TEXT,
  invoice_number TEXT,
  tracking_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ,
  hours_since_sent NUMERIC,
  nudge_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id AS invoice_id,
    i.user_id,
    i.client_name,
    i.client_phone,
    i.client_email,
    i.total,
    i.deposit_amount,
    i.currency,
    i.invoice_number,
    i.tracking_id,
    i.status::TEXT,
    i.sent_at,
    EXTRACT(EPOCH FROM (NOW() - i.sent_at)) / 3600 AS hours_since_sent,
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM nudge_events ne
      WHERE ne.invoice_id = i.id
    ), 0) AS nudge_count
  FROM invoices i
  LEFT JOIN clients c ON i.client_id = c.id
  WHERE
    i.auto_nudge_enabled = true
    AND i.status = 'sent'
    AND i.deposit_enabled = true
    AND i.deposit_paid_at IS NULL
    AND i.sent_at IS NOT NULL
    AND i.sent_at < NOW() - INTERVAL '3 days'
    AND i.client_phone IS NOT NULL
    AND i.client_phone != ''
    AND COALESCE(c.sms_opt_out, false) = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_estimates_for_nudge() TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION get_estimates_for_nudge() IS 'Returns estimates eligible for auto-nudge reminders. Used by the auto-nudge edge function.';
