-- Migration: Create reminder settings and logs for "Bad Cop" system
-- Per product-strategy.md Section 3.3

create table public.reminder_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  enabled boolean default false,
  day_intervals integer[] default '{3, 7, 14}', -- Days after due date to send reminders
  email_enabled boolean default true,
  sms_enabled boolean default false,
  message_template text default 'This is an automated reminder for invoice {{invoice_number}} from {{business_name}}. Amount due: {{total}}. Please pay at your earliest convenience.',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reminder logs to track what was sent
create table public.reminder_logs (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  reminder_type text not null, -- 'email' or 'sms'
  sent_at timestamptz default now(),
  status text default 'sent', -- 'sent', 'failed', 'delivered'
  error_message text
);

-- Enable Row Level Security
alter table public.reminder_settings enable row level security;
alter table public.reminder_logs enable row level security;

-- RLS Policies for reminder_settings
create policy "Users can view own reminder settings"
  on public.reminder_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own reminder settings"
  on public.reminder_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reminder settings"
  on public.reminder_settings for update
  using (auth.uid() = user_id);

-- RLS Policies for reminder_logs (read-only for users)
create policy "Users can view own reminder logs"
  on public.reminder_logs for select
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = reminder_logs.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
create trigger on_reminder_settings_updated
  before update on public.reminder_settings
  for each row execute procedure public.handle_updated_at();

-- Indexes
create index reminder_settings_user_id_idx on public.reminder_settings(user_id);
create index reminder_logs_invoice_id_idx on public.reminder_logs(invoice_id);
create index reminder_logs_sent_at_idx on public.reminder_logs(sent_at);

comment on table public.reminder_settings is 'User preferences for automated invoice reminders (Bad Cop)';
comment on table public.reminder_logs is 'History of sent invoice reminders';
