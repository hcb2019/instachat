alter table public.automations
  add column public_reply_variants text[] not null default array['']::text[];

update public.automations
set public_reply_variants = array[public_reply]
where cardinality(public_reply_variants) = 1
  and public_reply_variants[1] = '';

alter table public.automations
  add constraint automations_public_reply_variants_count_check
  check (cardinality(public_reply_variants) between 1 and 5);

alter table public.automations
  add column dm_message_variants text[] not null default array['']::text[];

update public.automations
set dm_message_variants = array[dm_message]
where cardinality(dm_message_variants) = 1
  and dm_message_variants[1] = '';

alter table public.automations
  add constraint automations_dm_message_variants_count_check
  check (cardinality(dm_message_variants) between 1 and 5);
