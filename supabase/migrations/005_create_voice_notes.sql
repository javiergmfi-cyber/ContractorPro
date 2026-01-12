-- Migration: Create voice_notes table
-- Metadata for audio files stored in Supabase Storage
-- Per architecture-spec.md Section 3.4

create table public.voice_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invoice_id uuid references public.invoices(id) on delete set null,

  -- Storage reference
  storage_path text not null,

  -- Transcription data
  transcript text,
  detected_language text,

  -- AI processing metadata
  confidence_score numeric,
  processing_status text default 'pending', -- pending, processing, completed, failed

  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.voice_notes enable row level security;

-- RLS Policies: Users can only access their own voice notes
create policy "Users can view own voice notes"
  on public.voice_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own voice notes"
  on public.voice_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own voice notes"
  on public.voice_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own voice notes"
  on public.voice_notes for delete
  using (auth.uid() = user_id);

-- Indexes
create index voice_notes_user_id_idx on public.voice_notes(user_id);
create index voice_notes_invoice_id_idx on public.voice_notes(invoice_id);

comment on table public.voice_notes is 'Voice recording metadata with AI transcription results';
