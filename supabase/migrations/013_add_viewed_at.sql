-- Add viewed_at column to invoices for displaying "Viewed" status in UI
-- This is updated when the customer opens the invoice payment link

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'viewed_at') THEN
    ALTER TABLE invoices ADD COLUMN viewed_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_viewed_at ON invoices(viewed_at);

COMMENT ON COLUMN invoices.viewed_at IS 'Timestamp when customer first viewed the invoice (Read Receipt)';
