create or replace function public.is_service_role()
returns boolean
language sql
stable
set search_path = ''
as $$
  select auth.role() = 'service_role';
$$;

create or replace function public.current_user_has_role(check_role public.platform_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_role_memberships as memberships
    where memberships.user_id = auth.uid()
      and memberships.role = check_role
  );
$$;

create or replace function public.current_user_has_any_role(check_roles public.platform_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_role_memberships as memberships
    where memberships.user_id = auth.uid()
      and memberships.role = any(check_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_role_memberships enable row level security;

drop policy if exists profiles_select_self_or_internal on public.profiles;
create policy profiles_select_self_or_internal
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (
    select public.current_user_has_any_role(
      array['staff', 'admin']::public.platform_role[]
    )
  )
);

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or (select public.current_user_has_role('admin'::public.platform_role))
)
with check (
  id = (select auth.uid())
  or (select public.current_user_has_role('admin'::public.platform_role))
);

drop policy if exists profiles_insert_service_role_only on public.profiles;
create policy profiles_insert_service_role_only
on public.profiles
for insert
to public
with check (public.is_service_role());

drop policy if exists profiles_delete_service_role_only on public.profiles;
create policy profiles_delete_service_role_only
on public.profiles
for delete
to public
using (public.is_service_role());

drop policy if exists user_role_memberships_select_self_or_internal on public.user_role_memberships;
create policy user_role_memberships_select_self_or_internal
on public.user_role_memberships
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (
    select public.current_user_has_any_role(
      array['staff', 'admin']::public.platform_role[]
    )
  )
);

drop policy if exists user_role_memberships_insert_service_role_only on public.user_role_memberships;
create policy user_role_memberships_insert_service_role_only
on public.user_role_memberships
for insert
to public
with check (public.is_service_role());

drop policy if exists user_role_memberships_update_service_role_only on public.user_role_memberships;
create policy user_role_memberships_update_service_role_only
on public.user_role_memberships
for update
to public
using (public.is_service_role())
with check (public.is_service_role());

drop policy if exists user_role_memberships_delete_service_role_only on public.user_role_memberships;
create policy user_role_memberships_delete_service_role_only
on public.user_role_memberships
for delete
to public
using (public.is_service_role());
