alter table public.staff_members
  add column if not exists invite_expires_at timestamptz,
  add column if not exists invite_revoked_at timestamptz;

alter table public.staff_members
  alter column invite_expires_at set default (now() + interval '14 days');

create table if not exists public.staff_preview_attempts (
  id bigint generated always as identity primary key,
  ip text not null,
  code text not null,
  created_at timestamptz not null default now()
);

create index if not exists staff_preview_attempts_ip_idx
  on public.staff_preview_attempts (ip, created_at desc);
create index if not exists staff_preview_attempts_code_idx
  on public.staff_preview_attempts (code, created_at desc);

alter table public.staff_preview_attempts enable row level security;

create or replace function public.preview_staff_shop(p_code text)
returns text
language sql
security definer
set search_path = public
as $$
  select b.name
  from public.staff_members s
  join public.businesses b on b.id = s.business_id
  where p_code ~ '^[A-Z0-9]{6,8}$'
    and s.invite_code = upper(p_code)
    and s.user_id is null
    and s.active = true
    and s.invite_revoked_at is null
    and (s.invite_expires_at is null or s.invite_expires_at > now())
  limit 1;
$$;

revoke all on function public.preview_staff_shop(text) from public;
grant execute on function public.preview_staff_shop(text) to anon, authenticated;

create or replace function public.check_staff_invite(p_code text, p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_members s
    where s.invite_code = upper(p_code)
      and lower(s.email) = lower(p_email)
      and s.user_id is null
      and s.active = true
      and s.invite_revoked_at is null
      and (s.invite_expires_at is null or s.invite_expires_at > now())
  );
$$;

revoke all on function public.check_staff_invite(text, text) from public;
grant execute on function public.check_staff_invite(text, text) to anon, authenticated;

revoke all on function public.preview_staff_invite(text) from public, anon, authenticated;

create or replace function public.accept_staff_invite(p_code text, p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.staff_members
  set user_id = auth.uid()
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

create or replace function public.guard_staff_preview(p_code text, p_ip text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text := left(coalesce(nullif(p_ip, ''), 'unknown'), 64);
  v_code text := upper(coalesce(p_code, ''));
  v_ip_count integer;
  v_pair_count integer;
  v_code_count integer;
begin
  if v_code !~ '^[A-Z0-9]{6,8}$' then
    return false;
  end if;

  delete from public.staff_preview_attempts
  where created_at < now() - interval '1 hour';

  select count(*) into v_ip_count
  from public.staff_preview_attempts
  where ip = v_ip and created_at > now() - interval '15 minutes';

  select count(*) into v_pair_count
  from public.staff_preview_attempts
  where ip = v_ip and code = v_code and created_at > now() - interval '15 minutes';

  select count(*) into v_code_count
  from public.staff_preview_attempts
  where code = v_code and created_at > now() - interval '15 minutes';

  if v_ip_count >= 20 or v_pair_count >= 5 or v_code_count >= 30 then
    return false;
  end if;

  insert into public.staff_preview_attempts (ip, code) values (v_ip, v_code);
  return true;
end;
$$;

revoke all on function public.guard_staff_preview(text, text) from public;
grant execute on function public.guard_staff_preview(text, text) to anon, authenticated;
