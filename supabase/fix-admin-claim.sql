create or replace function public.claim_admin_access()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_auth_user auth.users%rowtype;
begin
  select *
  into current_auth_user
  from auth.users
  where id = auth.uid()
  limit 1;

  if current_auth_user.id is null then
    raise exception 'No authenticated user found';
  end if;

  delete from public.admin_users
  where lower(email) = lower(current_auth_user.email)
    and user_id <> current_auth_user.id;

  insert into public.admin_users (user_id, email, role)
  values (current_auth_user.id, current_auth_user.email, 'admin')
  on conflict (user_id) do update
  set
    email = excluded.email,
    role = coalesce(public.admin_users.role, 'admin');
end;
$$;

grant execute on function public.claim_admin_access() to authenticated;
