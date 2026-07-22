create extension if not exists pgcrypto with schema extensions;
create extension if not exists pgmq;

create type public.connection_status as enum ('disconnected','connected','expiring','expired','error');
create type public.automation_status as enum ('draft','active','paused','error','deleted');
create type public.run_status as enum ('queued','processing','succeeded','partial','failed','ambiguous');
create type public.step_status as enum ('pending','succeeded','failed','ambiguous','skipped');
create type public.comment_outcome as enum ('received','matched','not_matched','duplicate','wrong_media','connection_unavailable');

create table public.instagram_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  instagram_user_id text not null,
  username text not null,
  token_ciphertext text not null,
  token_iv text not null,
  token_tag text not null,
  token_expires_at timestamptz,
  api_version text not null,
  status public.connection_status not null default 'connected',
  last_sync_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id),
  unique(instagram_user_id)
);

create table public.instagram_media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.instagram_connections(id) on delete cascade,
  external_id text not null,
  media_product_type text not null check (media_product_type = 'REELS'),
  caption text not null default '',
  permalink text not null check (permalink ~ '^https://'),
  thumbnail_url text,
  published_at timestamptz not null,
  synced_at timestamptz not null default now(),
  unique(connection_id, external_id)
);

create table public.automations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.instagram_connections(id) on delete cascade,
  media_id uuid references public.instagram_media(id) on delete restrict,
  name text not null default '' check (char_length(name) <= 80),
  keyword text not null default '' check (char_length(keyword) <= 80),
  keyword_normalized text not null default '' check (char_length(keyword_normalized) <= 80),
  public_reply text not null default '' check (char_length(public_reply) <= 500),
  dm_message text not null default '' check (char_length(dm_message) <= 900),
  destination_url text not null default '' check (char_length(destination_url) <= 2048),
  status public.automation_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (
    status <> 'active' or (
      media_id is not null and name <> '' and keyword_normalized <> '' and
      public_reply <> '' and dm_message <> '' and destination_url ~ '^https://'
    )
  )
);

create unique index automations_unique_active_rule
  on public.automations(connection_id, media_id, keyword_normalized)
  where deleted_at is null;
create index automations_owner_status_idx on public.automations(owner_id, status) where deleted_at is null;

create table public.comment_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.instagram_connections(id) on delete cascade,
  automation_id uuid references public.automations(id) on delete set null,
  comment_id text not null,
  media_external_id text not null,
  commenter_scoped_id text not null,
  commenter_username text not null,
  comment_text text not null check (char_length(comment_text) <= 2200),
  payload_minimal jsonb not null default '{}'::jsonb,
  outcome public.comment_outcome not null default 'received',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(connection_id, comment_id)
);
create index comment_events_received_idx on public.comment_events(connection_id, received_at desc);

create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  automation_id uuid not null references public.automations(id) on delete restrict,
  comment_event_id uuid not null references public.comment_events(id) on delete restrict,
  automation_name_snapshot text not null,
  automation_version integer not null,
  media_external_id text not null,
  comment_id text not null,
  commenter_scoped_id text not null,
  commenter_username text not null,
  comment_text text not null,
  public_reply_snapshot text not null,
  dm_message_snapshot text not null,
  destination_url_snapshot text not null check (destination_url_snapshot ~ '^https://'),
  tracking_token_hash text not null unique check (char_length(tracking_token_hash) = 64),
  status public.run_status not null default 'queued',
  public_reply_status public.step_status not null default 'pending',
  dm_status public.step_status not null default 'pending',
  public_reply_id text,
  dm_message_id text,
  public_reply_attempts integer not null default 0,
  dm_attempts integer not null default 0,
  error_code text,
  error_message text,
  first_clicked_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(automation_id, commenter_scoped_id)
);
create index automation_runs_owner_created_idx on public.automation_runs(owner_id, created_at desc);
create index automation_runs_automation_created_idx on public.automation_runs(automation_id, created_at desc);

create table public.click_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.automation_runs(id) on delete cascade,
  kind text not null check (kind in ('first','repeat')),
  user_agent text check (char_length(user_agent) <= 240),
  clicked_at timestamptz not null default now()
);
create index click_events_run_idx on public.click_events(run_id, clicked_at desc);

create or replace function public.set_updated_at_and_version()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_table_name = 'automations' and row(new.*) is distinct from row(old.*) then
    new.version := old.version + 1;
  end if;
  return new;
end;
$$;

create trigger instagram_connections_updated before update on public.instagram_connections
for each row execute function public.set_updated_at_and_version();
create trigger automations_updated before update on public.automations
for each row execute function public.set_updated_at_and_version();

alter table public.instagram_connections enable row level security;
alter table public.instagram_media enable row level security;
alter table public.automations enable row level security;
alter table public.comment_events enable row level security;
alter table public.automation_runs enable row level security;
alter table public.click_events enable row level security;

grant select, insert, update, delete on public.instagram_connections, public.instagram_media, public.automations, public.comment_events, public.automation_runs, public.click_events to authenticated;
revoke all on public.instagram_connections, public.instagram_media, public.automations, public.comment_events, public.automation_runs, public.click_events from anon;

