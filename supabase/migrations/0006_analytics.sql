-- Privacy-aware first-party analytics
-- Raw events are written only by the server-side service role.

alter table public.events
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists continent text,
  add column if not exists device_type text,
  add column if not exists browser text,
  add column if not exists operating_system text,
  add column if not exists landing_page text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists consent_version text default '1';

create index if not exists events_event_type_idx on public.events (event_type);
create index if not exists events_visitor_id_idx on public.events (visitor_id);
create index if not exists events_session_id_idx on public.events (session_id);
create index if not exists events_country_idx on public.events (country);

-- The application writes enrichment into the existing metadata JSON so a
-- rolling deployment remains compatible with the old schema. This trigger
-- mirrors that trusted server-generated block into indexed columns.
create or replace function public.set_event_analytics_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.city := coalesce(nullif(new.city, ''), new.metadata #>> '{_analytics,city}');
  new.region := coalesce(nullif(new.region, ''), new.metadata #>> '{_analytics,region}');
  new.continent := coalesce(nullif(new.continent, ''), new.metadata #>> '{_analytics,continent}');
  new.device_type := coalesce(nullif(new.device_type, ''), new.metadata #>> '{_analytics,deviceType}');
  new.browser := coalesce(nullif(new.browser, ''), new.metadata #>> '{_analytics,browser}');
  new.operating_system := coalesce(nullif(new.operating_system, ''), new.metadata #>> '{_analytics,operatingSystem}');
  new.landing_page := coalesce(nullif(new.landing_page, ''), new.metadata #>> '{_analytics,landingPage}');
  new.utm_source := coalesce(nullif(new.utm_source, ''), new.metadata #>> '{_analytics,utmSource}');
  new.utm_medium := coalesce(nullif(new.utm_medium, ''), new.metadata #>> '{_analytics,utmMedium}');
  new.utm_campaign := coalesce(nullif(new.utm_campaign, ''), new.metadata #>> '{_analytics,utmCampaign}');
  new.utm_term := coalesce(nullif(new.utm_term, ''), new.metadata #>> '{_analytics,utmTerm}');
  new.utm_content := coalesce(nullif(new.utm_content, ''), new.metadata #>> '{_analytics,utmContent}');
  new.consent_version := coalesce(nullif(new.consent_version, ''), new.metadata #>> '{_analytics,consentVersion}', '1');
  return new;
end;
$$;

drop trigger if exists set_event_analytics_columns on public.events;
create trigger set_event_analytics_columns
before insert or update of metadata on public.events
for each row execute function public.set_event_analytics_columns();

update public.events
set metadata = metadata
where metadata ? '_analytics';

-- Browser clients must never write directly to the analytics table. The API
-- validates consent, origin, event names and payload size before using service-role.
drop policy if exists "events_public_insert" on public.events;

-- Optional maintenance helper. Run monthly from a trusted scheduler with the
-- service role to keep only the configured raw-event retention window.
create or replace function public.prune_analytics_events(retention_days integer default 180)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count bigint;
begin
  if retention_days < 30 or retention_days > 730 then
    raise exception 'retention_days must be between 30 and 730';
  end if;

  delete from public.events
  where created_at < now() - make_interval(days => retention_days);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.prune_analytics_events(integer) from public, anon, authenticated;
grant execute on function public.prune_analytics_events(integer) to service_role;
