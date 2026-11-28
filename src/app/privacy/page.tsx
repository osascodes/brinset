import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 text-zinc-950">
      <Link href="/" className="text-sm text-zinc-500">← Back</Link>
      <h1 className="mt-4 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-6 text-zinc-600">
        Brinset stores your account, shop, sales, and customer records so you can run your business.
        Your shop data is only available to your account and the staff you invite. We do not sell your business records.
      </p>
    </main>
  );
}
