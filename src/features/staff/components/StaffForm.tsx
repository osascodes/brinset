"use client";

import { useState } from "react";
import { createStaffAction, resendStaffInviteAction } from "@/features/staff/actions";
import { staffRoles } from "@/features/staff/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Invite = {
  id: string;
  name: string;
  email: string;
  role: string;
  invite_code: string;
  invite_expires_at: string | null;
  emailSent: boolean;
  emailError: string;
};

function expiry(value: string | null) {
  if (!value) return "14 days";
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
}

export default function StaffForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-4">
      <form
        className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5"
        action={async (formData) => {
          setErrorMessage("");
          setPending(true);
          try {
            const created = await createStaffAction(formData);
            setInvite(created);
          } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : "Could not add staff.");
          } finally {
            setPending(false);
          }
        }}
      >
        {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
        <div className="space-y-1.5">
          <Label className="text-zinc-600">Full name</Label>
          <Input name="name" placeholder="Ada Okafor" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-600">Phone</Label>
          <Input name="phone" placeholder="08012345678" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-600">Email</Label>
          <Input name="email" type="email" placeholder="ada@shop.com" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-600">Role</Label>
          <select name="role" defaultValue="Sales" className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950">
            {staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
        <Button type="submit" className="h-11 w-full bg-[#635BFF] text-white hover:bg-[#635BFF]/90" disabled={pending}>
          {pending ? "Inviting..." : "Invite staff"}
        </Button>
      </form>

      {invite ? (
        <div className="rounded-2xl border border-[#635BFF]/30 bg-[#635BFF]/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">{invite.name}</p>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Pending</span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">{invite.email} · {invite.role}</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-zinc-400">Invitation code</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-widest">{invite.invite_code}</p>
          <p className="mt-1 text-xs text-zinc-500">Expires {expiry(invite.invite_expires_at)}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(invite.invite_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy code"}
            </button>
            {!invite.emailSent ? (
              <button
                type="button"
                className="h-9 rounded-lg bg-[#635BFF] px-3 text-sm text-white"
                onClick={async () => {
                  const formData = new FormData();
                  formData.set("id", invite.id);
                  const resent = await resendStaffInviteAction(formData);
                  setInvite(resent);
                }}
              >
                Retry email
              </button>
            ) : null}
          </div>
          <p className={`mt-2 text-xs ${invite.emailSent ? "text-emerald-600" : "text-amber-700"}`}>
            {invite.emailSent ? "Invitation email sent." : invite.emailError || "Email was not sent. You can still share the code."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
