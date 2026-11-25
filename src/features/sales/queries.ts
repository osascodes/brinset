import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { lagosDayRange, resolveDayKey } from "@/lib/dates";
import { summarizeSales } from "@/features/finance/math";

export async function getRecentSales() {
  try {
    const business = await getCurrentBusiness();
    if (!business) return [];

    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("sales")
      .select("id, total, discount, created_at, customer_id, status, voided_at, void_reason, refund_due, sale_items(name, quantity, price)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) return [];

    const sales = data ?? [];
    const ids = sales.map((sale) => sale.id);
    const { data: debts } = ids.length
      ? await supabase.from("debts").select("sale_id, amount, paid, status").eq("business_id", business.id).in("sale_id", ids)
      : { data: [] };
    const unpaid = new Set(
      (debts ?? [])
        .filter((debt) => debt.sale_id && Number(debt.amount) - Number(debt.paid) > 0)
        .map((debt) => debt.sale_id),
    );

    return sales.map((sale) => ({
      ...sale,
      unpaid: unpaid.has(sale.id),
    }));
  } catch {
    return [];
  }
}

export async function getTodaySalesTotal(day: Date | string = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return 0;
  const { start, end } = lagosDayRange(resolveDayKey(day));

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("total, status")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  return (data ?? []).filter((sale) => sale.status !== "voided").reduce((sum, sale) => sum + Number(sale.total), 0);
}

export async function getTodaySales(day: Date | string = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const { start, end } = lagosDayRange(resolveDayKey(day));
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("id, total, created_at, status, sale_items(name, quantity)")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .neq("status", "voided")
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []).map((sale) => ({
    id: sale.id,
    total: Number(sale.total),
    items: (sale.sale_items ?? []).map((item: { name: string; quantity: number }) => `${item.quantity} x ${item.name}`).join(", ") || "Sale",
    createdAt: sale.created_at as string,
  }));
}

export async function getTodayProfit(day: Date | string = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return { revenue: 0, cogs: 0, missingUnits: 0 };
  const { start, end } = lagosDayRange(resolveDayKey(day));
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("sales")
    .select("total, status, sale_items(quantity, cost_price)")
    .eq("business_id", business.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());
  const summary = summarizeSales((data ?? []).filter((sale) => sale.status !== "voided"));
  return { revenue: summary.revenue, cogs: summary.cogs, missingUnits: summary.missingUnits };
}

export async function getDayClose(day: Date | string = new Date()) {
  const business = await getCurrentBusiness();
  if (!business) return null;
  const { start, end } = lagosDayRange(resolveDayKey(day));
  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, { data: payments }] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total, created_at, status, sale_items(name, quantity)")
      .eq("business_id", business.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .neq("status", "voided")
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("title, amount")
      .eq("business_id", business.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
    supabase
      .from("debt_payments")
      .select("amount")
      .eq("business_id", business.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
  ]);

  const saleIds = (sales ?? []).map((sale) => sale.id);
  const { data: debts } = saleIds.length
    ? await supabase.from("debts").select("sale_id, amount, paid, status").eq("business_id", business.id).in("sale_id", saleIds)
    : { data: [] };

  const outstandingBySale = new Map<string, number>();
  for (const debt of debts ?? []) {
    if (!debt.sale_id || debt.status === "voided") continue;
    const left = Math.max(0, Number(debt.amount) - Number(debt.paid));
    outstandingBySale.set(debt.sale_id, (outstandingBySale.get(debt.sale_id) || 0) + left);
  }

  let salesTotal = 0;
  let outstanding = 0;
  for (const sale of sales ?? []) {
    salesTotal += Number(sale.total);
    outstanding += outstandingBySale.get(sale.id) || 0;
  }
  const collectedOnSales = Math.max(0, salesTotal - outstanding);
  const debtPayments = (payments ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const expenseTotal = (expenses ?? []).reduce((sum, row) => sum + Number(row.amount), 0);

  return {
    shop: business.name,
    salesCount: (sales ?? []).length,
    salesTotal,
    collectedOnSales,
    debtPayments,
    collected: collectedOnSales + debtPayments,
    outstanding,
    expenses: expenseTotal,
    expenseRows: (expenses ?? []).map((row) => ({ title: row.title, amount: Number(row.amount) })),
  };
}
