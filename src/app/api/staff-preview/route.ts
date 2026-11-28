import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const windowMs = 15 * 60 * 1000;
const buckets = new Map<string, { count: number; reset: number }>();

function overLimit(key: string, max: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > max;
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase() || "";
  if (!/^[A-Z0-9]{6,8}$/.test(code)) return NextResponse.json({ name: null });

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  if (overLimit(`ip:${ip}`, 20) || overLimit(`code:${ip}:${code}`, 5)) {
    return NextResponse.json({ name: null, limited: true }, { status: 429 });
  }

  const supabase = await createServerSupabase();
  const { data: allowed, error: guardError } = await supabase.rpc("guard_staff_preview", { p_code: code, p_ip: ip });
  if (guardError || allowed !== true) {
    return NextResponse.json({ name: null, limited: true }, { status: 429 });
  }

  const { data, error } = await supabase.rpc("preview_staff_shop", { p_code: code });
  if (error) return NextResponse.json({ name: null });
  return NextResponse.json({ name: data || null });
}
