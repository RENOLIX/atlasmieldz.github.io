update public.products
set category = 'femme'
where category is distinct from 'femme';

alter table public.products
alter column category set default 'femme';
