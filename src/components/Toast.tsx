"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; tone: "ok" | "error" };

let pushToast: ((message: string, tone?: "ok" | "error") => void) | null = null;

export function toast(message: string, tone: "ok" | "error" = "ok") {
  pushToast?.(message, tone);
}

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    pushToast = (message, tone = "ok") => {
      const id = Date.now();
      setItems((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 2500);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <div key={item.id} className={`pointer-events-auto rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${item.tone === "error" ? "bg-rose-600 text-white" : "bg-zinc-950 text-white"}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
