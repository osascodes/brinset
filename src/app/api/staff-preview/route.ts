import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase() || "";
  if (code.length !== 6) return NextResponse.json({ name: null });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("preview_staff_shop", { p_code: code });
  if (error) return NextResponse.json({ name: null });
  return NextResponse.json({ name: data || null });
}
