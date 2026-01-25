-- Migration: Trial Tracking
-- Adds trial fields to profiles for 5-day free trial

-- Add trial tracking fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_claimed_trial BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Add index for trial lookups
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN profiles.has_claimed_trial IS 'Whether user has ever claimed the free trial';
COMMENT ON COLUMN profiles.trial_started_at IS 'When the user started their free trial';
COMMENT ON COLUMN profiles.trial_ends_at IS 'When the users free trial expires (5 days after start)';
