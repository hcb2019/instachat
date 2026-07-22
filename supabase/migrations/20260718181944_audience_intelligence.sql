create type public.comment_source as enum ('webhook','backfill');
create type public.comment_analysis_status as enum ('pending','queued','analyzed','failed','skipped');
create type public.audience_category as enum ('purchase_intent','question','objection','content_request','support','praise','irrelevant');
create type public.audience_sentiment as enum ('positive','neutral','negative');
create type public.audience_analysis_status as enum ('queued','running','succeeded','failed','skipped');
create type public.audience_insight_status as enum ('new','reviewed','converted','dismissed');

alter table public.comment_events
  add column source public.comment_source not null default 'webhook',
  add column published_at timestamptz not null default now(),
  add column analysis_status public.comment_analysis_status not null default 'pending';

update public.comment_events set published_at = received_at where source = 'webhook';

create index comment_events_analysis_idx
  on public.comment_events(owner_id, analysis_status, published_at desc);

create table public.media_insight_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  media_id uuid not null references public.instagram_media(id) on delete cascade,
  captured_on date not null default current_date,
  comments integer not null default 0 check (comments >= 0),
  views bigint not null default 0 check (views >= 0),
  reach bigint not null default 0 check (reach >= 0),
  shares bigint not null default 0 check (shares >= 0),
  saved bigint not null default 0 check (saved >= 0),
  total_interactions bigint not null default 0 check (total_interactions >= 0),
  raw_metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(media_id, captured_on)
);

create table public.audience_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  media_id uuid references public.instagram_media(id) on delete set null,
  status public.audience_analysis_status not null default 'queued',
  period_days integer not null check (period_days in (7,30,90)),
  model text not null check (char_length(model) between 1 and 100),
  prompt_version text not null check (char_length(prompt_version) between 1 and 40),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  comment_count integer not null default 0 check (comment_count between 0 and 2000),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  duration_ms integer check (duration_ms >= 0),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  unique(owner_id, fingerprint)
);

create table public.comment_classifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  analysis_run_id uuid not null references public.audience_analysis_runs(id) on delete cascade,
  comment_event_id uuid not null references public.comment_events(id) on delete cascade,
  category public.audience_category not null,
  sentiment public.audience_sentiment not null,
  urgency smallint not null check (urgency between 1 and 5),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  theme text not null check (char_length(theme) between 1 and 100),
  opportunity text not null default '' check (char_length(opportunity) <= 500),
  created_at timestamptz not null default now(),
  unique(analysis_run_id, comment_event_id)
);

create table public.audience_insights (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  analysis_run_id uuid not null references public.audience_analysis_runs(id) on delete cascade,
  category public.audience_category not null,
  title text not null check (char_length(title) between 1 and 120),
  summary text not null check (char_length(summary) between 1 and 600),
  recommendation text not null check (char_length(recommendation) between 1 and 700),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  priority smallint not null check (priority between 1 and 100),
  evidence_ids uuid[] not null default '{}',
  media_ids uuid[] not null default '{}',
  content_suggestion jsonb,
  status public.audience_insight_status not null default 'new',
  feedback text check (feedback in ('useful','not_useful')),
  created_automation_id uuid references public.automations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(evidence_ids) between 0 and 5)
);

create index media_insight_snapshots_owner_date_idx on public.media_insight_snapshots(owner_id, captured_on desc);
create index audience_analysis_runs_owner_created_idx on public.audience_analysis_runs(owner_id, created_at desc);
create index comment_classifications_owner_category_idx on public.comment_classifications(owner_id, category, created_at desc);
create index audience_insights_owner_status_idx on public.audience_insights(owner_id, status, priority desc, created_at desc);

create trigger audience_insights_updated before update on public.audience_insights
for each row execute function public.set_updated_at_and_version();

alter table public.media_insight_snapshots enable row level security;
alter table public.audience_analysis_runs enable row level security;
alter table public.comment_classifications enable row level security;
alter table public.audience_insights enable row level security;

grant select on public.media_insight_snapshots, public.audience_analysis_runs, public.comment_classifications, public.audience_insights to authenticated;
grant update(status, feedback, created_automation_id) on public.audience_insights to authenticated;
revoke all on public.media_insight_snapshots, public.audience_analysis_runs, public.comment_classifications, public.audience_insights from anon;

create policy owner_read_media_insights on public.media_insight_snapshots for select to authenticated
using ((select auth.uid()) = owner_id);
create policy owner_read_audience_runs on public.audience_analysis_runs for select to authenticated
using ((select auth.uid()) = owner_id);
create policy owner_read_comment_classifications on public.comment_classifications for select to authenticated
using ((select auth.uid()) = owner_id);
create policy owner_read_audience_insights on public.audience_insights for select to authenticated
using ((select auth.uid()) = owner_id);
create policy owner_update_audience_insights on public.audience_insights for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

select pgmq.create('audience_analysis');

create or replace function public.enqueue_audience_analysis(run_id uuid)
returns bigint language sql security definer set search_path = ''
as $$ select pgmq.send('audience_analysis', jsonb_build_object('run_id', run_id)); $$;

create or replace function public.claim_audience_analysis_batch(batch_size integer default 2)
returns table(msg_id bigint, run_id uuid)
language sql security definer set search_path = ''
as $$
  select message.msg_id, (message.message->>'run_id')::uuid
  from pgmq.read('audience_analysis', 300, least(greatest(batch_size, 1), 5)) as message;
$$;

create or replace function public.complete_audience_analysis_message(queue_message_id bigint)
returns boolean language sql security definer set search_path = ''
as $$ select pgmq.archive('audience_analysis', queue_message_id); $$;

revoke all on function public.claim_audience_analysis_batch(integer) from public, anon, authenticated;
revoke all on function public.complete_audience_analysis_message(bigint) from public, anon, authenticated;
revoke all on function public.enqueue_audience_analysis(uuid) from public, anon, authenticated;
grant execute on function public.enqueue_audience_analysis(uuid), public.claim_audience_analysis_batch(integer), public.complete_audience_analysis_message(bigint) to service_role;

create or replace function public.purge_expired_personal_data()
returns integer language plpgsql security definer set search_path = ''
as $$
declare removed integer;
begin
  delete from public.click_events where clicked_at < now() - interval '180 days';
  update public.audience_insights
    set evidence_ids = '{}'
    where created_at < now() - interval '180 days' and cardinality(evidence_ids) > 0;
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

revoke all on function public.purge_expired_personal_data() from public, anon, authenticated;
grant execute on function public.purge_expired_personal_data() to service_role;
