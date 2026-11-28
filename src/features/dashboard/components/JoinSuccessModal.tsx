"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinSuccessModal({ shop, role }: { shop: string; role: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="join-success-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <p className="text-3xl" aria-hidden="true">🎉</p>
        <h2 id="join-success-title" className="mt-3 text-2xl font-semibold text-zinc-950">You’re in!</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">You’ve successfully joined {shop} as a {role} staff member.</p>
        <button
          type="button"
          className="mt-5 h-11 w-full rounded-lg bg-[#635BFF] text-sm font-semibold text-white"
          onClick={() => {
            setOpen(false);
            router.replace("/dashboard");
          }}
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
