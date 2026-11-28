-- Ensure accepted invites are marked Active by setting user_id and active.
-- Prevent duplicate active memberships for the same user in a business.

create or replace function public.accept_staff_invite(p_code text, p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_business_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;

  -- Find the pending invite
  select id, business_id into v_id, v_business_id
  from public.staff_members
  where invite_code = upper(p_code)
    and lower(email) = lower(p_email)
    and user_id is null
    and active = true
    and invite_revoked_at is null
    and (invite_expires_at is null or invite_expires_at > now())
  limit 1;

  if v_id is null then
    return null;
  end if;

  -- Prevent duplicate active membership for this user in the same business
  if exists (
    select 1 from public.staff_members
    where business_id = v_business_id
      and user_id = auth.uid()
      and active = true
      and id <> v_id
  ) then
    raise exception 'Already a member of this business';
  end if;

  update public.staff_members
  set user_id = auth.uid(),
      active = true
  where id = v_id;

  return v_id;
end;
$$;

revoke all on function public.accept_staff_invite(text, text) from public, anon;
grant execute on function public.accept_staff_invite(text, text) to authenticated;

-- Optional: unique active membership per user per business
create unique index if not exists staff_active_user_business_idx
  on public.staff_members (business_id, user_id)
  where user_id is not null and active = true;
