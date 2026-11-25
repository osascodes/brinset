alter table public.sales
  add column if not exists source text not null default 'manual',
  add column if not exists order_number text;

create index if not exists sales_order_number_idx on public.sales (business_id, order_number);

create or replace function public.complete_store_order(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
  v_price numeric;
  v_cost numeric;
  v_stock integer;
  v_name text;
  v_sale_id uuid;
  v_total numeric := 0;
  v_customer_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'Order not found';
  end if;
  if v_order.status = 'done' then
    raise exception 'Order is already completed';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = v_order.business_id and b.owner_id = auth.uid()
  ) and not exists (
    select 1 from public.staff_members s
    where s.business_id = v_order.business_id
      and s.user_id = auth.uid()
      and s.active = true
  ) then
    raise exception 'Not allowed';
  end if;

  if exists (
    select 1 from public.sales
    where business_id = v_order.business_id
      and source = 'storefront'
      and order_number = v_order.order_number
      and v_order.order_number is not null
  ) then
    raise exception 'This order already has a sale';
  end if;

  select id into v_customer_id
  from public.customers
  where business_id = v_order.business_id
    and phone = v_order.customer_phone
  order by created_at asc
  limit 1;

  if v_customer_id is null then
    insert into public.customers (business_id, name, phone)
    values (v_order.business_id, v_order.customer_name, nullif(v_order.customer_phone, ''))
    returning id into v_customer_id;
  end if;

  insert into public.sales (business_id, total, customer_id, source, order_number)
  values (v_order.business_id, 0, v_customer_id, 'storefront', v_order.order_number)
  returning id into v_sale_id;

  for v_item in
    select * from public.orders
    where business_id = v_order.business_id
      and status in ('pending', 'packed', 'out')
      and (
        (v_order.order_number is not null and order_number = v_order.order_number)
        or id = v_order.id
      )
    for update
  loop
    if v_item.product_id is null then
      raise exception 'Product missing on order';
    end if;

    select name, price, stock, cost_price into v_name, v_price, v_stock, v_cost
    from public.products
    where id = v_item.product_id and business_id = v_item.business_id
    for update;

    if v_name is null then
      raise exception 'Product not found';
    end if;
    if v_stock < v_item.quantity then
      raise exception 'Not enough stock for %', v_name;
    end if;

    insert into public.sale_items (sale_id, product_id, name, quantity, price, cost_price)
    values (v_sale_id, v_item.product_id, v_name, v_item.quantity, v_price, v_cost);

    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;

    update public.orders set status = 'done' where id = v_item.id;
    v_total := v_total + (v_price * v_item.quantity);
  end loop;

  if v_total = 0 then
    raise exception 'Nothing to complete on this order';
  end if;

  update public.sales set total = v_total where id = v_sale_id;
  return v_sale_id;
end;
$$;

grant execute on function public.complete_store_order(uuid) to authenticated;
