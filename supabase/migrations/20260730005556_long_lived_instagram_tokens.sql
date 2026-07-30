alter table public.instagram_connections
  add column if not exists token_refreshed_at timestamptz;

comment on column public.instagram_connections.token_refreshed_at is
  'Última troca ou renovação automática do token de longa duração do Instagram.';
