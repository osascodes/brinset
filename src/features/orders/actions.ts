"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { revalidatePath } from "next/cache";

function orderNumber() {
  return `BF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function placeCartAction(input: {
  businessId: string;
  slug: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: { productId: string; productName: string; quantity: number }[];
}) {
  if (input.customerName.trim().length < 2) throw new Error("Name is required");
  if (input.customerPhone.trim().length < 10) throw new Error("Phone is required");
  if (input.deliveryAddress.trim().length < 5) throw new Error("Delivery address is required");
  if (input.items.length === 0) throw new Error("Add a product first");

  const supabase = await createServerSupabase();
  const number = orderNumber();
  const rows = input.items.map((item) => ({
    business_id: input.businessId,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    delivery_address: input.deliveryAddress.trim(),
    order_number: number,
  }));

  const { error } = await supabase.from("orders").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath(`/store/${input.slug}`);
  revalidatePath("/storefront");
  return { orderNumber: number };
}

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("order_id") || "");
  const status = String(formData.get("status") || "");
  if (!orderId || !["pending", "packed", "out", "done", "cancelled"].includes(status)) return { error: "Invalid order" };

  const business = await getCurrentBusiness();
  if (!business) return { error: "Create your business first" };

  const supabase = await createServerSupabase();
  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, order_number, product_id, product_name, quantity")
    .eq("id", orderId)
    .eq("business_id", business.id)
    .single();
  if (readError || !order) return { error: readError?.message || "Order not found" };

  let groupQuery = supabase.from("orders").select("id, product_id, product_name, quantity").eq("business_id", business.id);
  groupQuery = order.order_number ? groupQuery.eq("order_number", order.order_number) : groupQuery.eq("id", orderId);
  const { data: group } = await groupQuery;
  const rows = group && group.length > 0 ? group : [order];

  if (status === "done") {
      const { error: completeError } = await supabase.rpc("complete_store_order", { p_order_id: orderId });
      if (completeError) return { error: completeError.message };
  } else {
    let query = supabase.from("orders").update({ status }).eq("business_id", business.id);
    query = order.order_number ? query.eq("order_number", order.order_number) : query.eq("id", orderId);
    const { error } = await query;
    if (error) return { error: error.message };
  }

  revalidatePath("/storefront");
  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return { error: "" };
}
