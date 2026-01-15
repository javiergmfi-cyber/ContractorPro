-- Add tracking_id to invoices for read receipt tracking
-- This is a unique short ID used in payment links for click tracking

-- Add tracking_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'tracking_id') THEN
    ALTER TABLE invoices ADD COLUMN tracking_id TEXT UNIQUE;
  END IF;
END $$;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_invoices_tracking_id ON invoices(tracking_id);

-- Add push_token to profiles for push notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'push_token') THEN
    ALTER TABLE profiles ADD COLUMN push_token TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preflight_time') THEN
    ALTER TABLE profiles ADD COLUMN preflight_time TIME DEFAULT '09:00:00';
  END IF;
END $$;

-- Function to generate short tracking ID
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking_id on invoice insert
CREATE OR REPLACE FUNCTION set_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_id IS NULL THEN
    NEW.tracking_id := generate_tracking_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_tracking_id ON invoices;
CREATE TRIGGER trigger_set_tracking_id
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_id();

-- Backfill existing invoices with tracking IDs
UPDATE invoices
SET tracking_id = generate_tracking_id()
WHERE tracking_id IS NULL;

COMMENT ON COLUMN invoices.tracking_id IS 'Unique short ID for payment link click tracking';
COMMENT ON COLUMN profiles.push_token IS 'Expo push notification token';
COMMENT ON COLUMN profiles.preflight_time IS 'Time of day for Pre-Flight Check notification';
