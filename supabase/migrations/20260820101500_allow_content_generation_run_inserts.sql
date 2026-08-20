-- Persist the generated package and its public deliverable atomically.
create function public.save_content_package(
  p_project_id uuid,
  p_selected_concept_index smallint,
  p_content_package jsonb,
  p_deliverable_type public.content_deliverable_type,
  p_deliverable_title text,
  p_deliverable_summary text,
  p_deliverable_content jsonb,
  p_public_slug text,
  p_published_at timestamptz
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.content_projects as project
  set selected_concept_index = p_selected_concept_index,
      content_package = p_content_package,
      status = 'ready'
  where project.id = p_project_id
    and project.owner_id = (select auth.uid());

  if not found then
    raise exception 'Content project was not found for the authenticated owner';
  end if;

  insert into public.deliverables as deliverable (
    owner_id, project_id, type, title, summary, content, public_slug, status, published_at
  ) values (
    (select auth.uid()), p_project_id, p_deliverable_type, p_deliverable_title,
    p_deliverable_summary, p_deliverable_content, p_public_slug, 'published', p_published_at
  ) on conflict (project_id) do update set
    type = excluded.type,
    title = excluded.title,
    summary = excluded.summary,
    content = excluded.content,
    public_slug = excluded.public_slug,
    status = excluded.status,
    published_at = excluded.published_at;
end;
$$;

revoke execute on function public.save_content_package(uuid, smallint, jsonb, public.content_deliverable_type, text, text, jsonb, text, timestamptz) from public;
grant execute on function public.save_content_package(uuid, smallint, jsonb, public.content_deliverable_type, text, text, jsonb, text, timestamptz) to authenticated;

-- Allow an owner to create telemetry only for their own content project.
grant insert on public.content_generation_runs to authenticated;

create policy owner_insert_content_generation_runs on public.content_generation_runs for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.content_projects as project
    where project.id = project_id
      and project.owner_id = (select auth.uid())
  )
);
