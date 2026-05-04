drop policy if exists "admins can delete orders" on public.orders;
create policy "admins can delete orders"
on public.orders
for delete
to authenticated
using (
  public.is_admin_user()
);
