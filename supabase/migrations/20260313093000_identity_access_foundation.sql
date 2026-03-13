create table if not exists public.profiles (
  id uuid primary key
    references auth.users (id) on delete cascade,
  username extensions.citext unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_display_name_length_check
    check (char_length(btrim(display_name)) between 2 and 80),
  constraint profiles_username_format_check
    check (
      username is null
      or username::text ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'
    ),
  constraint profiles_username_length_check
    check (
      username is null
      or char_length(username::text) between 3 and 32
    )
);

create table if not exists public.user_role_memberships (
  user_id uuid not null
    references auth.users (id) on delete cascade,
  role public.platform_role not null default 'learner',
  granted_by uuid
    references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role)
);

create index if not exists user_role_memberships_granted_by_idx
  on public.user_role_memberships (granted_by);

create index if not exists user_role_memberships_role_idx
  on public.user_role_memberships (role);

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  derived_display_name text;
begin
  derived_display_name := left(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, new.phone, ''), '@', 1), ''),
      'Learner'
    ),
    80
  );

  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    derived_display_name
  )
  on conflict (id) do nothing;

  insert into public.user_role_memberships (
    user_id,
    role
  )
  values (
    new.id,
    'learner'
  )
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

insert into public.profiles (
  id,
  display_name
)
select
  users.id,
  left(
    coalesce(
      nullif(btrim(users.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(users.email, users.phone, ''), '@', 1), ''),
      'Learner'
    ),
    80
  ) as display_name
from auth.users as users
on conflict (id) do nothing;

insert into public.user_role_memberships (
  user_id,
  role
)
select
  users.id,
  'learner'::public.platform_role
from auth.users as users
on conflict (user_id, role) do nothing;
