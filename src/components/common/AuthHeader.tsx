import Link from "next/link";

export default function AuthHeader() {
  return (
    <div className="mb-4 flex flex-col items-center text-center">
      <Link href="/" aria-label="Back to home" className="mb-3">
        <img src="/brinset-logo.png" alt="Brinset" className="h-12 w-auto object-contain" />
      </Link>
      <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-950">
        ← Back to home
      </Link>
      <p className="mt-3 text-sm text-zinc-400">Run your business from anywhere</p>
    </div>
  );
}
