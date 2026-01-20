-- Add Google Place ID for GMB review deep linking
-- Per HYBRID_SPEC.md Phase 4: Instant Reputation Loop

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'google_place_id') THEN
    ALTER TABLE profiles ADD COLUMN google_place_id TEXT;
  END IF;
END $$;

-- Comment
COMMENT ON COLUMN profiles.google_place_id IS 'Google Place ID for GMB review deep linking (e.g., ChIJN1t_tDeuEmsRUsoyG83frY4)';
