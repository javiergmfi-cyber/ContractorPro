-- Migration: Create storage buckets
-- Buckets for voice evidence, logos, and invoice PDFs

-- Create voice-evidence bucket (private, for audio recordings)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-evidence',
  'voice-evidence',
  false,
  52428800, -- 50MB limit
  array['audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/x-m4a']
)
on conflict (id) do nothing;

-- Create logos bucket (public, for business logos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos',
  'logos',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Create invoice-pdfs bucket (private, for generated PDFs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoice-pdfs',
  'invoice-pdfs',
  false,
  10485760, -- 10MB limit
  array['application/pdf']
)
on conflict (id) do nothing;
