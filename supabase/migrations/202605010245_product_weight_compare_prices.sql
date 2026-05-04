alter table public.products
add column if not exists weight_compare_prices jsonb not null default '{}'::jsonb;

update public.products
set weight_compare_prices = coalesce(weight_compare_prices, '{}'::jsonb);
