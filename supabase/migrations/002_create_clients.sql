-- Migration: Create clients table
-- Stores contractor's customers (CRM data)
-- Per architecture-spec.md Section 3.2

create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.clients enable row level security;

-- RLS Policies: Users can only access their own clients
create policy "Users can view own clients"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Users can delete own clients"
  on public.clients for delete
  using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger on_clients_updated
  before update on public.clients
  for each row execute procedure public.handle_updated_at();

-- Indexes for common queries
create index clients_user_id_idx on public.clients(user_id);
create index clients_name_idx on public.clients(user_id, name);

comment on table public.clients is 'Contractor customer records';
