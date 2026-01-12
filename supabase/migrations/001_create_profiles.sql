-- Migration: Create profiles table
-- Extends auth.users with business profile and Stripe information
-- Per architecture-spec.md Section 3.3.1

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  business_name text,
  full_name text,
  email text,
  phone text,
  address text,
  logo_url text,
  stripe_account_id text unique,
  charges_enabled boolean default false,
  payouts_enabled boolean default false,
  default_currency text default 'USD',
  default_language text default 'en',
  tax_rate numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (CRITICAL per architecture-spec.md Section 11.1)
alter table public.profiles enable row level security;

-- RLS Policies: Users can only access their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Index for Stripe account lookups
create index profiles_stripe_account_id_idx on public.profiles(stripe_account_id);

comment on table public.profiles is 'User business profiles with Stripe Connect integration';
