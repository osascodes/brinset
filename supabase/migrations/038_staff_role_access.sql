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


-- New sales are attributed to the signed-in user. Existing rows stay null.
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
  if not public.is_business_member(p_business_id) then
    raise exception 'Not allowed';
  end if;

  insert into public.sales (business_id, total, recorded_by)
  values (p_business_id, 0, auth.uid())
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

drop policy if exists "members manage sales" on public.sales;
drop policy if exists "owners manage sales" on public.sales;
drop policy if exists "staff read own sales" on public.sales;
create policy "owners manage sales"
  on public.sales for all
  using (exists (select 1 from public.businesses b where b.id = sales.business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = sales.business_id and b.owner_id = auth.uid()));
create policy "staff read own sales"
  on public.sales for select
  using (
    recorded_by = auth.uid()
    and exists (
      select 1 from public.staff_members s
      where s.business_id = sales.business_id and s.user_id = auth.uid() and s.active = true
    )
  );

drop policy if exists "members manage sale items" on public.sale_items;
drop policy if exists "owners manage sale items" on public.sale_items;
drop policy if exists "staff read own sale items" on public.sale_items;
create policy "owners manage sale items"
  on public.sale_items for all
  using (exists (
    select 1 from public.sales s
    join public.businesses b on b.id = s.business_id
    where s.id = sale_items.sale_id and b.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.sales s
    join public.businesses b on b.id = s.business_id
    where s.id = sale_items.sale_id and b.owner_id = auth.uid()
  ));
create policy "staff read own sale items"
  on public.sale_items for select
  using (exists (
    select 1 from public.sales s
    where s.id = sale_items.sale_id and s.recorded_by = auth.uid()
  ));
