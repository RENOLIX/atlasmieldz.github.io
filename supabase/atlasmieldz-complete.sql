create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  product_type text not null default 'product' check (product_type in ('product', 'pack')),
  name text not null,
  description text not null default '',
  price integer not null default 0,
  compare_price integer,
  category text not null default 'femme',
  images text[] not null default '{}',
  weight_prices jsonb not null default '{}'::jsonb,
  weight_compare_prices jsonb not null default '{}'::jsonb,
  weights text[] not null default '{}'::text[],
  stock integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null,
  items jsonb not null,
  subtotal integer not null,
  shipping integer not null default 0,
  total integer not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb not null,
  payment_method text not null default 'الدفع عند الاستلام',
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

grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

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

create or replace function public.promote_existing_user_to_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user auth.users%rowtype;
begin
  select *
  into target_user
  from auth.users
  where lower(email) = lower(target_email)
  limit 1;

  if target_user.id is null then
    raise exception 'No auth user found for email %', target_email;
  end if;

  insert into public.admin_users (user_id, email, role)
  values (target_user.id, target_user.email, 'admin')
  on conflict (user_id) do update
  set role = 'admin',
      email = excluded.email;

  update auth.users
  set
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
  where id = target_user.id;
end;
$$;

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

grant execute on function public.is_admin_user(uuid) to anon, authenticated, service_role;
grant execute on function public.is_backoffice_user(uuid) to anon, authenticated, service_role;
grant execute on function public.promote_existing_user_to_admin(text) to authenticated, service_role;
grant execute on function public.create_backoffice_user(text, text, text) to authenticated, service_role;

drop trigger if exists on_auth_user_created_bootstrap_admin on auth.users;
create trigger on_auth_user_created_bootstrap_admin
after insert on auth.users
for each row
execute function public.bootstrap_first_admin();

drop trigger if exists confirm_backoffice_auth_user_on_insert on public.admin_users;
create trigger confirm_backoffice_auth_user_on_insert
after insert on public.admin_users
for each row
execute function public.confirm_backoffice_auth_user();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products"
on public.products
for select
to anon, authenticated
using (active = true or public.is_admin_user());

drop policy if exists "admins can manage products" on public.products;
create policy "admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

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
using (public.is_backoffice_user());

drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders"
on public.orders
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admins can delete orders" on public.orders;
create policy "admins can delete orders"
on public.orders
for delete
to authenticated
using (public.is_admin_user());

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

insert into public.site_settings (key, value)
values
  ('meta_pixel', '{"enabled": false, "pixelId": ""}'::jsonb),
  ('order_trash', '{"items": []}'::jsonb)
on conflict (key) do update
set value = excluded.value,
    updated_at = timezone('utc', now());

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

insert into public.products (
  id, name, description, price, compare_price, category, images,
  weight_prices, weight_compare_prices, weights, stock, featured, active
)
values
(
  'miel-montagne',
  'عسل الجبال',
  'عسل طبيعي أصيل بطابع جبلي غني، يتميز بنكهة عميقة وقوام متوازن ومذاق فاخر مناسب للاستهلاك اليومي والضيافة.',
  1800, 2100, 'femme',
  array[
    'https://images.unsplash.com/photo-1545246909-b4e087f05214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ],
  '{"500غ": 1800, "1كغ": 3400}'::jsonb,
  '{"500غ": 2100, "1كغ": 3900}'::jsonb,
  array['500غ', '1كغ'],
  24, true, true
),
(
  'miel-sidr',
  'عسل السدر',
  'من أشهر أنواع العسل الفاخر، يتميز بطعمه القوي وقيمته العالية، مختار بعناية لعشاق الجودة والنكهة الأصيلة.',
  2500, 2900, 'femme',
  array[
    'https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1545246909-b4e087f05214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1761416351532-ede97c29fab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ],
  '{"500غ": 2500, "1كغ": 4700}'::jsonb,
  '{"500غ": 2900, "1كغ": 5400}'::jsonb,
  array['500غ', '1كغ'],
  18, true, true
),
(
  'miel-fleurs',
  'عسل الأزهار',
  'عسل زهري خفيف ولذيذ، مناسب لكل أفراد العائلة، يجمع بين الحلاوة الطبيعية والرائحة الهادئة.',
  1400, 1700, 'femme',
  array[
    'https://images.unsplash.com/photo-1740506569102-1bb75e5e1afe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ],
  '{"500غ": 1400, "1كغ": 2600}'::jsonb,
  '{"500غ": 1700, "1كغ": 3100}'::jsonb,
  array['500غ', '1كغ'],
  31, true, true
),
(
  'miel-romarin',
  'عسل إكليل الجبل',
  'عسل عطري بنفحات عشبية ناعمة، مثالي للشاي والاستخدام اليومي، مع جودة منتقاة بعناية.',
  2200, 2500, 'femme',
  array[
    'https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1545246909-b4e087f05214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1740506569102-1bb75e5e1afe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ],
  '{"500غ": 2200, "1كغ": 4200}'::jsonb,
  '{"500غ": 2500, "1كغ": 4800}'::jsonb,
  array['500غ', '1كغ'],
  16, false, true
),
(
  'miel-thym',
  'عسل الزعتر',
  'عسل قوي ومميز بنكهة متوسطية مركزة، لمحبي العسل العطري ذي الشخصية القوية.',
  2800, 3200, 'femme',
  array[
    'https://images.unsplash.com/photo-1761416351532-ede97c29fab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
  ],
  '{"500غ": 2800, "1كغ": 5200}'::jsonb,
  '{"500غ": 3200, "1كغ": 5900}'::jsonb,
  array['500غ', '1كغ'],
  12, false, true
)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  compare_price = excluded.compare_price,
  category = excluded.category,
  images = excluded.images,
  weight_prices = excluded.weight_prices,
  weight_compare_prices = excluded.weight_compare_prices,
  weights = excluded.weights,
  stock = excluded.stock,
  featured = excluded.featured,
  active = excluded.active,
  updated_at = timezone('utc', now());

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

-- after running this SQL:
-- 1) create your first auth user from Supabase Authentication > Users
-- 2) then run:
--    select public.promote_existing_user_to_admin('your@email.com');
