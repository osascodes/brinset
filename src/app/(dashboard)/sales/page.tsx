import { getAuthState } from "@/lib/auth/utils";
import { getCurrentBusiness } from "@/features/business/queries";
import { getProducts } from "@/features/inventory/queries";
import { getRecentSales } from "@/features/sales/queries";
import { getCustomers } from "@/features/debts/queries";
import SaleForm from "@/features/sales/components/SaleForm";
import SaleList from "@/features/sales/components/SaleList";
import SavedList from "@/components/SavedList";
import OfflineSales from "@/features/sales/components/OfflineSales";
import { redirect } from "next/navigation";

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ today?: string }> }) {
  const params = await searchParams;
  const todayOnly = params.today === "1";
  const { offline } = await getAuthState();

  let business = null;
  try {
    business = await getCurrentBusiness();
  } catch {
    business = null;
  }
  if (!business) {
    if (!offline) {
      const { user } = await getAuthState();
      if (user) redirect("/onboarding");
      redirect("/login");
    }
    if (offline) {
      return (
        <main className="px-4 py-6 md:px-8">
          <div className="mx-auto max-w-xl">
            <h1 className="text-2xl font-semibold text-zinc-950">Sales</h1>
            <p className="mt-1 text-sm text-zinc-500">Record and manage your sales</p>
            <p className="mt-2 text-sm text-zinc-500">Offline. New sales stay on this phone until the network returns.</p>
            <OfflineSales />
            <div className="mt-8">
              <SavedList storageKey="bizflow-sales" title="Last sales" subtitle="Saved sales." offline />
            </div>
          </div>
        </main>
      );
    }
    redirect("/onboarding");
  }

  const [products, sales, customers] = await Promise.all([
    getProducts().catch(() => []),
    getRecentSales().catch(() => []),
    getCustomers().catch(() => []),
  ]);
  const saved = sales.map((sale) => {
    const items = sale.sale_items ?? [];
    const title = items.length > 1 ? `${items.length} items` : items[0] ? `${items[0].quantity} x ${items[0].name}` : "Sale";
    return { id: sale.id, title, detail: `NGN ${Number(sale.total).toLocaleString()}`, href: `/sales/${sale.id}` };
  });

  return (
    <>
      <SavedList storageKey="bizflow-sales" title="Sales" subtitle="Saved for offline." items={saved} />
      <main className="px-4 py-6 md:px-8">
        <div className="mx-auto max-w-xl space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-950">Sales</h1>
            <p className="mt-1 text-sm text-zinc-500">Record and manage your sales</p>
          </div>
          <SaleForm products={products} customers={customers} />
          <SaleList
            todayOnly={todayOnly}
            sales={sales.map((sale) => {
              const items = sale.sale_items ?? [];
              return {
                id: sale.id,
                when: new Date(sale.created_at).toLocaleString(),
                at: sale.created_at,
                total: Number(sale.total),
                unpaid: Boolean(sale.unpaid),
                voided: sale.status === "voided",
                voidReason: sale.void_reason || "",
                voidedAt: sale.voided_at || "",
                refundDue: Number(sale.refund_due || 0),
                items: items.map((item: { name: string; quantity: number; price: number }) => ({
                  name: item.name,
                  quantity: Number(item.quantity),
                  price: Number(item.price),
                })),
              };
            })}
          />
        </div>
      </main>
    </>
  );
}
