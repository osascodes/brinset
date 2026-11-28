import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 text-zinc-950">
      <Link href="/" className="text-sm text-zinc-500">← Back</Link>
      <h1 className="mt-4 text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-4 text-sm leading-6 text-zinc-600">
        By creating a Brinset account you agree to use the product for your own business records,
        keep your login details private, and make sure the sales, debts, and staff access you record are accurate.
        Brinset provides the tools. You remain responsible for your business data and how you share it.
      </p>
    </main>
  );
}
