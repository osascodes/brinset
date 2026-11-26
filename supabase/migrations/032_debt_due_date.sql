alter table public.debts
  add column if not exists due_date date;

create index if not exists debts_due_date_idx on public.debts (business_id, due_date);

-- Keep voided debts out of active totals even if an older void missed the status.
update public.debts d
set status = 'voided'
from public.sales s
where d.sale_id = s.id
  and s.status = 'voided'
  and d.status <> 'voided';
