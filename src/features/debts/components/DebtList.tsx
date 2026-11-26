"use client";

import { useMemo, useState } from "react";
import { PaymentForm } from "@/features/debts/components/DebtForms";

type Debt = {
  id: string;
  name: string;
  note: string;
  balance: number;
  amount: number;
  paid: number;
  phone: string | null;
  shop: string;
  status?: string;
  dueDate?: string;
};

type Filter = "all" | "outstanding" | "today" | "overdue" | "paid" | "voided";

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function dueLabel(debt: Debt) {
  if (!debt.dueDate) return "No due date";
  const today = todayKey();
  if (debt.dueDate === today) return "Due today";
  if (debt.dueDate < today) return "Overdue";
  return `Due ${new Date(`${debt.dueDate}T12:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`;
}

export default function DebtList({ debts }: { debts: Debt[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("outstanding");
  const [items, setItems] = useState(debts);
  const today = todayKey();

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((debt) => {
      const voided = debt.status === "voided";
      const outstanding = !voided && debt.balance > 0;
      if (filter === "outstanding" && !outstanding) return false;
      if (filter === "today" && !(outstanding && debt.dueDate === today)) return false;
      if (filter === "overdue" && !(outstanding && debt.dueDate && debt.dueDate < today)) return false;
      if (filter === "paid" && (voided || debt.balance > 0)) return false;
      if (filter === "voided" && !voided) return false;
      if (!value) return true;
      return `${debt.name} ${debt.note}`.toLowerCase().includes(value);
    });
  }, [items, query, filter, today]);

  const filters: [Filter, string][] = [
    ["all", "All"],
    ["outstanding", "Outstanding"],
    ["today", "Due today"],
    ["overdue", "Overdue"],
    ["paid", "Paid"],
    ["voided", "Voided"],
  ];

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search debts"
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setFilter(key)} className={`h-9 shrink-0 rounded-full px-3 text-sm font-medium ${filter === key ? "bg-[#635BFF] text-white" : "bg-zinc-100 text-zinc-700"}`}>
            {label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No matching debt.</div>
      ) : (
        filtered.map((debt) => {
          const phone = debt.phone?.replace(/\D/g, "").replace(/^0/, "234");
          const voided = debt.status === "voided";
          return (
            <div key={debt.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-zinc-950">{debt.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{debt.note || "No note"}</p>
                  <p className="mt-1 text-xs text-zinc-500">{voided ? "Voided" : dueLabel(debt)}</p>
                </div>
                <p className={voided ? "text-sm text-zinc-400" : debt.balance > 0 ? "text-sm font-semibold text-amber-600" : "text-sm font-semibold text-emerald-600"}>
                  {voided ? "Voided" : debt.balance > 0 ? `₦${debt.balance.toLocaleString()} left` : "Paid"}
                </p>
              </div>
              <p className="mt-2 text-xs text-zinc-500">Owes ₦{debt.amount.toLocaleString()} · paid ₦{debt.paid.toLocaleString()}</p>
              {!voided && debt.balance > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <PaymentForm debtId={debt.id} name={debt.name} balance={debt.balance} onPaid={(amount) => setItems((current) => current.map((item) => item.id === debt.id ? { ...item, paid: item.paid + amount, balance: Math.max(0, item.balance - amount) } : item))} />
                  {phone ? (
                    <a
                      href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${debt.name}, this is a reminder from ${debt.shop}. You still owe NGN ${debt.balance.toLocaleString()}.`)}`}
                      target="_blank"
                      className="inline-flex h-10 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-950"
                    >
                      Remind on WhatsApp
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
