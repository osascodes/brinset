import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/features/business/queries";
import { getStaff } from "@/features/staff/queries";
import StaffForm from "@/features/staff/components/StaffForm";
import StaffCards from "@/features/staff/components/StaffCards";

export default async function StaffPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/onboarding");
  if (business.role !== "owner") redirect("/dashboard");
  const staff = await getStaff();
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Staff</h1>
          <p className="mt-2 text-sm text-zinc-500">Invite a helper. They join with the code at /join.</p>
          <div className="mt-6">
            <StaffForm />
          </div>
        </div>
        <div>
          {staff.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">No staff yet.</div>
          ) : (
            <StaffCards members={staff} emailConfigured={emailConfigured} />
          )}
        </div>
      </div>
    </main>
  );
}
