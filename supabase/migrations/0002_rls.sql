-- Row Level Security policies
-- Content + singleton tables: public SELECT (anon), writes only for authenticated.
--   Server-side writes use the service-role key (bypasses RLS) for content saves.
-- leads / events: anon INSERT (public forms & analytics), authenticated reads/updates.
-- bot_events: inserted server-side (service-role), authenticated SELECT.

do $$
declare t text;
begin
  -- Content + singleton tables: public read, authenticated write
  foreach t in array array[
    'products','news','services','solutions','clients','faqs','glossary',
    'page_content','page_seo','translations','company_facts','site_meta'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%s_public_read" on public.%I', t, t);
    execute format($p$create policy "%s_public_read" on public.%I for select to anon, authenticated using (true)$p$, t, t);

    execute format('drop policy if exists "%s_auth_write" on public.%I', t, t);
    execute format($p$create policy "%s_auth_write" on public.%I for all to authenticated using (true) with check (true)$p$, t, t);
  end loop;
end $$;

-- leads: anon may INSERT (public forms); authenticated may read / update / delete
alter table public.leads enable row level security;
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads for insert to anon, authenticated with check (true);
drop policy if exists "leads_auth_read" on public.leads;
create policy "leads_auth_read" on public.leads for select to authenticated using (true);
drop policy if exists "leads_auth_update" on public.leads;
create policy "leads_auth_update" on public.leads for update to authenticated using (true) with check (true);
drop policy if exists "leads_auth_delete" on public.leads;
create policy "leads_auth_delete" on public.leads for delete to authenticated using (true);

-- events: anon may INSERT (analytics beacon); authenticated may read
alter table public.events enable row level security;
drop policy if exists "events_public_insert" on public.events;
create policy "events_public_insert" on public.events for insert to anon, authenticated with check (true);
drop policy if exists "events_auth_read" on public.events;
create policy "events_auth_read" on public.events for select to authenticated using (true);

-- bot_events: only authenticated may read (writes happen via service-role, bypassing RLS)
alter table public.bot_events enable row level security;
drop policy if exists "bot_events_auth_read" on public.bot_events;
create policy "bot_events_auth_read" on public.bot_events for select to authenticated using (true);
