import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import PrintButton from "@/features/sales/components/PrintButton";
import ShareReceiptButton from "@/features/sales/components/ShareReceiptButton";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");

  const supabase = await createServerSupabase();
  const { data: sale } = await supabase
    .from("sales")
    .select("id, total, discount, created_at, status, void_reason, voided_at, refund_due, customers(name), sale_items(name, quantity, price)")
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!sale) notFound();

  const items = sale.sale_items ?? [];
  const when = new Date(sale.created_at).toLocaleString();
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const customer = Array.isArray(sale.customers) ? sale.customers[0] : sale.customers;
  const customerName = customer?.name || "";
  const receiptNo = sale.id.slice(0, 8).toUpperCase();
  const message = [
    business.name,
    `Receipt ${receiptNo}`,
    when,
    "",
    ...items.map((item) => `${item.quantity} x ${item.name} - NGN ${(Number(item.price) * item.quantity).toLocaleString()}`),
    "",
    `Total: NGN ${Number(sale.total).toLocaleString()}`,
    "Thank you for shopping with us",
  ].join("\n");

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-md">
        <Link href="/sales" className="text-sm text-zinc-400 hover:text-zinc-950 print:hidden">
          Back to sales
        </Link>
        <article id="receipt-card" className="mt-4 rounded-2xl border border-zinc-200 bg-white px-6 py-7 text-zinc-950 print:border-0">
          {sale.status === "voided" ? (
            <div className="mb-4 rounded-lg bg-zinc-100 p-3 text-sm text-zinc-700">
              <p className="font-semibold">VOIDED</p>
              <p>{sale.void_reason || "No reason recorded"}</p>
              {Number(sale.refund_due) > 0 ? <p>₦{Number(sale.refund_due).toLocaleString()} was received and has not been marked refunded.</p> : null}
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" crossOrigin="anonymous" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold">
                {business.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Receipt</p>
              <h1 className="text-xl font-semibold">{business.name}</h1>
            </div>
          </div>
          {business.phone ? <p className="mt-4 text-sm text-zinc-500">{business.phone}</p> : null}
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <span>{receiptNo}</span>
            <span>{when}</span>
          </div>
          {customerName ? <p className="mt-3 text-sm text-zinc-600">Customer: {customerName}</p> : null}
          <div className="mt-6 space-y-4 border-t border-dashed border-zinc-200 pt-4">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-zinc-500">{item.quantity} x ₦{Number(item.price).toLocaleString()}</p>
                </div>
                <p>₦{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
          {Number(sale.discount) > 0 ? (
            <div className="mt-1 flex items-center justify-between text-sm text-zinc-500">
              <span>Discount</span>
              <span>−₦{Number(sale.discount).toLocaleString()}</span>
            </div>
          ) : null}
          <div className="mt-6 flex items-center justify-between border-t border-dashed border-zinc-200 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>₦{Number(sale.total).toLocaleString()}</span>
          </div>
          <p className="mt-8 text-center text-xs text-zinc-500">Thank you for shopping with us</p>
        </article>
        <PrintButton />
        <ShareReceiptButton receiptNo={receiptNo} />
      </div>
    </main>
  );
}
