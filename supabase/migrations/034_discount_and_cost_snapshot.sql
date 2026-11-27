-- Discounts must apply once, from the original line subtotal.
create or replace function public.apply_sale_discount(p_sale_id uuid, p_discount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_subtotal numeric;
begin
  if p_discount < 0 then
    raise exception 'Discount cannot be negative';
  end if;

  select business_id into v_business_id from public.sales where id = p_sale_id;
  if v_business_id is null then
    raise exception 'Sale not found';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = v_business_id and b.owner_id = auth.uid()
  ) and not exists (
    select 1 from public.staff_members s
    where s.business_id = v_business_id
      and s.user_id = auth.uid()
      and s.active = true
  ) then
    raise exception 'Not allowed';
  end if;

  select coalesce(sum(quantity * price), 0) into v_subtotal
  from public.sale_items
  where sale_id = p_sale_id;

  if p_discount > v_subtotal then
    raise exception 'Discount is more than the total';
  end if;

  update public.sales
  set discount = p_discount,
      total = v_subtotal - p_discount
  where id = p_sale_id;
end;
$$;

grant execute on function public.apply_sale_discount(uuid, numeric) to authenticated;

-- Keep the sale-time cost snapshot. Do not rewrite older sale lines.
create or replace function public.record_cart_sale(p_business_id uuid, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_name text;
  v_price numeric;
  v_cost numeric;
  v_stock integer;
  v_sale_id uuid;
  v_total numeric := 0;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Add at least one item';
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

  insert into public.sales (business_id, total)
  values (p_business_id, 0)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Quantity must be at least 1';
    end if;

    select name, price, stock, cost_price into v_name, v_price, v_stock, v_cost
    from public.products
    where id = v_product_id and business_id = p_business_id
    for update;

    if v_name is null then
      raise exception 'Product not found';
    end if;
    if v_stock < v_quantity then
      raise exception 'Not enough stock for %', v_name;
    end if;

    insert into public.sale_items (sale_id, product_id, name, quantity, price, cost_price)
    values (v_sale_id, v_product_id, v_name, v_quantity, v_price, v_cost);

    update public.products set stock = stock - v_quantity where id = v_product_id;
    v_total := v_total + (v_price * v_quantity);
  end loop;

  update public.sales set total = v_total where id = v_sale_id;
  return v_sale_id;
end;
$$;

grant execute on function public.record_cart_sale(uuid, jsonb) to authenticated;
