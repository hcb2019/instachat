alter table public.automations
  add column require_follow boolean not null default false,
  add column follow_gate_message text not null
    default 'Se você já me segue, digite PRONTO. Se não, me segue e depois volta aqui e digita PRONTO.'
    check (char_length(follow_gate_message) <= 900),
  add column not_following_message text not null
    default 'Poxa… você quer o conteúdo e ainda não me segue? 😅 Me segue primeiro e depois digita PRONTO aqui de novo.'
    check (char_length(not_following_message) <= 900);

alter table public.automations
  add constraint automations_follow_gate_messages_check
  check (
    status <> 'active'
    or not require_follow
    or (follow_gate_message <> '' and not_following_message <> '')
  );

alter table public.automation_runs
  add column require_follow_snapshot boolean not null default false,
  add column follow_gate_message_snapshot text not null default '',
  add column not_following_message_snapshot text not null default '',
  add column follow_status text not null default 'not_required'
    check (follow_status in ('not_required', 'awaiting_reply', 'not_following', 'verified', 'failed')),
  add column dm_recipient_id text,
  add column dm_delivery_message_id text,
  add column follow_checked_at timestamptz,
  add column content_delivered_at timestamptz;

update public.automation_runs
set content_delivered_at = coalesce(completed_at, created_at)
where dm_status = 'succeeded';

create index automation_runs_pending_follow_idx
  on public.automation_runs(owner_id, dm_recipient_id, created_at desc)
  where require_follow_snapshot and follow_status in ('awaiting_reply', 'not_following');

create table public.instagram_message_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.instagram_connections(id) on delete cascade,
  message_id text not null,
  sender_scoped_id text not null,
  message_text text not null default '' check (char_length(message_text) <= 1000),
  outcome text not null default 'received'
    check (outcome in ('received', 'no_pending_gate', 'not_following', 'content_delivered', 'failed')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(connection_id, message_id)
);

create index instagram_message_events_owner_received_idx
  on public.instagram_message_events(owner_id, received_at desc);

alter table public.instagram_message_events enable row level security;
grant select on public.instagram_message_events to authenticated;
grant select, insert, update, delete on public.instagram_message_events to service_role;
revoke all on public.instagram_message_events from anon;

create policy owner_read_message_events
  on public.instagram_message_events for select to authenticated
  using ((select auth.uid()) = owner_id);

create or replace view public.automation_metrics with (security_invoker = true) as
select a.id as automation_id, a.owner_id,
  count(r.id) as eligible_recipients,
  count(r.id) filter (where r.content_delivered_at is not null) as sent_dms,
  count(r.id) filter (where r.first_clicked_at is not null) as unique_clicks,
  count(r.id) filter (where r.status in ('failed','partial','ambiguous')) as failures,
  max(r.created_at) as last_run_at
from public.automations a
left join public.automation_runs r on r.automation_id = a.id
group by a.id, a.owner_id;

grant select on public.automation_metrics to authenticated;
revoke all on public.automation_metrics from anon;

create or replace function public.purge_expired_personal_data()
returns integer language plpgsql security definer set search_path = ''
as $$
declare removed integer;
begin
  delete from public.click_events where clicked_at < now() - interval '180 days';
  delete from public.instagram_message_events where received_at < now() - interval '180 days';
  update public.automation_runs
    set commenter_scoped_id = 'redacted', commenter_username = 'redacted',
        comment_text = '[removido por retenção]', error_message = null,
        dm_recipient_id = null
    where created_at < now() - interval '180 days' and commenter_scoped_id <> 'redacted';
  update public.comment_events
    set commenter_scoped_id = 'redacted', commenter_username = 'redacted',
        comment_text = '[removido por retenção]', payload_minimal = '{}'::jsonb
    where received_at < now() - interval '180 days' and commenter_scoped_id <> 'redacted';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_expired_personal_data() from public, anon, authenticated;
grant execute on function public.purge_expired_personal_data() to service_role;

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
    select id, owner_id into conn
    from public.instagram_connections
    where instagram_user_id = item->>'instagramUserId' and status = 'connected';

    -- Legacy Meta apps can deliver an entry.id that differs from the current
    -- Instagram Login account ID. The media ID is global and already belongs
    -- to a synchronized Reel, so it is a safer fallback without crossing owners.
    if conn.id is null then
      select connection.id, connection.owner_id into conn
      from public.instagram_media media
      join public.instagram_connections connection on connection.id = media.connection_id
      where media.external_id = item->>'mediaId'
        and connection.status = 'connected'
      limit 1;
    end if;

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
    conn := null;
  end loop;
  return jsonb_build_object('accepted', accepted_count, 'queued', queued_count);
end;
$$;

revoke all on function public.ingest_comment_events(jsonb) from public, anon, authenticated;
grant execute on function public.ingest_comment_events(jsonb) to service_role;
