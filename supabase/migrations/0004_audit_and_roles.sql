-- Audit log + admin roles (additive, safe for live)
-- Run on Supabase when ready. Until then the app falls back gracefully.

-- admin_users may already exist without role — add column with safe default
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.admin_users
  add column if not exists role text not null default 'super_admin';

-- Normalize constraint only when column is new or unconstrained
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'admin_users_role_check'
      and conrelid = 'public.admin_users'::regclass
  ) then
    alter table public.admin_users
      add constraint admin_users_role_check
      check (role in ('super_admin', 'content_editor', 'sales', 'viewer'));
  end if;
end $$;

-- Existing rows without explicit role keep full access
update public.admin_users set role = 'super_admin' where role is null;

alter table public.admin_users enable row level security;
drop policy if exists "deny_all" on public.admin_users;
create policy "deny_all" on public.admin_users using (false);

-- Append-only audit trail (service-role writes via API only)
create table if not exists public.admin_audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references public.admin_users(id) on delete set null,
  actor_name    text not null,
  action        text not null,
  resource      text not null,
  resource_id   text,
  metadata      jsonb not null default '{}'::jsonb,
  ip_hint       text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_actor_name_idx
  on public.admin_audit_logs (actor_name);
create index if not exists admin_audit_logs_action_idx
  on public.admin_audit_logs (action);

alter table public.admin_audit_logs enable row level security;
drop policy if exists "deny_all" on public.admin_audit_logs;
create policy "deny_all" on public.admin_audit_logs using (false);
