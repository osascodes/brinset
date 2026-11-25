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
      if (item.cost_price == null) {
        missingUnits += quantity;
        continue;
      }
      cogs += Number(item.cost_price) * quantity;
    }
  }
  return { revenue, cogs, missingUnits, count: sales.length };
}

export function netProfit(revenue: number, cogs: number, expenses: number) {
  return revenue - cogs - expenses;
}
