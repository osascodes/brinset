"use server";

import { randomInt } from "crypto";
import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/features/business/queries";
import { staffSchema } from "./schema";
import { sendStaffInviteEmail } from "./email";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const inviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function inviteCode() {
  return Array.from({ length: 8 }, () => inviteAlphabet[randomInt(inviteAlphabet.length)]).join("");
}

export async function createStaffAction(formData: FormData) {
  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid staff");

  const business = await getCurrentBusiness();
  if (!business || business.role !== "owner") throw new Error("Only the owner can add staff");

  const supabase = await createServerSupabase();
  const email = parsed.data.email.toLowerCase();
  const { data: existing } = await supabase
    .from("staff_members")
    .select("id, name, email, role, invite_code, invite_expires_at")
    .eq("business_id", business.id)
    .eq("email", email)
    .is("user_id", null)
    .eq("active", true)
    .maybeSingle();

  let invite = existing;
  if (!invite) {
    let lastError = "Could not create invite";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = inviteCode();
      const { data, error } = await supabase
        .from("staff_members")
        .insert({
          business_id: business.id,
          name: parsed.data.name,
          phone: parsed.data.phone,
          email,
          role: parsed.data.role,
          invite_code: code,
        })
        .select("id, name, email, role, invite_code, invite_expires_at")
        .single();
      if (!error && data) {
        invite = data;
        break;
      }
      lastError = error?.message || lastError;
      if (error?.code !== "23505") throw new Error(lastError);
    }
  }
  if (!invite) throw new Error("Could not create invite");

  const delivery = await deliverInvite(invite);
  revalidatePath("/staff");
  return { ...invite, ...delivery };
}

async function deliverInvite(invite: { id: string; name: string; email: string; role: string; invite_code: string; invite_expires_at: string | null }) {
  const business = await getCurrentBusiness();
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const headerList = await headers();
  const origin = headerList.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const result = await sendStaffInviteEmail({
    to: invite.email,
    staffName: invite.name,
    ownerName: String(user?.user_metadata?.full_name || user?.email || "The shop owner"),
    shopName: business?.name || "your shop",
    role: invite.role,
    code: invite.invite_code,
    expiresAt: invite.invite_expires_at,
    joinUrl: `${origin}/join?code=${invite.invite_code}`,
  });
  if (result.sent) {
    await supabase.from("staff_members").update({ invite_email_sent_at: new Date().toISOString() }).eq("id", invite.id);
  }
  return { emailSent: result.sent, emailError: result.error || "" };
}

export async function resendStaffInviteAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const business = await getCurrentBusiness();
  if (!business || business.role !== "owner" || !id) throw new Error("Missing invite");
  const supabase = await createServerSupabase();
  const { data: invite, error } = await supabase
    .from("staff_members")
    .select("id, name, email, role, invite_code, invite_expires_at")
    .eq("id", id)
    .eq("business_id", business.id)
    .is("user_id", null)
    .maybeSingle();
  if (error || !invite) throw new Error("Invite not found");
  const delivery = await deliverInvite(invite);
  revalidatePath("/staff");
  return { ...invite, ...delivery };
}

export async function toggleStaffAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  const business = await getCurrentBusiness();
  if (!business || business.role !== "owner" || !id) throw new Error("Missing staff");

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("staff_members")
    .update({ active: !active })
    .eq("id", id)
    .eq("business_id", business.id);
  if (error) throw new Error(error.message);
  revalidatePath("/staff");
}

export async function joinStaffAction(formData: FormData) {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  if (!/^[A-Z0-9]{6,8}$/.test(code)) throw new Error("Enter the invite code");
  if (!email.includes("@")) throw new Error("Enter the invited email");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const supabase = await createServerSupabase();
  const { data: valid, error: previewError } = await supabase.rpc("check_staff_invite", { p_code: code, p_email: email });
  if (previewError) throw new Error(previewError.message);
  if (!valid) throw new Error("Invite code or email is not valid. Use the email the owner invited.");

  const { data: created, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (signUpError) throw new Error(signUpError.message);
  if (!created.session) throw new Error("Turn off Confirm email in Supabase Auth, then try again.");

  const { data: joined, error } = await supabase.rpc("accept_staff_invite", { p_code: code, p_email: email });
  if (error) throw new Error(error.message);
  if (!joined) throw new Error("Could not link this login to the shop");
  revalidatePath("/", "layout");
  const { data: membership } = await supabase.rpc("current_membership");
  const shop = Array.isArray(membership) ? membership[0]?.name : membership?.name;
  redirect(`/dashboard?joined=${encodeURIComponent(shop || "the shop")}`);
}
