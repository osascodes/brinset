"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deleteSaleAction } from "@/features/sales/actions";

type SaleItem = { name: string; quantity: number; price: number };
type Sale = {
  id: string;
  when: string;
  at?: string;
  total: number;
  items: SaleItem[];
  unpaid?: boolean;
};

function ref(id: string) {
  return id.slice(0, 4).toUpperCase();
}

function summary(items: SaleItem[]) {
  if (items.length === 0) return "Sale";
  return items.map((item) => `${item.name} × ${item.quantity}`).join(", ");
}

export default function SaleList({ sales, todayOnly = false }: { sales: Sale[]; todayOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [items, setItems] = useState(sales);
  const [pendingId, setPendingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return items.filter((sale) => {
      if (todayOnly && sale.at && new Date(sale.at) < start) return false;
      if (filter === "paid" && sale.unpaid) return false;
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
    ["unpaid", "Unpaid"],
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
            <div key={sale.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-950">Sale #{ref(sale.id)}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${sale.unpaid ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{sale.unpaid ? "Unpaid" : "Paid"}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{sale.when}</p>
              <p className="mt-2 text-sm text-zinc-700">{summary(sale.items)}</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{count} item{count === 1 ? "" : "s"}</p>
                  <p className="text-sm font-semibold text-zinc-950">₦{sale.total.toLocaleString()}</p>
                </div>
                <Link href={`/sales/${sale.id}`} className="text-sm font-medium text-[#635BFF]">View receipt →</Link>
              </div>
              <button
                type="button"
                disabled={pendingId === sale.id}
                onClick={async () => {
                  setErrorMessage("");
                  setPendingId(sale.id);
                  const previous = items;
                  setItems((current) => current.filter((item) => item.id !== sale.id));
                  try {
                    const formData = new FormData();
                    formData.set("id", sale.id);
                    const result = await deleteSaleAction(formData);
                    if (result?.error) throw new Error(result.error);
                  } catch (error: unknown) {
                    setItems(previous);
                    setErrorMessage(error instanceof Error ? error.message : "Could not remove the sale");
                  } finally {
                    setPendingId("");
                  }
                }}
                className="mt-2 text-xs text-zinc-400"
              >
                {pendingId === sale.id ? "Removing..." : "Remove"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
