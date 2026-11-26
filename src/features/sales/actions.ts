"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

export async function recordSaleAction(formData: FormData) {
  try {
    const raw = String(formData.get("items") || "");
    let items: { product_id: string; quantity: number }[] = [];
    try {
      items = JSON.parse(raw);
    } catch {
      items = [];
    }

    if (!Array.isArray(items) || items.length === 0) return { error: "Add at least one item" };

    const paymentMode = String(formData.get("payment_mode") || (formData.get("on_credit") === "on" ? "unpaid" : "paid"));
    const customerId = String(formData.get("customer_id") || "");
    const discount = Number(formData.get("discount") || 0);
    const received = Number(formData.get("amount_received") || 0);
    const dueMode = String(formData.get("due_mode") || "none");
    const customDue = String(formData.get("due_date") || "");
    if (!["paid", "partial", "unpaid"].includes(paymentMode)) return { error: "Choose a payment option" };
    if ((paymentMode === "unpaid" || paymentMode === "partial") && !customerId) return { error: "Pick a customer for a credit sale" };
    if (discount < 0) return { error: "Discount cannot be negative" };

    const business = await getCurrentBusiness();
    if (!business) return { error: "Create your business first" };

    const supabase = await createServerSupabase();
    const { data: saleId, error } = await supabase.rpc("record_cart_sale", {
      p_business_id: business.id,
      p_items: items,
    });
    if (error || !saleId) return { error: error?.message || "Could not record the sale" };

    if (discount > 0) {
      const { error: discountError } = await supabase.rpc("apply_sale_discount", {
        p_sale_id: saleId,
        p_discount: discount,
      });
      if (discountError) return { error: discountError.message };
    }

    if (customerId) {
      const { error: linkError } = await supabase.rpc("set_sale_customer", {
        p_sale_id: saleId,
        p_customer_id: customerId,
      });
      if (linkError) return { error: linkError.message };
    }

    if (paymentMode === "unpaid" || paymentMode === "partial") {
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select("total")
        .eq("id", saleId)
        .single();
      if (saleError || !sale) return { error: saleError?.message || "Could not read the sale total" };
      if (paymentMode === "partial" && (received <= 0 || received >= Number(sale.total))) {
        return { error: "Amount received must be more than 0 and less than the total" };
      }

      const { data: debtId, error: debtError } = await supabase.rpc("create_sale_debt", {
        p_business_id: business.id,
        p_customer_id: customerId,
        p_amount: sale.total,
        p_note: paymentMode === "partial" ? "Shop sale, partly paid" : "Shop sale on credit",
        p_sale_id: saleId,
      });
      if (debtError || !debtId) return { error: debtError?.message || "Could not add the debt" };

      const lagosToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const tomorrow = new Date(`${lagosToday}T12:00:00Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const dueDate = dueMode === "today" ? lagosToday : dueMode === "tomorrow" ? tomorrow.toISOString().slice(0, 10) : dueMode === "custom" && /^\d{4}-\d{2}-\d{2}$/.test(customDue) ? customDue : null;
      if (dueDate) {
        const { error: dueError } = await supabase.from("debts").update({ due_date: dueDate }).eq("id", debtId).eq("business_id", business.id);
        if (dueError) return { error: dueError.message };
      }

      if (paymentMode === "partial") {
        const { error: paidError } = await supabase.from("debts").update({ paid: received }).eq("id", debtId).eq("business_id", business.id);
        if (paidError) return { error: paidError.message };
        const { error: paymentError } = await supabase.from("debt_payments").insert({
          business_id: business.id,
          debt_id: debtId,
          amount: received,
          kind: "initial",
        });
        if (paymentError) return { error: paymentError.message };
      }
    }

    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/debts");
    revalidatePath("/customers");
    return { error: "" };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Could not record the sale" };
  }
}

export async function voidSaleAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!id) return { error: "Sale not found" };
  if (!reason) return { error: "Add a reason for voiding this sale" };
  const business = await getCurrentBusiness();
  if (!business) return { error: "Create your business first" };
  if (business.role !== "owner") return { error: "Only the owner can void a sale" };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("void_sale", { p_sale_id: id, p_reason: reason });
  if (error) return { error: error.message };

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/debts");
  revalidatePath("/customers");
  revalidatePath("/close");
  return { error: "", result: data };
}
