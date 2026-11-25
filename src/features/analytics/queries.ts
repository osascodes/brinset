import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";
import { addDateKey, lagosDateKey, lagosDayRange, monthEndKey, monthStartKey, weekStartKey } from "@/lib/dates";
import { netProfit, summarizeSales } from "@/features/finance/math";

type SaleItem = { name: string; quantity: number; price: number; cost_price: number | null };
type Sale = { id: string; total: number; created_at: string; sale_items: SaleItem[] | null };
type Expense = { amount: number; created_at: string };

const empty = {
  weekSales: 0,
  monthSales: 0,
  weekCosts: 0,
  netProfit: 0,
  missingCostUnits: 0,
  prevWeekSales: 0,
  prevMonthSales: 0,
  prevWeekCosts: 0,
  prevNetProfit: 0,
  days: [] as { label: string; date: number; total: number }[],
  chartDays: [] as { key: string; label: string; date: number; total: number }[],
  chartFrom: "",
  chartTo: "",
  chartRange: "7",
  topProducts: [] as { name: string; quantity: number; amount: number; image: string }[],
  lowStock: [] as { name: string; stock: number }[],
};

function inRange(createdAt: string, from: Date, to: Date) {
  const created = new Date(createdAt);
  return created >= from && created < to;
}

function sumSales(rows: Sale[], from: Date, to: Date) {
  return rows.filter((sale) => inRange(sale.created_at, from, to)).reduce((sum, sale) => sum + Number(sale.total), 0);
}

