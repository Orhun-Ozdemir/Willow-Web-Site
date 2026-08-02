-- Daily digest reminders for uncontacted leads (status = 'new').

alter table public.leads
  add column if not exists last_reminder_at timestamptz;

create index if not exists leads_new_created_at_idx
  on public.leads (created_at asc)
  where status = 'new';
