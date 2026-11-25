"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { voidSaleAction } from "@/features/sales/actions";

type SaleItem = { name: string; quantity: number; price: number };
type Sale = {
  id: string;
  when: string;
  at?: string;
  total: number;
  items: SaleItem[];
  unpaid?: boolean;
  partial?: boolean;
  customerName?: string;
  customerPhone?: string;
  voided?: boolean;
  voidReason?: string;
  voidedAt?: string;
  refundDue?: number;
};

function ref(id: string) {
  return id.slice(0, 4).toUpperCase();
}

function summary(items: SaleItem[]) {
  if (items.length === 0) return "Sale";
  return items.map((item) => `${item.name} × ${item.quantity}`).join(", ");
}

function formatWhen(value?: string, fallback = "") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return fallback;
  const datePart = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${datePart} · ${timePart}`;
}

export default function SaleList({ sales, todayOnly = false }: { sales: Sale[]; todayOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "partial" | "unpaid" | "voided">("all");
  const [voiding, setVoiding] = useState<Sale | null>(null);
  const [reason, setReason] = useState("");
  const [items, setItems] = useState(sales);
  const [pendingId, setPendingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return items.filter((sale) => {
      if (todayOnly && sale.at && new Date(sale.at) < start) return false;
      if (filter === "voided" && !sale.voided) return false;
      if (filter !== "voided" && sale.voided) return false;
      if (filter === "paid" && (sale.unpaid || sale.partial)) return false;
      if (filter === "partial" && !sale.partial) return false;
      if (filter === "unpaid" && !sale.unpaid) return false;
      if (!value) return true;
      return `${ref(sale.id)} ${summary(sale.items)}`.toLowerCase().includes(value);
    });
  }, [items, query, todayOnly, filter]);

  useEffect(() => {
    if (!todayOnly) return;
    document.getElementById("sales-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [todayOnly]);

  const chips = [
    ["all", "All"],
    ["paid", "Paid"],
    ["partial", "Partial"],
    ["unpaid", "Unpaid"],
    ["voided", "Voided"],
  ] as const;

  return (
    <div id="sales-list" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-950">{todayOnly ? "Today's sales" : "Sales History"}</h2>
        <Link href="/sales" className="text-sm font-medium text-[#635BFF]">View all</Link>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search sales..."
        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-[#635BFF]"
      />

      <div className="flex gap-2">
        {chips.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === id ? "bg-[#635BFF] text-white" : "bg-zinc-100 text-zinc-600"}`}>{label}</button>
        ))}
      </div>

      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No matching sale.</div>
      ) : (
        filtered.map((sale) => {
          const count = sale.items.reduce((sum, item) => sum + Number(item.quantity), 0);
          return (
            <div key={sale.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-semibold text-zinc-950">Sale #{ref(sale.id)}</p>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${sale.voided ? "bg-zinc-100 text-zinc-600" : sale.unpaid ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{sale.voided ? "Voided" : sale.partial ? "Partial" : sale.unpaid ? "Unpaid" : "Paid"}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{formatWhen(sale.at, sale.when)}</p>
              <p className="mt-3 text-base text-zinc-950">{summary(sale.items)}</p>
              {sale.customerName ? <p className="mt-1 text-sm text-zinc-500">{sale.customerName}{sale.customerPhone ? ` · ${sale.customerPhone}` : ""}</p> : null}
              <div className="mt-4 border-t border-zinc-200 pt-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-400">{count} item{count === 1 ? "" : "s"}</p>
                    <p className="text-lg font-semibold text-zinc-950">₦{sale.total.toLocaleString()}</p>
                  </div>
                  <Link href={`/sales/${sale.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#635BFF]">
                    View receipt <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </Link>
                </div>
              </div>
              {sale.voided ? (
                <p className="mt-2 text-xs text-zinc-500">Voided{sale.voidReason ? `: ${sale.voidReason}` : ""}{sale.refundDue ? ` · ₦${sale.refundDue.toLocaleString()} received, not refunded` : ""}</p>
              ) : (
                <button type="button" onClick={() => { setVoiding(sale); setReason(""); setErrorMessage(""); }} className="mt-2 text-xs font-medium text-rose-600">
                  Void sale
                </button>
              )}
            </div>
          );
        })
      )}
      {voiding ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setErrorMessage("");
              setPendingId(voiding.id);
              try {
                const formData = new FormData();
                formData.set("id", voiding.id);
                formData.set("reason", reason);
                const result = await voidSaleAction(formData);
                if (result?.error) throw new Error(result.error);
                setItems((current) => current.map((item) => item.id === voiding.id ? { ...item, voided: true, voidReason: reason, unpaid: false } : item));
                setVoiding(null);
                setReason("");
              } catch (error: unknown) {
                setErrorMessage(error instanceof Error ? error.message : "Could not void the sale");
              } finally {
                setPendingId("");
              }
            }}
          >
            <h3 className="text-lg font-semibold text-zinc-950">Void this sale?</h3>
            <p className="mt-2 text-sm text-zinc-500">The sale stays in history, but it will be excluded from sales, profit, analytics and close of day. Stock is returned once. Money already received is not marked as refunded.</p>
            <label className="mt-4 block text-sm font-medium text-zinc-700">Reason</label>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} required className="mt-1 h-24 w-full rounded-lg border border-zinc-200 p-3 text-sm" placeholder="Why is this sale being voided?" />
            {errorMessage ? <p className="mt-2 text-sm text-red-500">{errorMessage}</p> : null}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setVoiding(null)} className="h-10 flex-1 rounded-lg border border-zinc-200 text-sm font-medium">Cancel</button>
              <button type="submit" disabled={pendingId === voiding.id || !reason.trim()} className="h-10 flex-1 rounded-lg bg-rose-600 text-sm font-semibold text-white disabled:opacity-60">{pendingId === voiding.id ? "Voiding..." : "Void sale"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