create policy owner_all_connections on public.instagram_connections for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy owner_all_media on public.instagram_media for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy owner_all_automations on public.automations for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy owner_read_events on public.comment_events for select to authenticated
using ((select auth.uid()) = owner_id);
create policy owner_read_runs on public.automation_runs for select to authenticated
using ((select auth.uid()) = owner_id);
create policy owner_read_clicks on public.click_events for select to authenticated
using ((select auth.uid()) = owner_id);

select pgmq.create('instagram_events');

create or replace function public.ingest_comment_events(events jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  item jsonb;
  conn record;
  inserted_id uuid;
  accepted_count integer := 0;
  queued_count integer := 0;
begin
  if jsonb_typeof(events) <> 'array' or jsonb_array_length(events) > 100 then raise exception 'invalid events'; end if;
  for item in select * from jsonb_array_elements(events)
  loop
    select id, owner_id into conn from public.instagram_connections
    where instagram_user_id = item->>'instagramUserId' and status = 'connected';
    if conn.id is null then continue; end if;
    insert into public.comment_events (
      owner_id, connection_id, comment_id, media_external_id,
      commenter_scoped_id, commenter_username, comment_text, payload_minimal
    ) values (
      conn.owner_id, conn.id, item->>'commentId', item->>'mediaId',
      item->>'commenterScopedId', left(item->>'commenterUsername', 80),
      left(item->>'text', 2200), jsonb_build_object('mediaProductType', item->>'mediaProductType')
    )
    on conflict (connection_id, comment_id) do nothing returning id into inserted_id;
    accepted_count := accepted_count + 1;
    if inserted_id is not null then
      perform pgmq.send('instagram_events', jsonb_build_object('event_id', inserted_id));
      queued_count := queued_count + 1;
    end if;
    inserted_id := null;
  end loop;
  return jsonb_build_object('accepted', accepted_count, 'queued', queued_count);
end;
$$;

create or replace function public.claim_queue_batch(batch_size integer default 10)
returns table(msg_id bigint, event_id uuid)
language sql security definer set search_path = ''
as $$
  select message.msg_id, (message.message->>'event_id')::uuid
  from pgmq.read('instagram_events', 60, least(greatest(batch_size, 1), 25)) as message;
$$;

create or replace function public.complete_queue_message(queue_message_id bigint)
returns boolean language sql security definer set search_path = ''
as $$ select pgmq.archive('instagram_events', queue_message_id); $$;

create or replace function public.record_click(token_hash text, user_agent_value text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  found_run public.automation_runs%rowtype;
  click_kind text;
begin
  if token_hash !~ '^[0-9a-f]{64}$' then return null; end if;
  select * into found_run from public.automation_runs where tracking_token_hash = token_hash for update;
  if found_run.id is null then return null; end if;
  click_kind := case when found_run.first_clicked_at is null then 'first' else 'repeat' end;
  insert into public.click_events(owner_id, run_id, kind, user_agent)
  values (found_run.owner_id, found_run.id, click_kind, left(user_agent_value, 240));
  if click_kind = 'first' then update public.automation_runs set first_clicked_at = now() where id = found_run.id; end if;
  return found_run.destination_url_snapshot;
end;
$$;

create or replace function public.purge_expired_personal_data()
returns integer language plpgsql security definer set search_path = ''
as $$
declare removed integer;
begin
  delete from public.click_events where clicked_at < now() - interval '180 days';
  update public.automation_runs
    set commenter_scoped_id = 'redacted', commenter_username = 'redacted',
        comment_text = '[removido por retenção]', error_message = null
    where created_at < now() - interval '180 days' and commenter_scoped_id <> 'redacted';
  update public.comment_events
    set commenter_scoped_id = 'redacted', commenter_username = 'redacted',
        comment_text = '[removido por retenção]', payload_minimal = '{}'::jsonb
    where received_at < now() - interval '180 days' and commenter_scoped_id <> 'redacted';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.set_updated_at_and_version() from public, anon, authenticated;
revoke all on function public.ingest_comment_events(jsonb) from public, anon, authenticated;
revoke all on function public.claim_queue_batch(integer) from public, anon, authenticated;
revoke all on function public.complete_queue_message(bigint) from public, anon, authenticated;
revoke all on function public.record_click(text, text) from public, anon, authenticated;
revoke all on function public.purge_expired_personal_data() from public, anon, authenticated;
grant execute on function public.ingest_comment_events(jsonb), public.claim_queue_batch(integer),
  public.complete_queue_message(bigint), public.record_click(text, text), public.purge_expired_personal_data() to service_role;

create view public.automation_metrics with (security_invoker = true) as
select a.id as automation_id, a.owner_id,
  count(r.id) as eligible_recipients,
  count(r.id) filter (where r.dm_status = 'succeeded') as sent_dms,
  count(r.id) filter (where r.first_clicked_at is not null) as unique_clicks,
  count(r.id) filter (where r.status in ('failed','partial','ambiguous')) as failures,
  max(r.created_at) as last_run_at
from public.automations a
left join public.automation_runs r on r.automation_id = a.id
group by a.id, a.owner_id;
grant select on public.automation_metrics to authenticated;
revoke all on public.automation_metrics from anon;
