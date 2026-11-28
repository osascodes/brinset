-- Sales staff can work in the shop, but cannot delete financial records or manage staff.

drop policy if exists "members manage debts" on public.debts;
drop policy if exists "members read debts" on public.debts;
drop policy if exists "members update debts" on public.debts;
drop policy if exists "owners delete debts" on public.debts;

create policy "members read debts"
  on public.debts for select
  using (public.is_business_member(business_id));

create policy "members update debts"
  on public.debts for update
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

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
