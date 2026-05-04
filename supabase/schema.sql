create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  price integer not null,
  compare_price integer,
  category text not null check (category in ('nouveautes', 'femme', 'homme', 'accessoires')),
  images text[] not null default '{}',
  weight_prices jsonb not null default '{}'::jsonb,
  weight_compare_prices jsonb not null default '{}'::jsonb,
  weights text[] not null default '{500g,1kg}',
  stock integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.products
add column if not exists weights text[] not null default '{500g,1kg}';

alter table public.products
add column if not exists weight_prices jsonb not null default '{}'::jsonb;

update public.products
set weight_prices = coalesce(weight_prices, '{}'::jsonb);

alter table public.products
add column if not exists weight_compare_prices jsonb not null default '{}'::jsonb;

update public.products
set weight_compare_prices = coalesce(weight_compare_prices, '{}'::jsonb);

alter table public.products
drop column if exists shoe_sizes;

alter table public.products
drop column if exists colors;

alter table public.products
drop column if exists sizes;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  items jsonb not null,
  subtotal integer not null,
  shipping integer not null default 0,
  total integer not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb not null,
  payment_method text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'employee')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

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

drop trigger if exists on_auth_user_created_bootstrap_admin on auth.users;
create trigger on_auth_user_created_bootstrap_admin
after insert on auth.users
for each row
execute function public.bootstrap_first_admin();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;

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

drop policy if exists "public can create orders" on public.orders;
create policy "public can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

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

drop policy if exists "admins can delete orders" on public.orders;
create policy "admins can delete orders"
on public.orders
for delete
to authenticated
using (
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

drop policy if exists "public can read site settings" on public.site_settings;
create policy "public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "admins can manage site settings" on public.site_settings;
create policy "admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end
$$;
