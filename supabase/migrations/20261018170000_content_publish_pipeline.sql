create table public.content_pipeline_posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid references public.instagram_connections(id) on delete set null,
  automation_id uuid references public.automations(id) on delete set null,
  media_id uuid references public.instagram_media(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft','uploading','processing','published','automation_created','failed')),
  caption text not null default '' check (char_length(caption) <= 2200),
  hashtags text[] not null default '{}' check (cardinality(hashtags) <= 5),
  keyword text not null default '' check (char_length(keyword) <= 80),
  keyword_normalized text not null default '' check (char_length(keyword_normalized) <= 80),
  deliverable_type text not null
    check (deliverable_type in ('prompt','sistema','app','repositorio')),
  deliverable_url text not null check (deliverable_url ~ '^https://'),
  dm_conversation_flow jsonb not null default '{"steps":[]}'::jsonb
    check (jsonb_typeof(dm_conversation_flow) = 'object'),
  scheduled_at timestamptz,
  source text not null default 'ui' check (source in ('ui','api')),
  storage_bucket text,
  storage_path text,
  video_url text check (video_url is null or video_url ~ '^https://'),
  instagram_container_id text,
  instagram_media_id text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  automation_created_at timestamptz
);

create index content_pipeline_posts_owner_created_idx
  on public.content_pipeline_posts(owner_id, created_at desc);
create index content_pipeline_posts_due_idx
  on public.content_pipeline_posts(status, scheduled_at nulls first, updated_at)
  where status in ('draft','processing');

create table public.pipeline_api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  prefix text not null check (char_length(prefix) between 8 and 24),
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index pipeline_api_keys_owner_created_idx
  on public.pipeline_api_keys(owner_id, created_at desc);
create index pipeline_api_keys_active_hash_idx
  on public.pipeline_api_keys(key_hash)
  where revoked_at is null;

create trigger content_pipeline_posts_updated before update on public.content_pipeline_posts
for each row execute function public.set_updated_at_and_version();

alter table public.content_pipeline_posts enable row level security;
alter table public.pipeline_api_keys enable row level security;

grant select, insert, update, delete on public.content_pipeline_posts to authenticated;
grant select(id, owner_id, name, prefix, last_used_at, revoked_at, created_at), insert(owner_id, name, key_hash, prefix), update(revoked_at) on public.pipeline_api_keys to authenticated;
grant all on public.content_pipeline_posts, public.pipeline_api_keys to service_role;
revoke all on public.content_pipeline_posts, public.pipeline_api_keys from anon;

create policy owner_all_content_pipeline_posts on public.content_pipeline_posts
for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy owner_read_pipeline_api_keys on public.pipeline_api_keys
for select to authenticated
using ((select auth.uid()) = owner_id);

create policy owner_create_pipeline_api_keys on public.pipeline_api_keys
for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy owner_revoke_pipeline_api_keys on public.pipeline_api_keys
for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pipeline-videos', 'pipeline-videos', false, 104857600, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
