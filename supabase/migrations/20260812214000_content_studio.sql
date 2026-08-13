create type public.content_project_status as enum (
  'idea','producing','ready','awaiting_publication','awaiting_media','automation_draft','active','archived'
);
create type public.content_deliverable_type as enum ('prompt','checklist','guide','page');

create table public.creator_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  instagram_handle text not null default '@hernando.ia' check (instagram_handle ~ '^@[A-Za-z0-9._]{1,30}$'),
  niche text not null default 'Inteligência artificial aplicada a negócios e à vida cotidiana' check (char_length(niche) between 3 and 180),
  audience text not null default 'Pequenos empresários, profissionais autônomos e criadores que querem começar a usar IA' check (char_length(audience) between 3 and 300),
  voice text not null default 'Direto, conversado, informal e específico' check (char_length(voice) between 3 and 300),
  preferred_terms text[] not null default '{}',
  avoided_terms text[] not null default '{}',
  default_cta text not null default 'Comente a palavra-chave para receber o material no direct.' check (char_length(default_cta) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_insight_id uuid references public.audience_insights(id) on delete set null,
  format text not null default 'static_hook_10s' check (format = 'static_hook_10s'),
  title text not null check (char_length(title) between 2 and 120),
  topic text not null check (char_length(topic) between 3 and 500),
  pillar text not null check (pillar in ('ai_business','automation_productivity','content_sales')),
  primary_goal text not null check (primary_goal in ('leads','followers','saves','shares','education','offer')),
  secondary_goal text check (secondary_goal is null or secondary_goal in ('leads','followers','saves','shares','education','offer')),
  hook_intensity text not null check (hook_intensity in ('safe','provocative','strong')),
  deliverable_type public.content_deliverable_type not null,
  notes text not null default '' check (char_length(notes) <= 1500),
  status public.content_project_status not null default 'idea',
  concepts jsonb not null default '[]'::jsonb,
  selected_concept_index smallint check (selected_concept_index between 0 and 2),
  content_package jsonb,
  generation_seed integer not null default 0,
  media_id uuid references public.instagram_media(id) on delete set null,
  automation_id uuid references public.automations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null unique references public.content_projects(id) on delete cascade,
  type public.content_deliverable_type not null,
  title text not null check (char_length(title) between 2 and 140),
  summary text not null check (char_length(summary) between 1 and 500),
  content jsonb not null,
  public_slug text not null unique check (public_slug ~ '^[a-z0-9]{32}$'),
  status text not null default 'published' check (status in ('draft','published','archived')),
  view_count integer not null default 0 check (view_count >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_generation_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.content_projects(id) on delete cascade,
  stage text not null check (stage in ('concepts','package')),
  model text not null check (char_length(model) between 1 and 100),
  prompt_version text not null check (char_length(prompt_version) between 1 and 60),
  status text not null check (status in ('succeeded','failed')),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.automations add column content_project_id uuid references public.content_projects(id) on delete set null;
alter table public.audience_insights add column content_project_id uuid references public.content_projects(id) on delete set null;

create index content_projects_owner_status_idx on public.content_projects(owner_id, status, updated_at desc);
create index content_generation_runs_project_idx on public.content_generation_runs(project_id, created_at desc);
create index automations_content_project_idx on public.automations(content_project_id) where content_project_id is not null;

create trigger creator_profiles_updated before update on public.creator_profiles
for each row execute function public.set_updated_at_and_version();
create trigger content_projects_updated before update on public.content_projects
for each row execute function public.set_updated_at_and_version();
create trigger deliverables_updated before update on public.deliverables
for each row execute function public.set_updated_at_and_version();

alter table public.creator_profiles enable row level security;
alter table public.content_projects enable row level security;
alter table public.deliverables enable row level security;
alter table public.content_generation_runs enable row level security;

grant select, insert, update, delete on public.creator_profiles, public.content_projects, public.deliverables to authenticated;
grant select on public.content_generation_runs to authenticated;
revoke all on public.creator_profiles, public.content_projects, public.deliverables, public.content_generation_runs from anon;

create policy owner_all_creator_profiles on public.creator_profiles for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy owner_all_content_projects on public.content_projects for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy owner_all_deliverables on public.deliverables for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy owner_read_content_generation_runs on public.content_generation_runs for select to authenticated
using ((select auth.uid()) = owner_id);

create or replace function public.get_public_deliverable(slug_value text)
returns table(id uuid, type public.content_deliverable_type, title text, summary text, content jsonb, published_at timestamptz)
language sql security definer set search_path = ''
as $$
  update public.deliverables as d set view_count = d.view_count + 1
  where d.public_slug = slug_value and d.status = 'published'
  returning d.id, d.type, d.title, d.summary, d.content, d.published_at;
$$;

revoke all on function public.get_public_deliverable(text) from public;
grant execute on function public.get_public_deliverable(text) to anon, authenticated, service_role;
