create or replace function public.create_backoffice_user(
  target_email text,
  target_password text,
  target_role text default 'employee'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  clean_email text;
  clean_role text;
  new_user_id uuid;
  current_instance_id uuid;
begin
  clean_email := lower(trim(target_email));
  clean_role := lower(trim(target_role));

  if clean_email = '' then
    raise exception 'Email is required';
  end if;

  if trim(target_password) = '' then
    raise exception 'Password is required';
  end if;

  if clean_role not in ('admin', 'employee') then
    raise exception 'Unsupported admin role %', target_role;
  end if;

  if not public.is_admin_user(auth.uid()) then
    raise exception 'Only admins can create backoffice users';
  end if;

  if exists (
    select 1
    from auth.users
    where lower(email) = clean_email
  ) then
    raise exception 'User with email % already exists', clean_email;
  end if;

  select coalesce((select instance_id from auth.users limit 1), '00000000-0000-0000-0000-000000000000'::uuid)
  into current_instance_id;

  new_user_id := gen_random_uuid();

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
    updated_at
  )
  values (
    current_instance_id,
    new_user_id,
    'authenticated',
    'authenticated',
    clean_email,
    extensions.crypt(target_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    '{}'::jsonb,
    now(),
    now()
  );

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    new_user_id,
    clean_email,
    jsonb_build_object('sub', new_user_id::text, 'email', clean_email),
    'email',
    now(),
    now()
  );

  insert into public.admin_users (user_id, email, role)
  values (new_user_id, clean_email, clean_role::public.admin_role)
  on conflict (user_id) do update
  set
    email = excluded.email,
    role = excluded.role;

  return new_user_id;
end;
$$;

grant execute on function public.create_backoffice_user(text, text, text) to authenticated, service_role;
