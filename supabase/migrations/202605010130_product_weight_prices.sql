alter table public.products
add column if not exists weight_prices jsonb not null default '{}'::jsonb;

update public.products
set weight_prices = coalesce(weight_prices, '{}'::jsonb);