function sumExpenses(rows: Expense[], from: Date, to: Date) {
  return rows.filter((row) => inRange(row.created_at, from, to)).reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function getAnalytics(from?: string, to?: string, range?: string) {
  const business = await getCurrentBusiness();
  if (!business) return empty;

  const todayKey = lagosDateKey(new Date());
  const selectedRange = ["today", "yesterday", "7", "30", "week", "month", "custom"].includes(range || "") ? range || "7" : "7";
  const thisWeekStart = weekStartKey(todayKey);
  const prevWeekStartKey = addDateKey(thisWeekStart, -7);
  const thisMonthStart = monthStartKey(todayKey);
  const prevMonthStartKey = monthStartKey(addDateKey(thisMonthStart, -1));
  const prevMonthEndKey = monthEndKey(prevMonthStartKey);

  let rangeStart = addDateKey(todayKey, -6);
  let rangeEnd = todayKey;
  if (selectedRange === "today") {
    rangeStart = todayKey;
    rangeEnd = todayKey;
  } else if (selectedRange === "yesterday") {
    rangeStart = addDateKey(todayKey, -1);
    rangeEnd = rangeStart;
  } else if (selectedRange === "30") {
    rangeStart = addDateKey(todayKey, -29);
    rangeEnd = todayKey;
  } else if (selectedRange === "week") {
    rangeStart = thisWeekStart;
    rangeEnd = addDateKey(thisWeekStart, 6);
  } else if (selectedRange === "month") {
    rangeStart = thisMonthStart;
    rangeEnd = monthEndKey(todayKey);
  } else if (selectedRange === "custom" && from && to && /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    rangeStart = from <= to ? from : to;
    rangeEnd = from <= to ? to : from;
    const span = Math.round((new Date(`${rangeEnd}T00:00:00Z`).getTime() - new Date(`${rangeStart}T00:00:00Z`).getTime()) / 86400000);
    if (span > 61) rangeStart = addDateKey(rangeEnd, -61);
  }

  const fetchStartKey = [prevMonthStartKey, prevWeekStartKey, rangeStart].sort()[0];
  const fetchStart = lagosDayRange(fetchStartKey).start;
  const weekRange = { from: lagosDayRange(thisWeekStart).start, to: lagosDayRange(addDateKey(thisWeekStart, 7)).start };
  const prevWeekRange = { from: lagosDayRange(prevWeekStartKey).start, to: weekRange.from };
  const monthRange = { from: lagosDayRange(thisMonthStart).start, to: lagosDayRange(addDateKey(monthEndKey(todayKey), 1)).start };
  const prevMonthRange = { from: lagosDayRange(prevMonthStartKey).start, to: lagosDayRange(addDateKey(prevMonthEndKey, 1)).start };

  const supabase = await createServerSupabase();
  const [{ data: sales }, { data: expenses }, products] = await Promise.all([
    supabase
      .from("sales")
      .select("id, total, created_at, status, sale_items(name, quantity, price, cost_price)")
      .eq("business_id", business.id)
      .gte("created_at", fetchStart.toISOString()),
    supabase
      .from("expenses")
      .select("amount, created_at")
      .eq("business_id", business.id)
      .gte("created_at", fetchStart.toISOString()),
    getProducts(),
  ]);

  const rows = ((sales ?? []) as (Sale & { status?: string })[]).filter((sale) => sale.status !== "voided");
  const expenseRows = (expenses ?? []) as Expense[];
  const weekSales = sumSales(rows, weekRange.from, weekRange.to);
  const monthSales = sumSales(rows, monthRange.from, monthRange.to);
  const prevWeekSales = sumSales(rows, prevWeekRange.from, prevWeekRange.to);
  const prevMonthSales = sumSales(rows, prevMonthRange.from, prevMonthRange.to);
  const weekCosts = sumExpenses(expenseRows, weekRange.from, weekRange.to);
  const prevWeekCosts = sumExpenses(expenseRows, prevWeekRange.from, prevWeekRange.to);
  const weekProfit = summarizeSales(rows.filter((sale) => inRange(sale.created_at, weekRange.from, weekRange.to)));
  const prevProfit = summarizeSales(rows.filter((sale) => inRange(sale.created_at, prevWeekRange.from, prevWeekRange.to)));

  const days = Array.from({ length: 7 }, (_, index) => {
    const key = addDateKey(todayKey, index - 6);
    const range = lagosDayRange(key);
    const total = sumSales(rows, range.start, range.end);
    return {
      label: new Date(`${key}T12:00:00Z`).toLocaleDateString("en-NG", { weekday: "short", timeZone: "UTC" }),
      date: Number(key.slice(8, 10)),
      total,
    };
  });

  const chartDays = [];
  for (let key = rangeStart; key <= rangeEnd; key = addDateKey(key, 1)) {
    const range = lagosDayRange(key);
    chartDays.push({
      key,
      label: new Date(`${key}T12:00:00Z`).toLocaleDateString("en-NG", { weekday: "short", timeZone: "UTC" }),
      date: Number(key.slice(8, 10)),
      total: sumSales(rows, range.start, range.end),
    });
  }

  const chartRange = lagosDayRange(rangeStart);
  const chartEnd = lagosDayRange(addDateKey(rangeEnd, 1)).start;
  const productTotals = new Map<string, { name: string; quantity: number; amount: number; image: string }>();
  for (const sale of rows) {
    if (!inRange(sale.created_at, chartRange.start, chartEnd)) continue;
    for (const item of sale.sale_items ?? []) {
      const product = products.find((row) => row.name === item.name);
      const current = productTotals.get(item.name) || { name: item.name, quantity: 0, amount: 0, image: product?.image_url || "" };
      current.quantity += Number(item.quantity);
      current.amount += Number(item.quantity) * Number(item.price);
      productTotals.set(item.name, current);
    }
  }

  const topProducts = [...productTotals.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const lowStock = products
    .filter((product) => product.stock <= product.low_stock_at)
    .slice(0, 5)
    .map((product) => ({ name: product.name, stock: product.stock }));

  return {
    weekSales,
    monthSales,
    weekCosts,
    netProfit: netProfit(weekSales, weekProfit.cogs, weekCosts),
    missingCostUnits: weekProfit.missingUnits,
    prevWeekSales,
    prevMonthSales,
    prevWeekCosts,
    prevNetProfit: netProfit(prevWeekSales, prevProfit.cogs, prevWeekCosts),
    days,
    chartDays,
    chartFrom: rangeStart,
    chartTo: rangeEnd,
    chartRange: selectedRange,
    topProducts,
    lowStock,
  };
}
