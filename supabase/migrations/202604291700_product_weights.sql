alter table public.products
add column if not exists weights text[] not null default '{500g,1kg}';

update public.products
set weights = case
  when coalesce(array_length(weights, 1), 0) > 0 then weights
  when coalesce(array_length(sizes, 1), 0) > 0 then sizes
  else array['500g', '1kg']::text[]
end;

alter table public.products
drop column if exists shoe_sizes;

alter table public.products
drop column if exists colors;

alter table public.products
drop column if exists sizes;
