alter table public.products
add column if not exists translations jsonb not null default '{}'::jsonb;
