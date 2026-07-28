alter table public.automations
  add column keyword_variants text[] not null default '{}'::text[];

alter table public.automations
  add constraint automations_keyword_variants_count_check
  check (cardinality(keyword_variants) between 0 and 12);
