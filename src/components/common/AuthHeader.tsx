import Link from "next/link";

export default function AuthHeader() {
  return (
    <Link href="/" aria-label="Brinset home" className="mb-2 flex justify-center">
      <img src="/brinset-logo.png" alt="Brinset" className="h-11 w-auto object-contain" />
    </Link>
  );
}
