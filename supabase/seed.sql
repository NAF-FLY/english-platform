-- Deterministic local development fixtures for the Supabase platform milestone.
-- Password for every seeded auth user: DevOnlyPass123!

with seeded_users as (
  select
    '11111111-1111-4111-8111-111111111111'::uuid as user_id,
    'aaaaaaaa-1111-4111-8111-111111111111'::uuid as identity_id,
    'learner@english-platform.test'::text as email,
    'polyglot-learner'::text as username,
    'Polyglot Learner'::text as display_name,
    'learner'::public.platform_role as primary_role,
    null::uuid as granted_by
  union all
  select
    '22222222-2222-4222-8222-222222222222'::uuid,
    'bbbbbbbb-2222-4222-8222-222222222222'::uuid,
    'staff@english-platform.test',
    'polyglot-staff',
    'Polyglot Staff',
    'staff'::public.platform_role,
    '33333333-3333-4333-8333-333333333333'::uuid
  union all
  select
    '33333333-3333-4333-8333-333333333333'::uuid,
    'cccccccc-3333-4333-8333-333333333333'::uuid,
    'admin@english-platform.test',
    'polyglot-admin',
    'Platform Admin',
    'admin'::public.platform_role,
    '33333333-3333-4333-8333-333333333333'::uuid
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  is_sso_user,
  is_anonymous
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  seeded_users.user_id,
  'authenticated',
  'authenticated',
  seeded_users.email,
  '$2a$06$v2GJyqslmzpDYh7GspJmH.njIOxbJe51cKfO5yTpDiaHtfgmal.PO',
  timezone('utc', now()),
  jsonb_build_object(
    'provider', 'email',
    'providers', jsonb_build_array('email')
  ),
  jsonb_build_object(
    'display_name', seeded_users.display_name,
    'email_verified', true
  ),
  timezone('utc', now()),
  timezone('utc', now()),
  '',
  '',
  '',
  '',
  '',
  0,
  '',
  false,
  false
from seeded_users
on conflict (id) do update
set
  instance_id = excluded.instance_id,
  aud = excluded.aud,
  role = excluded.role,
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at,
  confirmation_token = excluded.confirmation_token,
  email_change = excluded.email_change,
  email_change_token_new = excluded.email_change_token_new,
  recovery_token = excluded.recovery_token,
  email_change_token_current = excluded.email_change_token_current,
  email_change_confirm_status = excluded.email_change_confirm_status,
  reauthentication_token = excluded.reauthentication_token,
  is_sso_user = excluded.is_sso_user,
  is_anonymous = excluded.is_anonymous;

with seeded_users as (
  select
    '11111111-1111-4111-8111-111111111111'::uuid as user_id,
    'aaaaaaaa-1111-4111-8111-111111111111'::uuid as identity_id,
    'learner@english-platform.test'::text as email,
    'Polyglot Learner'::text as display_name
  union all
  select
    '22222222-2222-4222-8222-222222222222'::uuid,
    'bbbbbbbb-2222-4222-8222-222222222222'::uuid,
    'staff@english-platform.test',
    'Polyglot Staff'
  union all
  select
    '33333333-3333-4333-8333-333333333333'::uuid,
    'cccccccc-3333-4333-8333-333333333333'::uuid,
    'admin@english-platform.test',
    'Platform Admin'
)
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  seeded_users.identity_id,
  seeded_users.user_id,
  jsonb_build_object(
    'sub', seeded_users.user_id::text,
    'email', seeded_users.email,
    'email_verified', true,
    'phone_verified', false,
    'display_name', seeded_users.display_name
  ),
  'email',
  seeded_users.user_id::text,
  timezone('utc', now()),
  timezone('utc', now()),
  timezone('utc', now())
from seeded_users
on conflict (provider_id, provider) do update
set
  id = excluded.id,
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = excluded.updated_at;

with seeded_profiles as (
  select
    '11111111-1111-4111-8111-111111111111'::uuid as user_id,
    'polyglot-learner'::text as username,
    'Polyglot Learner'::text as display_name
  union all
  select
    '22222222-2222-4222-8222-222222222222'::uuid,
    'polyglot-staff',
    'Polyglot Staff'
  union all
  select
    '33333333-3333-4333-8333-333333333333'::uuid,
    'polyglot-admin',
    'Platform Admin'
)
insert into public.profiles (
  id,
  username,
  display_name
)
select
  seeded_profiles.user_id,
  seeded_profiles.username,
  seeded_profiles.display_name
from seeded_profiles
on conflict (id) do update
set
  username = excluded.username,
  display_name = excluded.display_name,
  avatar_url = null;

insert into public.user_role_memberships (
  user_id,
  role
)
values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'learner'::public.platform_role),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'learner'::public.platform_role),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'learner'::public.platform_role)
on conflict (user_id, role) do nothing;

insert into public.user_role_memberships (
  user_id,
  role,
  granted_by
)
values
  (
    '22222222-2222-4222-8222-222222222222'::uuid,
    'staff'::public.platform_role,
    '33333333-3333-4333-8333-333333333333'::uuid
  ),
  (
    '33333333-3333-4333-8333-333333333333'::uuid,
    'admin'::public.platform_role,
    '33333333-3333-4333-8333-333333333333'::uuid
  )
on conflict (user_id, role) do update
set granted_by = excluded.granted_by;
