alter table public.sales add column if not exists recorded_by uuid;

create or replace function public.accept_staff_invite(p_code text, p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;

  update public.staff_members
  set user_id = auth.uid(),
      active = true
  where invite_code = upper(p_code)
    and lower(email) = lower(p_email)
    and user_id is null
    and active = true
    and invite_revoked_at is null
    and (invite_expires_at is null or invite_expires_at > now())
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.accept_staff_invite(text, text) from public, anon;
grant execute on function public.accept_staff_invite(text, text) to authenticated;

drop policy if exists "members manage products" on public.products;
drop policy if exists "members read products" on public.products;
drop policy if exists "owners manage products" on public.products;

create policy "members read products"
  on public.products for select
  using (public.is_business_member(business_id));

create policy "owners manage products"
  on public.products for all
  using (exists (select 1 from public.businesses b where b.id = products.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = products.business_id and b.owner_id = auth.uid()));

drop policy if exists "members manage expenses" on public.expenses;
drop policy if exists "owners manage expenses" on public.expenses;
create policy "owners manage expenses"
  on public.expenses for all
  using (exists (select 1 from public.businesses b where b.id = expenses.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = expenses.business_id and b.owner_id = auth.uid()));
