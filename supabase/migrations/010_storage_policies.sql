-- Migration: Storage bucket policies
-- Per architecture-spec.md Section 3.4

-- Note: Buckets must be created via Supabase Dashboard or CLI
-- This migration sets up the RLS policies for storage

-- Policy for voice-evidence bucket
-- Users can only access files in their own folder (folder name = user ID)
create policy "Users can upload voice evidence"
  on storage.objects for insert
  with check (
    bucket_id = 'voice-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own voice evidence"
  on storage.objects for select
  using (
    bucket_id = 'voice-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own voice evidence"
  on storage.objects for delete
  using (
    bucket_id = 'voice-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy for logos bucket
create policy "Users can upload logos"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own logos"
  on storage.objects for select
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own logos"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own logos"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy for invoice-pdfs bucket
create policy "Users can upload invoice PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'invoice-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own invoice PDFs"
  on storage.objects for select
  using (
    bucket_id = 'invoice-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own invoice PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'invoice-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
