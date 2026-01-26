-- Add change order approval fields to invoices
ALTER TABLE invoices
  ADD COLUMN change_order_pending BOOLEAN DEFAULT false,
  ADD COLUMN change_order_description TEXT,
  ADD COLUMN change_order_amount INTEGER,
  ADD COLUMN change_order_previous_total INTEGER;
