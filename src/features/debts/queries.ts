import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";

export async function getCustomers() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDebts() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("debts")
    .select("id, amount, paid, note, created_at, status, due_date, sales(status), customers(name, phone)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });
  return (data ?? []).map((debt) => {
    const sale = Array.isArray(debt.sales) ? debt.sales[0] : debt.sales;
    return { ...debt, status: debt.status === "voided" || sale?.status === "voided" ? "voided" : debt.status };
  });
}

export async function getDebtsDue() {
  const debts = await getDebts();
  return debts.filter((debt) => debt.status !== "voided").reduce((sum, debt) => sum + Math.max(0, Number(debt.amount) - Number(debt.paid)), 0);
}

export async function getDebtsOwed() {
  const debts = await getDebts();
  return debts
    .filter((debt) => debt.status !== "voided")
    .map((debt) => ({
      id: debt.id,
      name: (Array.isArray(debt.customers) ? debt.customers[0]?.name : (debt.customers as { name?: string } | null)?.name) || "Customer",
      left: Math.max(0, Number(debt.amount) - Number(debt.paid)),
    }))
    .filter((debt) => debt.left > 0);
}

export async function getRecentDebts() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("debts")
    .select("id, amount, paid, created_at, status, customers(name), debt_payments(amount, kind, created_at)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []).filter((debt) => debt.status !== "voided").map((debt) => {
    const customers = debt.customers as { name?: string } | { name?: string }[] | null;
    const name = Array.isArray(customers) ? customers[0]?.name : customers?.name;
    const payments = (debt.debt_payments ?? []) as { amount: number; kind?: string; created_at?: string }[];
    const initial = payments
      .filter((payment) => payment.kind === "initial" || (!payment.kind && payment.created_at && Math.abs(new Date(payment.created_at).getTime() - new Date(debt.created_at).getTime()) < 120000))
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    return {
      id: debt.id,
      name: name || "Customer",
      amount: Math.max(0, Number(debt.amount) - initial),
      createdAt: debt.created_at as string,
    };
  });
}

export async function getRecentDebtPayments() {
  const business = await getCurrentBusiness();
  if (!business) return [];
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("debt_payments")
    .select("id, amount, created_at, kind, debts(customers(name))")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) return [];
  return (data ?? []).map((payment) => {
    const debt = (Array.isArray(payment.debts) ? payment.debts[0] : payment.debts) as { customers?: { name?: string } | { name?: string }[] } | null;
    const customers = debt?.customers;
    const name = Array.isArray(customers) ? customers[0]?.name : customers?.name;
    return {
      id: payment.id,
      name: name || "Customer",
      amount: Number(payment.amount),
      kind: payment.kind === "initial" ? "initial" : "later",
      createdAt: payment.created_at as string,
    };
  });
}
