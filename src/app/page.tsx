import Link from "next/link";
import Navbar from "@/components/navbar";
import FaqList from "@/components/marketing/FaqList";
import {
  ShoppingCart,
  Package,
  Truck,
  BarChart3,
  Receipt,
  Users,
  CreditCard,
  TrendingUp,
  Store,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Star,
  Link as LinkIcon,
  Wallet,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   TOOLS — 8 capabilities shown after hero (like reference image 2)
   Each has its own distinct icon color matching the reference.
───────────────────────────────────────────────────────────────── */
const tools = [
  {
    icon: ShoppingCart,
    title: "Sales",
    desc: "Record and manage your sales with ease. Keep clear records of every transaction.",
    iconColor: "#635BFF",
    iconBg: "#F0EFFF",
  },
  {
    icon: Package,
    title: "Inventory",
    desc: "Track your stock in real time and get low-stock alerts before you run out.",
    iconColor: "#F97316",
    iconBg: "#FFF3EA",
  },
  {
    icon: Truck,
    title: "Orders",
    desc: "Manage customer orders from start to finish with a clear fulfilment flow.",
    iconColor: "#3B82F6",
    iconBg: "#EFF6FF",
  },
  {
    icon: Users,
    title: "Customers",
    desc: "Keep customer details and history organised and coming back for more.",
    iconColor: "#8B5CF6",
    iconBg: "#F5F3FF",
  },
  {
    icon: Receipt,
    title: "Receipts",
    desc: "Generate, store and share receipts with customers anytime, anywhere.",
    iconColor: "#14B8A6",
    iconBg: "#F0FDFB",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Understand your performance with clean reports and clear business insights.",
    iconColor: "#635BFF",
    iconBg: "#F0EFFF",
  },
  {
    icon: BookOpen,
    title: "Debt Ledger",
    desc: "Keep a precise record of customer credit and track outstanding balances.",
    iconColor: "#F59E0B",
    iconBg: "#FFFBEB",
  },
  {
    icon: TrendingUp,
    title: "Profit Tracking",
    desc: "Know exactly what you earn after costs. Brinset calculates net profit automatically.",
    iconColor: "#10B981",
    iconBg: "#F0FDF4",
  },
];

/* ─────────────────────────────────────────────────────────────────
   HUB nodes for "Everything works together"
───────────────────────────────────────────────────────────────── */
const hubNodes = [
  { label: "Sales",     icon: ShoppingCart, angle: -60,  color: "#635BFF", bg: "#F0EFFF" },
  { label: "Inventory", icon: Package,      angle:   0,  color: "#F97316", bg: "#FFF3EA" },
  { label: "Orders",    icon: Truck,        angle:  60,  color: "#3B82F6", bg: "#EFF6FF" },
  { label: "Customers", icon: Users,        angle: 120,  color: "#8B5CF6", bg: "#F5F3FF" },
  { label: "Receipts",  icon: Receipt,      angle: 180,  color: "#14B8A6", bg: "#F0FDFB" },
  { label: "Analytics", icon: BarChart3,    angle: 240,  color: "#635BFF", bg: "#F0EFFF" },
];

/* ─────────────────────────────────────────────────────────────────
   STEPS
───────────────────────────────────────────────────────────────── */
const steps = [
  {
    num: 1,
    icon: Users,
    title: "Create your account",
    desc: "Sign up and set up your business in just a few minutes.",
  },
  {
    num: 2,
    icon: Package,
    title: "Add your products",
    desc: "List your products, set your prices and update your stock.",
  },
  {
    num: 3,
    icon: BarChart3,
    title: "Manage your business",
    desc: "Track sales, view reports, and keep your customers happy.",
  },
];

/* ─────────────────────────────────────────────────────────────────
   BUSINESS TYPES
───────────────────────────────────────────────────────────────── */
const bizTypes = [
  { label: "Fashion & Lifestyle" },
  { label: "Retail Stores" },
  { label: "Food & Beverages" },
  { label: "Beauty & Cosmetics" },
  { label: "Gadgets & Electronics" },
  { label: "And more" },
];

/* ─────────────────────────────────────────────────────────────────
   PRICING features
───────────────────────────────────────────────────────────────── */
const starterFeatures = [
  "1 shop",
  "Public storefront link",
  "Inventory and sales",
  "Receipt generation",
  "Customers and debt ledger",
  "Expense tracking",
  "Basic sales reports",
];

const proFeatures = [
  "Everything in Starter",
  "Staff accounts and invite codes",
  "Order tracker",
  "Offline sales, costs and stock",
  "Full analytics dashboard",
  "WhatsApp receipt sharing",
  "Store logo, cover and social links",
];

const trialFeatures = [
  "Full Pro access",
  "No credit card required",
  "14 days completely free",
  "Upgrade or choose a plan after",
];

/* ─────────────────────────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────────────────────────── */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#635BFF]/20 bg-[#635BFF]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#635BFF]">
      {children}
    </span>
  );
}

