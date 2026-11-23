"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/brinset-logo.png" alt="Brinset" className="h-7 w-auto object-contain" />
        </Link>

        {/* Centre nav links */}
        <div className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
          <a href="/" className="hover:text-zinc-950 transition-colors">Home</a>
          <a href="#features" className="hover:text-zinc-950 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">How it works</a>
          <Link href="/pricing" className="hover:text-zinc-950 transition-colors">Pricing</Link>
          <a href="#about" className="hover:text-zinc-950 transition-colors">About</a>
        </div>

        {/* Right actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-950 transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className="flex w-6 flex-col items-end gap-[5px]">
            <span className={`h-[2px] w-full origin-right bg-zinc-950 transition ${open ? "translate-y-[7px] -rotate-45" : ""}`} />
            <span className={`h-[2px] w-3.5 bg-zinc-950 transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-full origin-right bg-zinc-950 transition ${open ? "-translate-y-[7px] rotate-45" : ""}`} />
          </span>
        </button>
      </nav>

      {open && (
        <div className="space-y-1 border-t border-zinc-200 px-4 py-3 md:hidden">
          <a href="/" className="block rounded-xl px-3 py-3 text-sm text-zinc-800" onClick={() => setOpen(false)}>Home</a>
          <a href="#features" className="block rounded-xl px-3 py-3 text-sm text-zinc-800" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="block rounded-xl px-3 py-3 text-sm text-zinc-800" onClick={() => setOpen(false)}>How it works</a>
          <Link href="/pricing" className="block rounded-xl px-3 py-3 text-sm text-zinc-800" onClick={() => setOpen(false)}>Pricing</Link>
          <a href="#about" className="block rounded-xl px-3 py-3 text-sm text-zinc-800" onClick={() => setOpen(false)}>About</a>
          <Link href="/login" className="block rounded-xl px-3 py-3 text-sm text-zinc-800" onClick={() => setOpen(false)}>Sign in</Link>
          <Link href="/register" className="mt-2 flex h-12 items-center justify-center rounded-lg bg-[#635BFF] text-sm font-semibold text-white" onClick={() => setOpen(false)}>
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}
