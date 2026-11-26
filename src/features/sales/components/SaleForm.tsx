"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { recordSaleAction } from "@/features/sales/actions";
import { toast } from "@/components/Toast";
import { SALE_CUSTOMERS, SALE_PRODUCTS, readQueue, writeQueue } from "@/features/sales/offline";

type Product = { id: string; name: string; price: number; stock: number };
type Customer = { id: string; name: string };
type Line = { productId: string; quantity: number };

const field = "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-[#635BFF]";

export default function SaleForm({ products, customers = [], offlineMode = false }: { products: Product[]; customers?: Customer[]; offlineMode?: boolean }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [paymentMode, setPaymentMode] = useState<"paid" | "partial" | "unpaid">("paid");
  const [amountReceived, setAmountReceived] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountMode, setDiscountMode] = useState<"fixed" | "percent">("fixed");

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find((item) => item.id === line.productId);
        return sum + Number(product?.price || 0) * line.quantity;
      }, 0),
    [lines, products],
  );
  const discountAmount = discountMode === "percent" ? Math.min(subtotal, (subtotal * discountValue) / 100) : Math.min(subtotal, discountValue);
  const total = Math.max(subtotal - discountAmount, 0);

  useEffect(() => {
    if (products.length > 0) localStorage.setItem(SALE_PRODUCTS, JSON.stringify(products));
    if (customers.length > 0) localStorage.setItem(SALE_CUSTOMERS, JSON.stringify(customers));
  }, [products, customers]);

  const addLine = () => {
    if (!productId) {
      setErrorMessage("Pick a product");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage("Quantity must be at least 1");
      return;
    }
    const product = products.find((item) => item.id === productId);
    const already = lines.find((line) => line.productId === productId)?.quantity || 0;
    if (product && already + quantity > product.stock) {
      setErrorMessage(`Only ${product.stock} left for ${product.name}`);
      return;
    }
    setErrorMessage("");
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        return current.map((line) => (line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line));
      }
      return [...current, { productId, quantity }];
    });
    setProductId("");
    setQuantity(1);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage("");
    setSuccessMessage("");
    setPending(true);
    setSaved(false);
    const formData = new FormData(event.currentTarget);
    const customerId = String(formData.get("customer_id") || "");
    formData.set("discount", String(discountAmount));
    formData.set("payment_mode", paymentMode);
    formData.set("amount_received", String(amountReceived));
    try {
      const payload = {
        id: crypto.randomUUID(),
        items: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
        customer_id: customerId,
        payment_mode: paymentMode,
        amount_received: amountReceived,
        discount: discountAmount,
        label: lines
          .map((line) => {
            const product = products.find((item) => item.id === line.productId);
            return `${line.quantity} x ${product?.name || "Item"}`;
          })
          .join(", "),
        total,
      };
      if ((paymentMode === "unpaid" || paymentMode === "partial") && !customerId) throw new Error("Pick a customer for a credit sale");
      if (paymentMode === "partial" && (amountReceived <= 0 || amountReceived >= total)) throw new Error("Amount received must be more than 0 and less than the total");
      if (offlineMode || !navigator.onLine) {
        writeQueue([...readQueue(), payload]);
        setLines([]);
        setDiscountValue(0);
        setPaymentMode("paid");
        setAmountReceived(0);
        setErrorMessage("Saved on this phone. It will send when the network returns.");
        return;
      }
      const result = await recordSaleAction(formData);
      if (result?.error) throw new Error(result.error);
      setLines([]);
      setDiscountValue(0);
      setPaymentMode("paid");
      setAmountReceived(0);
      setSaved(false);
      setErrorMessage("");
      setSuccessMessage("Sale recorded successfully");
      toast("Sale recorded successfully");
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not record sale.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {errorMessage ? (
        <div className={errorMessage.startsWith("Saved on this phone") ? "rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600" : "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"}>{errorMessage}</div>
      ) : null}
      {successMessage ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{successMessage}</div> : null}
      <input type="hidden" name="items" value={JSON.stringify(lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })))} />
      <input type="hidden" name="discount" value={discountAmount} />

      <div>
        <h2 className="text-base font-semibold text-zinc-950">New Sale</h2>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-900">Product</label>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} className={field}>
          <option value="">Choose a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} · ₦{Number(product.price).toLocaleString()} · {product.stock} left
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-900">Quantity</label>
        <div className="flex items-center gap-2">
          <input value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} type="number" min="1" step="1" className={field} />
          <button type="button" onClick={addLine} className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#635BFF] px-4 text-sm font-semibold text-white">
            + Add item
          </button>
        </div>
      </div>

      {lines.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Items in this sale</h3>
          <div className="mt-2 divide-y divide-zinc-100 rounded-xl border border-zinc-200">
            {lines.map((line) => {
              const product = products.find((item) => item.id === line.productId);
              const unit = Number(product?.price || 0);
              return (
                <div key={line.productId} className="flex items-center gap-3 px-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-950">{product?.name || "Item"}</p>
                    <p className="text-xs text-zinc-500">₦{unit.toLocaleString()} × {line.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-zinc-950">₦{(unit * line.quantity).toLocaleString()}</p>
                  <button type="button" onClick={() => setLines((current) => current.filter((item) => item.productId !== line.productId))} className="text-rose-500" aria-label="Remove item">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600">Subtotal</span>
        <span className="font-medium text-zinc-950">₦{subtotal.toLocaleString()}</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-900">Discount</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={discountValue || ""}
            onChange={(event) => setDiscountValue(Number(event.target.value) || 0)}
            placeholder="Enter discount"
            className={field}
          />
          <select value={discountMode} onChange={(event) => setDiscountMode(event.target.value as "fixed" | "percent")} className="h-10 w-28 shrink-0 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-950 outline-none focus:border-[#635BFF]">
            <option value="fixed">₦ Fixed</option>
            <option value="percent">% Percent</option>
          </select>
        </div>
        <p className="text-xs text-zinc-500">Choose a fixed amount or percentage discount.</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-zinc-950">Total</span>
        <span className="text-lg font-semibold text-zinc-950">₦{total.toLocaleString()}</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-900">Customer</label>
        <select name="customer_id" className={field}>
          <option value="">Select customer or no customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["paid", "partial", "unpaid"] as const).map((mode) => (
          <button key={mode} type="button" onClick={() => setPaymentMode(mode)} className={`h-10 rounded-lg border text-sm font-medium ${paymentMode === mode ? "border-[#635BFF] bg-[#635BFF] text-white" : "border-zinc-200 text-zinc-700"}`}>
            {mode === "paid" ? "Paid" : mode === "partial" ? "Partial" : "Unpaid"}
          </button>
        ))}
      </div>
      {paymentMode === "partial" ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-950">Amount received</label>
          <input type="number" min="1" value={amountReceived || ""} onChange={(event) => setAmountReceived(Number(event.target.value))} placeholder="Amount received now" className={field} />
          <p className="text-xs text-zinc-500">Outstanding: ₦{Math.max(total - amountReceived, 0).toLocaleString()}</p>
        </div>
      ) : null}
      {paymentMode === "unpaid" ? <p className="text-xs text-zinc-500">The full total will be added to this customer's debt.</p> : null}

      <button type="submit" disabled={pending || lines.length === 0} className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#635BFF] text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50">
        {pending ? "Recording..." : saved ? "Done" : offlineMode ? `Save offline · ₦${total.toLocaleString()}` : `Record Sale · ₦${total.toLocaleString()}`}
      </button>
    </form>
  );
}
