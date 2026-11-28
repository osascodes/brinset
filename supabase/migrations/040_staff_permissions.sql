-- Sales staff can work in the shop, but cannot delete financial records or manage staff.

drop policy if exists "members manage debts" on public.debts;
drop policy if exists "members read debts" on public.debts;
drop policy if exists "members update debts" on public.debts;
drop policy if exists "owners delete debts" on public.debts;

create policy "members read debts"
  on public.debts for select
  using (public.is_business_member(business_id));

create policy "owners update debts"
  on public.debts for update
  using (exists (
    select 1 from public.businesses b
    where b.id = debts.business_id and b.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.businesses b
    where b.id = debts.business_id and b.owner_id = auth.uid()
  ));

create policy "owners delete debts"
  on public.debts for delete
  using (exists (
    select 1 from public.businesses b
    where b.id = debts.business_id and b.owner_id = auth.uid()
  ));

drop policy if exists "members manage staff" on public.staff_members;
drop policy if exists "owners manage staff" on public.staff_members;
drop policy if exists "staff read own membership" on public.staff_members;

create policy "owners manage staff"
  on public.staff_members for all
  using (exists (
    select 1 from public.businesses b
    where b.id = staff_members.business_id and b.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.businesses b
    where b.id = staff_members.business_id and b.owner_id = auth.uid()
  ));

create policy "staff read own membership"
  on public.staff_members for select
  using (user_id = auth.uid());


drop policy if exists "members manage debt payments" on public.debt_payments;
drop policy if exists "members read debt payments" on public.debt_payments;
drop policy if exists "members insert debt payments" on public.debt_payments;
drop policy if exists "owners manage debt payments" on public.debt_payments;

create policy "members read debt payments"
  on public.debt_payments for select
  using (public.is_business_member(business_id));

create policy "owners manage debt payments"
  on public.debt_payments for all
  using (exists (
    select 1 from public.businesses b
    where b.id = debt_payments.business_id and b.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.businesses b
    where b.id = debt_payments.business_id and b.owner_id = auth.uid()
  ));

create or replace function public.record_debt_payment(p_debt_id uuid, p_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_debt public.debts%rowtype;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment must be greater than 0';
  end if;
  select * into v_debt from public.debts where id = p_debt_id for update;
  if v_debt.id is null then
    raise exception 'Debt not found';
  end if;
  if not public.is_business_member(v_debt.business_id) then
    raise exception 'Not allowed';
  end if;
  if v_debt.status = 'voided' then
    raise exception 'This debt is voided';
  end if;

  insert into public.debt_payments (business_id, debt_id, amount, kind)
  values (v_debt.business_id, v_debt.id, p_amount, 'later');

  update public.debts
  set paid = least(amount, coalesce(paid, 0) + p_amount)
  where id = v_debt.id;
end;
$$;

revoke all on function public.record_debt_payment(uuid, numeric) from public;
grant execute on function public.record_debt_payment(uuid, numeric) to authenticated;
