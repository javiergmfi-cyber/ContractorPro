-- Migration: Add subscription columns to profiles
-- Implements "Utility-First Freemium" model
-- Free tier: 3 invoices/month, Pro tier: unlimited

-- Add subscription-related columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Add check constraint for valid subscription statuses
ALTER TABLE public.profiles
ADD CONSTRAINT valid_subscription_status
CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'trialing'));

-- Add check constraint for valid subscription tiers
ALTER TABLE public.profiles
ADD CONSTRAINT valid_subscription_tier
CHECK (subscription_tier IN ('free', 'pro'));

-- Create index for stripe_customer_id lookups (used by webhooks)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
ON public.profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status: free, active, canceled, past_due, trialing';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'Subscription tier: free (3 invoices/mo) or pro (unlimited)';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID for billing';
COMMENT ON COLUMN public.profiles.current_period_end IS 'End of current billing period';
