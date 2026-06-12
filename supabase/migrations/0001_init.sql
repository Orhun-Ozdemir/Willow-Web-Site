-- WillowSoft → Supabase initial schema
-- Design: each content collection is one row per item.
--   data      jsonb : the full item MINUS its `localized` map (no field is lost)
--   localized jsonb : the item's `localized` translations map
-- Fixed columns (slug, category, featured, sort_order) are query/sort copies only.
-- Assemble in loadContent(): row => ({ ...row.data, localized: row.localized }).

-- ---------------------------------------------------------------------------
-- Content collections
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id          text primary key,
  slug        text,
  category    text,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  data        jsonb   not null default '{}'::jsonb,
  localized   jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.news (
  id          text primary key,
  slug        text,
  category    text,
  date        text,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  data        jsonb   not null default '{}'::jsonb,
  localized   jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.services (
  id          text primary key,
  sort_order  integer not null default 0,
  data        jsonb   not null default '{}'::jsonb,
  localized   jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.solutions (
  id          text primary key,
  slug        text,
  category    text,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  data        jsonb   not null default '{}'::jsonb,
  localized   jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.clients (
  id          text primary key,
  name        text,
  industry    text,
  country     text,
  logo        text,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  data        jsonb   not null default '{}'::jsonb,
  localized   jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.faqs (
  id          text primary key,
  page        text,
  sort_order  integer not null default 0,
  data        jsonb   not null default '{}'::jsonb,
  localized   jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.glossary (
  id          text primary key,
  category    text,
  sort_order  integer not null default 0,
  data        jsonb   not null default '{}'::jsonb,
  localized   jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Singletons / dictionaries (one row per page or locale, data jsonb)
-- ---------------------------------------------------------------------------

create table if not exists public.page_content (
  page        text primary key,
  data        jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- pageSeo[page] = { en:{...}, tr:{...}, ... } stored as data jsonb per page
create table if not exists public.page_seo (
  page        text primary key,
  data        jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.translations (
  locale      text primary key,
  data        jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- single-row tables (id always = 1)
create table if not exists public.company_facts (
  id          integer primary key default 1,
  data        jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  constraint company_facts_singleton check (id = 1)
);

create table if not exists public.site_meta (
  id          integer primary key default 1,
  data        jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  constraint site_meta_singleton check (id = 1)
);

-- ---------------------------------------------------------------------------
-- Operational tables
-- ---------------------------------------------------------------------------

create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  status           text not null default 'new',
  internal_note    text default '',
  source_page      text default '',
  locale           text default 'en',
  name             text default '',
  company          text default '',
  email            text default '',
  phone            text default '',
  country          text default '',
  interest_type    text default '',
  product_interest text default '',
  service_interest text default '',
  message          text default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text default 'page_view',
  visitor_id  text,
  session_id  text,
  path        text,
  title       text,
  locale      text,
  referrer    text,
  country     text,
  ip_hint     text,
  user_agent  text,
  viewport    jsonb,
  screen      jsonb,
  timezone    text,
  language    text,
  duration_ms integer,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_path_idx on public.events (path);

create table if not exists public.bot_events (
  id          uuid primary key default gen_random_uuid(),
  bot_name    text,
  path        text,
  user_agent  text,
  ip_hint     text,
  created_at  timestamptz not null default now()
);
create index if not exists bot_events_created_at_idx on public.bot_events (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'products','news','services','solutions','clients','faqs','glossary',
    'page_content','page_seo','translations','company_facts','site_meta','leads'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
