-- Migration: Create glossary_terms table
-- Construction terminology for Spanglish/Portuñol translation
-- Per architecture-spec.md Section 9.2

create table public.glossary_terms (
  id uuid default gen_random_uuid() primary key,
  term text not null,
  standard_english text not null,
  category text, -- e.g., 'roofing', 'plumbing', 'electrical', 'general'
  language text default 'es', -- 'es' for Spanish, 'pt' for Portuguese
  created_at timestamptz default now()
);

-- This table is read-only for users, managed by admins
-- No RLS needed as it's public reference data
alter table public.glossary_terms enable row level security;

-- Allow all authenticated users to read glossary
create policy "Authenticated users can view glossary"
  on public.glossary_terms for select
  using (auth.role() = 'authenticated');

-- Index for term lookups
create index glossary_terms_term_idx on public.glossary_terms(term);
create index glossary_terms_language_idx on public.glossary_terms(language);

comment on table public.glossary_terms is 'Construction Spanglish/Portuñol translation glossary for AI';
