create or replace function public.confirm_backoffice_auth_user()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  update auth.users
  set
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
  where id = new.user_id
    and email_confirmed_at is null;

  return new;
end;
$$;

drop trigger if exists confirm_backoffice_auth_user_on_insert on public.admin_users;

create trigger confirm_backoffice_auth_user_on_insert
after insert on public.admin_users
for each row
execute function public.confirm_backoffice_auth_user();

update auth.users as auth_user
set
  email_confirmed_at = coalesce(auth_user.email_confirmed_at, now()),
  updated_at = now()
where auth_user.email_confirmed_at is null
  and exists (
    select 1
    from public.admin_users as admin_user
    where admin_user.user_id = auth_user.id
  );
