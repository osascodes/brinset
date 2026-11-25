alter table public.sales
  add column if not exists status text not null default 'completed',
  add column if not exists voided_at timestamptz,
  add column if not exists void_reason text,
  add column if not exists voided_by uuid,
  add column if not exists stock_restored boolean not null default false,
  add column if not exists refund_due numeric(12,2) not null default 0;

alter table public.debts
  add column if not exists status text not null default 'open';

create index if not exists sales_business_status_idx on public.sales (business_id, status, created_at desc);

create or replace function public.block_sale_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Sales cannot be deleted. Void the sale instead.';
end;
$$;

drop trigger if exists sales_block_delete on public.sales;
create trigger sales_block_delete
  before delete on public.sales
  for each row execute function public.block_sale_delete();

create or replace function public.void_sale(p_sale_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale public.sales%rowtype;
  v_item record;
  v_debt record;
  v_paid numeric := 0;
  v_refund numeric := 0;
  v_payment text := 'paid';
begin
  if nullif(trim(p_reason), '') is null then
    raise exception 'A void reason is required';
  end if;

  select * into v_sale
  from public.sales
  where id = p_sale_id
  for update;

  if v_sale.id is null then
    raise exception 'Sale not found';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = v_sale.business_id and b.owner_id = auth.uid()
  ) then
    raise exception 'Only the owner can void a sale';
  end if;

  if v_sale.status = 'voided' or v_sale.stock_restored then
    raise exception 'This sale is already voided';
  end if;

  for v_item in
    select product_id, quantity
    from public.sale_items
    where sale_id = v_sale.id
  loop
    if v_item.product_id is not null then
      update public.products
      set stock = stock + v_item.quantity
      where id = v_item.product_id
        and business_id = v_sale.business_id;
    end if;
  end loop;

  for v_debt in
    select id, amount, paid
    from public.debts
    where sale_id = v_sale.id
      and business_id = v_sale.business_id
    for update
  loop
    v_paid := v_paid + coalesce(v_debt.paid, 0);
    update public.debts
    set status = 'voided'
    where id = v_debt.id;
  end loop;

  if v_paid > 0 then
    v_payment := 'paid';
    v_refund := v_paid;
  elsif exists (
    select 1 from public.debts
    where sale_id = v_sale.id and business_id = v_sale.business_id
  ) then
    v_payment := 'unpaid';
    v_refund := 0;
  else
    v_payment := 'paid';
    v_refund := v_sale.total;
  end if;

  update public.sales
  set status = 'voided',
      voided_at = now(),
      void_reason = trim(p_reason),
      voided_by = auth.uid(),
      stock_restored = true,
      refund_due = v_refund
  where id = v_sale.id;

  return jsonb_build_object(
    'id', v_sale.id,
    'payment', v_payment,
    'refund_due', v_refund,
    'stock_restored', true
  );
end;
$$;

grant execute on function public.void_sale(uuid, text) to authenticated;
