import Link from "next/link";
import { Store, UserRound } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function StartPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: paused } = user
    ? await supabase.from("staff_members").select("id").eq("user_id", user.id).eq("active", false).limit(1)
    : { data: [] };
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-zinc-950">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-5 flex justify-center">
          <img src="/brinset-logo.png" alt="Brinset" className="h-11 w-auto object-contain" />
        </Link>
        {paused && paused.length > 0 ? <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Your staff access is paused. Ask the shop owner to activate it again.</p> : null}
        <h1 className="text-center text-2xl font-semibold">How are you joining?</h1>
        <p className="mt-2 text-center text-sm leading-6 text-zinc-500">You're signed in! Choose how you want to use Brinset.</p>
        <div className="mt-6 space-y-3">
          <Link href="/onboarding" className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 hover:border-[#635BFF] hover:bg-[#635BFF]/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#635BFF]/10 text-[#635BFF]">
              <Store className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold">I am a shop owner</span>
              <span className="mt-0.5 block text-sm text-zinc-500">Set up a new shop, track inventory, and manage sales.</span>
            </span>
          </Link>
          <Link href="/join" className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 hover:border-[#635BFF] hover:bg-[#635BFF]/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#635BFF]/10 text-[#635BFF]">
              <UserRound className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold">I am a staff member</span>
              <span className="mt-0.5 block text-sm text-zinc-500">Join an existing shop using an invite code from the owner.</span>
            </span>
          </Link>
        </div>
        <form action={logoutAction} className="mt-8 text-center">
          <button type="submit" className="text-sm text-zinc-400 hover:text-zinc-700">
            Signed in with the wrong account? Log out
          </button>
        </form>
      </div>
    </main>
  );
}
