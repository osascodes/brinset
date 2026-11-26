alter table public.debt_payments
  add column if not exists kind text not null default 'later';

-- Initial partial payments are created with the debt. Later payments come after.
update public.debt_payments p
set kind = 'initial'
from public.debts d
where p.debt_id = d.id
  and p.kind = 'later'
  and abs(extract(epoch from (p.created_at - d.created_at))) < 120;

create index if not exists debt_payments_kind_idx on public.debt_payments (business_id, kind, created_at desc);
