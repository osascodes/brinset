create or replace function public.preview_staff_shop(p_code text)
returns text
language sql
security definer
set search_path = public
as $$
  select b.name
  from public.staff_members s
  join public.businesses b on b.id = s.business_id
  where s.invite_code = upper(p_code)
    and s.user_id is null
  limit 1;
$$;

grant execute on function public.preview_staff_shop(text) to anon, authenticated;
