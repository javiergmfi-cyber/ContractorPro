-- Activity Events Table
-- Tracks system events for the activity feed (invoice sent, viewed, reminder sent, payment received)

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('invoice_sent', 'invoice_viewed', 'reminder_sent', 'payment_received')),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  client_name TEXT,
  amount INTEGER, -- in cents
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_activity_events_user_created ON activity_events(user_id, created_at DESC);
CREATE INDEX idx_activity_events_invoice ON activity_events(invoice_id);

-- Enable RLS
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own activity
CREATE POLICY "Users can view own activity"
  ON activity_events FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own activity events
CREATE POLICY "Users can create own activity"
  ON activity_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Cancelled Reminders Table (for Pre-Flight Check)
-- Stores cancelled reminders for today to prevent sending
CREATE TABLE IF NOT EXISTS cancelled_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  cancelled_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, invoice_id, cancelled_date)
);

-- Index for efficient lookups
CREATE INDEX idx_cancelled_reminders_user_date ON cancelled_reminders(user_id, cancelled_date);

-- Enable RLS
ALTER TABLE cancelled_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own cancelled reminders
CREATE POLICY "Users can manage own cancelled reminders"
  ON cancelled_reminders FOR ALL
  USING (auth.uid() = user_id);

-- Add subscription fields to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_tier') THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_period_end') THEN
    ALTER TABLE profiles ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;
END $$;

COMMENT ON TABLE activity_events IS 'Tracks system events for the activity feed';
COMMENT ON TABLE cancelled_reminders IS 'Tracks reminders cancelled via Pre-Flight Check to prevent sending';
