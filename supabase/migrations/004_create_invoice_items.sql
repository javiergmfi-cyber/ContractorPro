-- Migration: Create invoice_items table
-- Individual line items for invoices
-- Per architecture-spec.md Section 3.2

create table public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  unit_price bigint not null default 0, -- Stored in cents
  total bigint not null default 0, -- Stored in cents

  -- AI traceability (per architecture-spec.md Section 2.3)
  original_transcript_segment text,

  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.invoice_items enable row level security;

-- RLS Policies: Access through invoice ownership
-- Users can access items if they own the parent invoice
create policy "Users can view own invoice items"
  on public.invoice_items for select
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can insert own invoice items"
  on public.invoice_items for insert
  with check (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can update own invoice items"
  on public.invoice_items for update
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can delete own invoice items"
  on public.invoice_items for delete
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- Index for invoice lookups
create index invoice_items_invoice_id_idx on public.invoice_items(invoice_id);

comment on table public.invoice_items is 'Line items for invoices with AI transcript traceability';
