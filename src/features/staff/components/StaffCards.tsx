"use client";

import { useState } from "react";
import { resendStaffInviteAction, toggleStaffAction } from "@/features/staff/actions";
import { Button } from "@/components/ui/button";

type Member = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  active: boolean;
  invite_code: string | null;
  user_id: string | null;
  invite_expires_at: string | null;
  invite_revoked_at: string | null;
};

function statusOf(member: Member) {
  if (member.user_id) return member.active ? "Active" : "Paused";
  if (member.invite_revoked_at || !member.active) return "Revoked";
  return "Pending";
}

export default function StaffCards({ members, emailConfigured }: { members: Member[]; emailConfigured: boolean }) {
  const [copied, setCopied] = useState("");
  const [message, setMessage] = useState("");
  const pendingMembers = members.filter((member) => statusOf(member) === "Pending");
  const joinedMembers = members.filter((member) => statusOf(member) !== "Pending");

  function renderMember(member: Member) {
    const status = statusOf(member);
    const pending = status === "Pending";
    return (
      <div key={member.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold text-zinc-950">{member.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">{member.email}</p>
            <p className="mt-1 text-sm text-zinc-700">{member.role} · {status}</p>
            {pending ? (
              <>
                <p className="mt-2 text-sm font-medium text-zinc-950">Code: {member.invite_code}</p>
                <p className="mt-1 text-xs text-zinc-500">Expires {member.invite_expires_at ? new Date(member.invite_expires_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "Africa/Lagos" }) : "in 14 days"}</p>
              </>
            ) : null}
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${status === "Active" ? "bg-emerald-50 text-emerald-700" : status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-600"}`}>{status}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {pending ? (
            <>
              <Button type="button" variant="outline" className="h-9" onClick={() => { navigator.clipboard.writeText(member.invite_code || ""); setCopied(member.id); }}>
                {copied === member.id ? "Copied" : "Copy code"}
              </Button>
              {emailConfigured ? (
                <form action={async (formData) => {
                  const result = await resendStaffInviteAction(formData);
                  setMessage(result.emailSent ? "Invitation email sent." : result.emailError || "Email was not sent.");
                }}>
                  <input type="hidden" name="id" value={member.id} />
                  <Button type="submit" variant="outline" className="h-9">Retry email</Button>
                </form>
              ) : <p className="text-xs text-zinc-500">Email delivery is not configured. Share the code manually.</p>}
            </>
          ) : null}
          <form action={toggleStaffAction}>
            <input type="hidden" name="id" value={member.id} />
            <input type="hidden" name="active" value={String(member.active)} />
            <Button type="submit" variant="outline" className="h-9">{pending ? "Revoke" : member.active ? "Pause" : "Activate"}</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingMembers.length ? <section className="space-y-3"><h2 className="text-sm font-semibold text-zinc-500">Pending invitations</h2>{pendingMembers.map(renderMember)}</section> : null}
      {joinedMembers.length ? <section className="space-y-3"><h2 className="text-sm font-semibold text-zinc-500">Staff</h2>{joinedMembers.map(renderMember)}</section> : null}
      {message ? <p className="text-xs text-zinc-500">{message}</p> : null}
    </div>
  );
}
