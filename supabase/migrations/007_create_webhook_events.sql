-- Migration: Create webhook_events table
-- Idempotency tracking for Stripe webhooks
-- Per architecture-spec.md Section 4.4

create table public.webhook_events (
  id text primary key, -- Stripe event ID (evt_...)
  event_type text not null,
  processed_at timestamptz default now(),
  payload jsonb
);

-- No RLS needed - this table is only accessed by Edge Functions
-- using the service role key

-- Index for cleanup queries
create index webhook_events_processed_at_idx on public.webhook_events(processed_at);

comment on table public.webhook_events is 'Stripe webhook idempotency tracking';

-- Cleanup old events (optional, can be run via cron)
-- Events older than 30 days can be safely deleted
create or replace function public.cleanup_old_webhook_events()
returns void as $$
begin
  delete from public.webhook_events
  where processed_at < now() - interval '30 days';
end;
$$ language plpgsql security definer;
