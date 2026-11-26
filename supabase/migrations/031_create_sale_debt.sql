-- Partial payments call create_sale_debt with p_sale_id.
-- Live PostgREST could not find that 5-argument function.
-- This recreates it and reloads the schema cache. Safe to run more than once.

alter table public.debts
  add column if not exists sale_id uuid references public.sales(id) on delete set null;

create index if not exists debts_sale_id_idx on public.debts (sale_id);

drop function if exists public.create_sale_debt(uuid, uuid, numeric, text);

create or replace function public.create_sale_debt(
  p_business_id uuid,
  p_customer_id uuid,
  p_amount numeric,
  p_note text,
  p_sale_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = p_business_id and b.owner_id = auth.uid()
  ) and not exists (
    select 1 from public.staff_members s
    where s.business_id = p_business_id
      and s.user_id = auth.uid()
      and s.active = true
  ) then
    raise exception 'Not allowed';
  end if;

  if not exists (
    select 1 from public.customers c
    where c.id = p_customer_id and c.business_id = p_business_id
  ) then
    raise exception 'Customer not found';
  end if;

  insert into public.debts (business_id, customer_id, amount, note, sale_id)
  values (p_business_id, p_customer_id, p_amount, nullif(p_note, ''), p_sale_id)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_sale_debt(uuid, uuid, numeric, text, uuid) to authenticated;

notify pgrst, 'reload schema';