function Check({ purple }: { purple?: boolean }) {
  return (
    <CheckCircle2
      size={15}
      className={purple ? "shrink-0 text-[#635BFF]" : "shrink-0 text-zinc-400"}
      strokeWidth={2}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-zinc-900">
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white px-5 pb-24 pt-14 md:pt-20">
        {/* Very subtle bg tint top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[520px] w-[520px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(99,91,255,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          {/* Left copy */}
          <div className="text-center lg:text-left">
            <Pill>All-in-one business management platform</Pill>

            <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-zinc-950 sm:text-5xl lg:text-[3.3rem]">
              Your business,{" "}
              <span className="text-[#635BFF]">organised</span>{" "}
              in one place.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-zinc-500 lg:mx-0">
              Manage sales, inventory, orders, customers and business
              performance from one simple platform.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#635BFF] px-8 text-sm font-semibold text-white shadow-lg shadow-[#635BFF]/25 transition hover:opacity-90 sm:w-auto"
              >
                Get started for free
              </Link>
              <button className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-200 px-7 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 sm:w-auto">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="#635BFF">
                    <path d="M0 0l10 6-10 6V0z" />
                  </svg>
                </span>
                Watch demo
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              {["No credit card required", "Set up in minutes", "Free forever plan"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <CheckCircle2 size={13} className="text-[#635BFF]" strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Dashboard product screenshot */}
          <div className="relative mx-auto w-full max-w-[620px]">
            {/* Subtle purple blob behind the card */}
            <div
              aria-hidden
              className="absolute -right-6 -top-6 h-48 w-48 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, #635BFF 0%, transparent 70%)" }}
            />

            <div className="relative rounded-2xl border border-zinc-200/80 bg-white shadow-2xl shadow-zinc-300/40 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <img src="/brinset-logo.png" alt="Brinset" className="h-5 w-auto" />
                  <span className="text-xs font-semibold text-zinc-700">Brinset</span>
                </div>
                <span className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-400">
                  This week ▾
                </span>
              </div>

              <div className="flex" style={{ height: 370 }}>
                {/* Sidebar */}
                <div className="hidden w-32 shrink-0 flex-col border-r border-zinc-100 bg-zinc-50/60 p-3 sm:flex">
                  {["Home", "Sales", "Products", "Orders", "Customers", "Analytics", "Receipts", "Settings"].map((item) => (
                    <div
                      key={item}
                      className={`mb-0.5 flex items-center rounded-lg px-2.5 py-[7px] text-[11px] font-medium ${
                        item === "Home"
                          ? "bg-[#635BFF] text-white"
                          : "text-zinc-400"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main panel */}
                <div className="flex-1 overflow-hidden p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Good morning 👋</p>
                      <p className="text-[11px] text-zinc-400">Here&apos;s what&apos;s happening in your business today</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-[#635BFF]/20" />
                    </div>
                  </div>

                  {/* KPI cards */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Total Sales", val: "₦482,000", change: "+12%", up: true },
                      { label: "Orders", val: "38", change: "↑ 8%", up: true },
                      { label: "Products", val: "156", change: "", up: true },
                    ].map(({ label, val, change, up }) => (
                      <div key={label} className="rounded-xl border border-zinc-100 bg-white p-2.5 shadow-sm">
                        <p className="text-[9px] text-zinc-400">{label}</p>
                        <p className="mt-0.5 text-sm font-bold text-zinc-900 leading-none">{val}</p>
                        {change && (
                          <p className={`mt-0.5 text-[9px] font-medium ${up ? "text-emerald-500" : "text-red-400"}`}>
                            {change}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { label: "Customers", val: "297", change: "", up: true },
                      { label: "Expenses", val: "₦120,000", change: "", up: false },
                      { label: "Profit", val: "₦362,000", change: "+142%", up: true },
                    ].map(({ label, val, change, up }) => (
                      <div key={label} className="rounded-xl border border-zinc-100 bg-white p-2.5 shadow-sm">
                        <p className="text-[9px] text-zinc-400">{label}</p>
                        <p className="mt-0.5 text-sm font-bold text-zinc-900 leading-none">{val}</p>
                        {change && (
                          <p className={`mt-0.5 text-[9px] font-medium ${up ? "text-emerald-500" : "text-red-400"}`}>
                            {change}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sales trend chart area */}
                  <div className="mt-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-zinc-700">Sales trend</p>
                      <span className="text-[9px] text-zinc-400">This week ▾</span>
                    </div>
                    <div className="mt-2 flex items-end gap-1" style={{ height: 56 }}>
                      {[22, 45, 30, 60, 38, 72, 55].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div
                            className="w-full rounded-t-sm"
                            style={{
                              height: `${h}%`,
                              background: i === 5 ? "#635BFF" : "#E0DEFF",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EVERYTHING WORKS TOGETHER
          pale purple bg, Brinset B logo as hub
      ══════════════════════════════════════ */}
      <section className="border-t border-zinc-100 bg-[#F7F7FF] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">

            {/* Left copy */}
            <div>
              <Pill>The Brinset advantage</Pill>
              <h2 className="mt-5 text-[2rem] font-bold leading-tight text-zinc-950 md:text-[2.5rem]">
                Everything works<br />together.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-500">
                Sales, inventory, orders, customers and records are all
                connected. So you can focus on what really matters —
                growing your business.
              </p>
              <a
                href="#features"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#635BFF] hover:underline"
              >
                Learn more about Brinset <ArrowRight size={14} strokeWidth={2.5} />
              </a>
            </div>

            {/* Centre hub visual */}
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/* Hub */}
              <div className="relative mx-auto flex items-center justify-center" style={{ width: 280, height: 280 }}>
                {/* SVG lines */}
                <svg className="absolute inset-0" width="280" height="280" viewBox="0 0 280 280">
                  {hubNodes.map(({ label, angle }) => {
                    const r = 108;
                    const rad = (angle * Math.PI) / 180;
                    const x = 140 + r * Math.sin(rad);
                    const y = 140 - r * Math.cos(rad);
                    return (
                      <line
                        key={label}
                        x1="140" y1="140"
                        x2={x} y2={y}
                        stroke="#635BFF"
                        strokeWidth="1"
                        strokeOpacity="0.2"
                        strokeDasharray="4 3"
                      />
                    );
                  })}
                </svg>

                {/* Spoke nodes */}
                {hubNodes.map(({ label, icon: Icon, angle, color, bg }) => {
                  const r = 108;
                  const rad = (angle * Math.PI) / 180;
                  const x = 140 + r * Math.sin(rad);
                  const y = 140 - r * Math.cos(rad);
                  return (
                    <div
                      key={label}
                      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                      style={{ left: x, top: y }}
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white shadow-md"
                        style={{ background: bg }}
                      >
                        <Icon size={18} style={{ color }} strokeWidth={1.75} />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-500">{label}</span>
                    </div>
                  );
                })}

                {/* Centre — Brinset B logo on purple circle */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center rounded-full bg-[#635BFF] shadow-xl shadow-[#635BFF]/40">
                  <img
                    src="/brinset-b-logo.png"
                    alt="Brinset"
                    className="h-12 w-12 object-contain"
                  />
                </div>
              </div>

              {/* Right callout card */}
              <div className="w-full max-w-[200px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-zinc-900">One platform.<br />Total control.</p>
                <p className="mt-2 text-[12px] leading-5 text-zinc-500">
                  Everything you need to run your business, without
                  juggling multiple apps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TOOLS — 8 capabilities
          White bg, 4-col grid
      ══════════════════════════════════════ */}
      <section id="features" className="border-t border-zinc-100 bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <Pill>Features</Pill>
          <h2 className="mt-4 text-3xl font-bold text-zinc-950 md:text-[2.2rem]">
            Tools to run your business better.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            Powerful features designed to make your work easier, faster and more efficient.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map(({ icon: Icon, title, desc, iconColor, iconBg }) => (
              <div
                key={title}
                className="group flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-zinc-200"
              >
                {/* Coloured icon tile */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: iconBg }}
                >
                  <Icon size={18} strokeWidth={2} style={{ color: iconColor }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-zinc-500">{desc}</p>
                </div>
                <span
                  className="flex items-center gap-1 text-[11px] font-semibold"
                  style={{ color: iconColor }}
                >
                  Learn more <ArrowRight size={11} strokeWidth={2.5} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section id="how-it-works" className="border-t border-zinc-100 bg-[#F7F7FF] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <Pill>How it works</Pill>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-zinc-950 md:text-[2.2rem]">
                Get started in<br />three simple steps.
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                You can be up and running in minutes. No technical skills
                required.
              </p>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#635BFF]"
              >
                See full guide <ArrowRight size={13} strokeWidth={2.5} />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map(({ num, icon: Icon, title, desc }, i) => (
                <div key={num} className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  {i < steps.length - 1 && (
                    <div className="absolute -right-5 top-8 z-10 hidden sm:block">
                      <ArrowRight size={16} className="text-zinc-300" strokeWidth={1.5} />
                    </div>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#635BFF] text-sm font-bold text-white">
                    {num}
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-zinc-900">{title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BUILT FOR
      ══════════════════════════════════════ */}
      <section id="about" className="border-t border-zinc-100 bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <Pill>Built for</Pill>
          <div className="mt-5 grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-zinc-950 md:text-[2.2rem]">
                Perfect for all kinds of small businesses.
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Whether you sell online, in a physical store, or both —
                Brinset is built for you.
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-2.5">
                {bizTypes.map(({ label }) => (
                  <span
                    key={label}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-start gap-4 rounded-2xl border border-zinc-200 bg-[#F7F7FF] p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#635BFF]/10">
                  <BarChart3 size={16} className="text-[#635BFF]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Different businesses. Same goal.</p>
                  <p className="mt-1 text-[13px] leading-5 text-zinc-500">
                    More sales. Less stress. That&apos;s Brinset.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING — 3-col cards (ref image 1)
      ══════════════════════════════════════ */}
      <section id="pricing" className="border-t border-zinc-100 bg-[#F7F7FF] px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <Pill>Pricing</Pill>
          <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="text-3xl font-bold text-zinc-950 md:text-[2.2rem]">
              Simple, transparent pricing.
            </h2>
            <p className="max-w-xs text-sm leading-6 text-zinc-500">
              Choose a plan that fits your business. Upgrade anytime.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {/* Free Trial */}
            <article className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <ShoppingCart size={18} className="text-zinc-500" strokeWidth={2} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">Free trial</p>
              <p className="text-sm text-zinc-500">Perfect for new businesses</p>
              <p className="mt-4 text-4xl font-bold text-zinc-900">14-Day</p>
              <p className="mt-1 text-sm text-zinc-400">Free Trial</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {trialFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 transition hover:border-zinc-500"
              >
                Get started
              </Link>
            </article>

            {/* Starter */}
            <article className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <Users size={18} className="text-zinc-500" strokeWidth={2} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">Starter</p>
              <p className="text-sm text-zinc-500">Returned businesses</p>
              <p className="mt-4 text-4xl font-bold text-zinc-900">₦5,000</p>
              <p className="mt-1 text-sm text-zinc-400">per month</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {starterFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 transition hover:border-zinc-500"
              >
                Choose Starter
              </Link>
            </article>

            {/* Pro — most popular */}
            <article className="relative flex flex-col rounded-3xl border border-[#635BFF]/30 bg-white p-7 shadow-xl shadow-[#635BFF]/10 ring-1 ring-[#635BFF]/15">
              <span className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-[#635BFF] px-3 py-1 text-[11px] font-bold text-white">
                <Star size={9} fill="white" strokeWidth={0} />
                Most popular
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/10">
                <Star size={18} className="text-[#635BFF]" strokeWidth={2} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#635BFF]">Pro</p>
              <p className="text-sm text-zinc-500">Email support</p>
              <p className="mt-4 text-4xl font-bold text-zinc-900">₦10,000</p>
              <p className="mt-1 text-sm text-zinc-400">per month</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <Check purple />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-lg bg-[#635BFF] text-sm font-bold text-white shadow-md shadow-[#635BFF]/30 transition hover:opacity-90"
              >
                Start Pro
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className="border-t border-zinc-100 bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-start">
          <div>
            <Pill>FAQ</Pill>
            <h2 className="mt-5 text-3xl font-bold leading-tight text-zinc-950 md:text-[2.2rem]">
              Frequently asked<br />questions.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Find answers to the most common questions about Brinset.
            </p>
          </div>
          <FaqList />
        </div>
      </section>

      {/* ══════════════════════════════════════
          BOTTOM CTA BANNER (from ref image 1)
      ══════════════════════════════════════ */}
      <section className="bg-white px-5 pb-16 pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-[#635BFF] px-8 py-12 text-center sm:flex-row sm:text-left md:px-14">
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Ready to take control of your business?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
                Join thousands of businesses using Brinset to sell, manage
                and grow with confidence.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#635BFF] shadow-lg transition hover:opacity-90 whitespace-nowrap"
            >
              Get started for free <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="border-t border-zinc-100 bg-white px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[200px]">
              <Link href="/">
                <img src="/brinset-logo.png" alt="Brinset" className="h-7 w-auto object-contain" />
              </Link>
              <p className="mt-3 text-[13px] leading-5 text-zinc-400">Run your business. Your way.</p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Product</p>
                <ul className="mt-3 space-y-2.5">
                  <li><a href="/" className="text-sm text-zinc-500 hover:text-zinc-900">Home</a></li>
                  <li><a href="#features" className="text-sm text-zinc-500 hover:text-zinc-900">Features</a></li>
                  <li><a href="#how-it-works" className="text-sm text-zinc-500 hover:text-zinc-900">How it works</a></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Plans</p>
                <ul className="mt-3 space-y-2.5">
                  <li><Link href="/pricing" className="text-sm text-zinc-500 hover:text-zinc-900">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Account</p>
                <ul className="mt-3 space-y-2.5">
                  <li><Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900">Sign In</Link></li>
                  <li><Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-900">Get Started</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Company</p>
                <ul className="mt-3 space-y-2.5">
                  <li><a href="#about" className="text-sm text-zinc-500 hover:text-zinc-900">About</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-6 sm:flex-row">
            <p className="text-xs text-zinc-400">© 2026 Brinset. All rights reserved.</p>
            <div className="flex gap-5">
              <a href="/" className="text-xs text-zinc-400 hover:text-zinc-700">Home</a>
              <a href="#features" className="text-xs text-zinc-400 hover:text-zinc-700">Features</a>
              <Link href="/pricing" className="text-xs text-zinc-400 hover:text-zinc-700">Pricing</Link>
              <a href="#about" className="text-xs text-zinc-400 hover:text-zinc-700">About</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
