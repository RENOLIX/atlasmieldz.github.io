alter table public.admin_users
add column if not exists role text;

update public.admin_users
set role = 'admin'
where role is null;

alter table public.admin_users
alter column role set default 'admin';

alter table public.admin_users
alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_users_role_check'
  ) then
    alter table public.admin_users
    add constraint admin_users_role_check
    check (role in ('admin', 'employee'));
  end if;
end
$$;

create or replace function public.bootstrap_first_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users) then
    insert into public.admin_users (user_id, email, role)
    values (new.id, new.email, 'admin')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.is_admin_user(target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = target_user_id
      and role = 'admin'
  );
$$;

create or replace function public.is_backoffice_user(target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = target_user_id
      and role in ('admin', 'employee')
  );
$$;

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products"
on public.products
for select
to anon, authenticated
using (
  active = true
  or public.is_admin_user()
);

drop policy if exists "admins can manage products" on public.products;
create policy "admins can manage products"
on public.products
for all
to authenticated
using (
  public.is_admin_user()
)
with check (
  public.is_admin_user()
);

drop policy if exists "admins can read orders" on public.orders;
drop policy if exists "backoffice can read orders" on public.orders;
create policy "backoffice can read orders"
on public.orders
for select
to authenticated
using (
  public.is_backoffice_user()
);

drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders"
on public.orders
for update
to authenticated
using (
  public.is_admin_user()
)
with check (
  public.is_admin_user()
);

drop policy if exists "users can read own admin record" on public.admin_users;
create policy "users can read own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "admins can read all admin users" on public.admin_users;
create policy "admins can read all admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admins can insert admin users" on public.admin_users;
create policy "admins can insert admin users"
on public.admin_users
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admins can update admin users" on public.admin_users;
create policy "admins can update admin users"
on public.admin_users
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admins can delete admin users" on public.admin_users;
create policy "admins can delete admin users"
on public.admin_users
for delete
to authenticated
using (public.is_admin_user());
