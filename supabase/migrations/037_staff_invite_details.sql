alter table public.staff_members
  add column if not exists invite_expires_at timestamptz,
  add column if not exists invite_revoked_at timestamptz,
  add column if not exists invite_email_sent_at timestamptz;

alter table public.staff_members
  alter column invite_expires_at set default (now() + interval '14 days');

create unique index if not exists staff_pending_email_idx
  on public.staff_members (business_id, lower(email))
  where user_id is null and active = true and invite_revoked_at is null;

create or replace function public.preview_staff_details(p_code text, p_ip text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_details jsonb;
begin
  if public.guard_staff_preview(p_code, p_ip) is not true then
    return null;
  end if;

  select jsonb_build_object(
    'name', s.name,
    'email', s.email,
    'role', s.role,
    'shop', b.name,
    'expires_at', s.invite_expires_at
  )
  into v_details
  from public.staff_members s
  join public.businesses b on b.id = s.business_id
  where p_code ~ '^[A-Z0-9]{6,8}$'
    and s.invite_code = upper(p_code)
    and s.user_id is null
    and s.active = true
    and s.invite_revoked_at is null
    and (s.invite_expires_at is null or s.invite_expires_at > now())
  limit 1;

  return v_details;
end;
$$;

revoke all on function public.preview_staff_details(text, text) from public, anon, authenticated;
grant execute on function public.preview_staff_details(text, text) to service_role;
