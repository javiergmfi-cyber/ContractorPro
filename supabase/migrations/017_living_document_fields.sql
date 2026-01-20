-- Living Document fields for Phase 3: One document morphs through payment states
-- Per HYBRID_SPEC.md: "The Deposit is the Contract"

DO $$
BEGIN
  -- published_at: When contractor "sends" the estimate/invoice
  -- Documents with NULL published_at show "Document is being prepared" screen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'published_at') THEN
    ALTER TABLE invoices ADD COLUMN published_at TIMESTAMPTZ;
  END IF;

  -- signature_url: Client signature captured during deposit approval
  -- Stored as URL to signature image in Supabase Storage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'signature_url') THEN
    ALTER TABLE invoices ADD COLUMN signature_url TEXT;
  END IF;
END $$;

-- Index for published status queries (draft protection)
CREATE INDEX IF NOT EXISTS idx_invoices_published_at ON invoices(published_at) WHERE published_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN invoices.published_at IS 'When contractor sent/published the document. NULL = draft protection active';
COMMENT ON COLUMN invoices.signature_url IS 'URL to client signature image captured during deposit approval';
