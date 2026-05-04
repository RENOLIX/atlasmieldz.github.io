create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_settings enable row level security;

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
