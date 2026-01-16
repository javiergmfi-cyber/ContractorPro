-- ============================================================================
-- Migration: Auto-Chase Cron + SMS Opt-Out Compliance
-- Production readiness for auto-chase system
-- ============================================================================

-- 1. Add SMS opt-out field to clients table (compliance requirement)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sms_opt_out BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sms_opt_out_at TIMESTAMPTZ;

-- 2. Add SMS opt-out to invoices table (for client_phone on invoice)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_sms_opt_out BOOLEAN DEFAULT false;

-- 3. Create index for opt-out lookups
CREATE INDEX IF NOT EXISTS idx_clients_sms_opt_out ON clients(sms_opt_out) WHERE sms_opt_out = true;

-- ============================================================================
-- 4. Update get_invoices_for_chase() to respect opt-outs and chase balance only
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
  chase_count INTEGER,
  status TEXT,
  deposit_enabled BOOLEAN,
  invoice_number TEXT
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
    COALESCE((SELECT COUNT(*) FROM chase_events ce WHERE ce.invoice_id = i.id), 0)::INTEGER as chase_count,
    i.status,
    COALESCE(i.deposit_enabled, false) as deposit_enabled,
    i.invoice_number
  FROM invoices i
  WHERE
    i.auto_chase_enabled = true
    AND i.status IN ('sent', 'overdue', 'deposit_paid')
    AND (i.total - COALESCE(i.amount_paid, 0)) > 0  -- Has remaining balance
    AND i.sent_at IS NOT NULL
    AND i.sent_at < NOW() - INTERVAL '24 hours'  -- At least 24h since sent
    AND i.client_phone IS NOT NULL  -- Must have phone number
    AND COALESCE(i.client_sms_opt_out, false) = false  -- Respect opt-out
  ORDER BY i.sent_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. Set up hourly cron job for auto-chase
-- Note: This requires pg_cron and pg_net extensions enabled in Supabase
-- ============================================================================

-- Enable required extensions (if not already enabled)
-- These are typically enabled via Supabase dashboard
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule auto-chase to run every hour at minute 0
-- The function URL and service key will be set via Supabase secrets
DO $$
BEGIN
  -- Check if pg_cron extension exists before trying to use it
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing job if it exists
    PERFORM cron.unschedule('auto-chase-hourly');
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'pg_cron not available - cron job must be set up manually in Supabase dashboard';
END;
$$;

-- Note: The actual cron schedule should be set up in Supabase Dashboard:
-- 1. Go to Database > Extensions > Enable pg_cron
-- 2. Go to Database > Scheduled Jobs
-- 3. Add new job:
--    Name: auto-chase-hourly
--    Schedule: 0 * * * * (every hour at minute 0)
--    Command: SELECT net.http_post(
--      url := current_setting('app.supabase_url') || '/functions/v1/auto-chase',
--      headers := jsonb_build_object(
--        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
--        'Content-Type', 'application/json'
--      ),
--      body := '{}'::jsonb
--    );

-- ============================================================================
-- 6. Function to handle SMS opt-out (called when Twilio reports STOP)
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_sms_opt_out(p_phone TEXT)
RETURNS void AS $$
BEGIN
  -- Mark client as opted out
  UPDATE clients
  SET sms_opt_out = true, sms_opt_out_at = NOW()
  WHERE phone = p_phone OR phone = '+1' || REPLACE(p_phone, '+1', '');

  -- Mark all invoices with this phone as opted out
  UPDATE invoices
  SET client_sms_opt_out = true
  WHERE client_phone = p_phone OR client_phone = '+1' || REPLACE(p_phone, '+1', '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. Ensure chase_events has proper constraints for attempt limits
-- ============================================================================
ALTER TABLE chase_events DROP CONSTRAINT IF EXISTS chase_events_attempt_limit;
ALTER TABLE chase_events ADD CONSTRAINT chase_events_attempt_limit
  CHECK (attempt_number >= 1 AND attempt_number <= 5);
