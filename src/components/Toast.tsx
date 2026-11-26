"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; tone: "ok" | "error" };

export function toast(message: string, tone: "ok" | "error" = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("brinset-toast", { detail: { message, tone } }));
}

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; tone?: "ok" | "error" }>).detail;
      if (!detail?.message) return;
      const id = Date.now() + Math.random();
      setItems((current) => [...current.slice(-2), { id, message: detail.message, tone: detail.tone || "ok" }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3200);
    };
    window.addEventListener("brinset-toast", onToast);
    return () => window.removeEventListener("brinset-toast", onToast);
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <div key={item.id} className={`pointer-events-auto rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${item.tone === "error" ? "bg-rose-600" : "bg-[#635BFF]"}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
