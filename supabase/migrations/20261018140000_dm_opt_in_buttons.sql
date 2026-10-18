alter table public.automations
  add column dm_conversation_flow jsonb not null default '{"steps":[]}'::jsonb
    check (jsonb_typeof(dm_conversation_flow) = 'object'),
  add column append_utm_to_buttons boolean not null default true;

alter table public.automation_runs
  add column dm_conversation_flow_snapshot jsonb not null default '{"steps":[]}'::jsonb
    check (jsonb_typeof(dm_conversation_flow_snapshot) = 'object'),
  add column append_utm_to_buttons_snapshot boolean not null default true,
  add column conversation_status text not null default 'not_required'
    check (conversation_status in ('not_required', 'awaiting_reply', 'completed', 'failed')),
  add column conversation_current_step_id text,
  add column conversation_answers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(conversation_answers) = 'array');

alter table public.automations
  drop constraint if exists automations_check;

alter table public.automations
  add constraint automations_required_active_fields_check
  check (
    status <> 'active'
    or (
      media_id is not null
      and name <> ''
      and keyword_normalized <> ''
      and public_reply <> ''
      and dm_message <> ''
      and (
        destination_url ~ '^https://'
        or jsonb_array_length(coalesce(dm_conversation_flow->'steps', '[]'::jsonb)) > 0
      )
    )
  );

alter table public.automation_runs
  drop constraint if exists automation_runs_destination_url_snapshot_check;

alter table public.automation_runs
  add constraint automation_runs_destination_url_snapshot_check
  check (destination_url_snapshot = '' or destination_url_snapshot ~ '^https://');

create index automation_runs_pending_conversation_idx
  on public.automation_runs(owner_id, dm_recipient_id, created_at desc)
  where conversation_status = 'awaiting_reply';
