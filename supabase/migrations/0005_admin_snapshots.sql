-- CMS change snapshots for admin restore (service-role writes via API only)

create table if not exists public.admin_snapshots (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  actor_id      uuid references public.admin_users(id) on delete set null,
  actor_name    text not null,
  reason        text not null,
  scope         text not null default 'cms',
  content       jsonb not null,
  meta          jsonb not null default '{}'::jsonb
);

create index if not exists admin_snapshots_created_at_idx
  on public.admin_snapshots (created_at desc);
create index if not exists admin_snapshots_actor_name_idx
  on public.admin_snapshots (actor_name);
create index if not exists admin_snapshots_reason_idx
  on public.admin_snapshots (reason);

alter table public.admin_snapshots enable row level security;
drop policy if exists "deny_all" on public.admin_snapshots;
create policy "deny_all" on public.admin_snapshots using (false);
