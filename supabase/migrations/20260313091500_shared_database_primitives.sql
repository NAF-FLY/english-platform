create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'platform_role'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.platform_role as enum ('learner', 'staff', 'admin');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
