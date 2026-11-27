export type CostItem = { quantity: number; cost_price: number | null };
export type SaleForProfit = { total: number; sale_items?: CostItem[] | null };

export function summarizeSales(sales: SaleForProfit[]) {
  let revenue = 0;
  let cogs = 0;
  let missingUnits = 0;
  for (const sale of sales) {
    revenue += Number(sale.total) || 0;
    for (const item of sale.sale_items ?? []) {
      const quantity = Number(item.quantity) || 0;
      const rawCost = item.cost_price as number | string | null | undefined;
      if (rawCost == null || rawCost === "") {
        missingUnits += quantity;
        continue;
      }
      const cost = Number(rawCost);
      if (!Number.isFinite(cost)) {
        missingUnits += quantity;
        continue;
      }
      cogs += cost * quantity;
    }
  }
  return { revenue, cogs, missingUnits, count: sales.length };
}

export function netProfit(revenue: number, cogs: number, expenses: number) {
  return revenue - cogs - expenses;
}
