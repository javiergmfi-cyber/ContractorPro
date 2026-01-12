-- Migration: Create invoices table
-- Core financial document with Stripe integration
-- Per architecture-spec.md Section 3.3.2

-- Create invoice status enum
create type invoice_status as enum ('draft', 'sent', 'paid', 'void', 'overdue');

create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text not null,

  -- Client info snapshot (in case client is deleted)
  client_name text not null,
  client_email text,
  client_phone text,
  client_address text,

  -- Stripe integration (per architecture-spec.md Section 4)
  stripe_payment_intent_id text,
  stripe_hosted_invoice_url text,

  -- Financial data (stored in cents per architecture-spec.md)
  subtotal bigint not null default 0,
  tax_rate numeric default 0,
  tax_amount bigint not null default 0,
  total bigint not null default 0,
  currency text default 'USD',

  -- Status and dates
  status invoice_status default 'draft',
  due_date date,
  paid_at timestamptz,
  sent_at timestamptz,

  -- Additional info
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.invoices enable row level security;

-- RLS Policies: Users can only access their own invoices
create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger on_invoices_updated
  before update on public.invoices
  for each row execute procedure public.handle_updated_at();

-- Indexes for performance (per architecture-spec.md Section 10.2)
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_status_idx on public.invoices(user_id, status);
create index invoices_created_at_idx on public.invoices(user_id, created_at desc);
create index invoices_stripe_pi_idx on public.invoices(stripe_payment_intent_id);

-- Composite index for dashboard queries
create index idx_invoices_user_status_date
  on public.invoices(user_id, status, created_at desc);

comment on table public.invoices is 'Financial invoices with Stripe payment integration';
