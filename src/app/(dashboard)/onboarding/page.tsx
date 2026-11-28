"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { onboardingSchema } from "@/features/business/schema";
import { createBusinessAction } from "@/features/business/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormData = z.infer<typeof onboardingSchema>;

const setupCategories = [
  "Fashion",
  "Electronics",
  "Supermarket/Grocery",
  "Beauty & Cosmetics",
  "Food & Drinks",
  "Other",
] as const;

function previewSlug(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
  return base || "your-shop";
}

export default function OnboardingPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", phone: "", category: "Fashion" },
  });
  const name = form.watch("name");
  const slug = previewSlug(name);

  const onSubmit = async (data: FormData) => {
    setErrorMessage("");
    setPending(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("category", data.category);
      await createBusinessAction(formData);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save business.");
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-4 flex justify-center">
          <img src="/brinset-logo.png" alt="Brinset" className="h-11 w-auto object-contain" />
        </Link>
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span>Step 2 of 2</span>
            <span>Shop setup</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-zinc-100">
            <div className="h-1.5 w-full rounded-full bg-[#635BFF]" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-950">Tell us about your business</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          This creates your storefront link and keeps inventory, sales, and debts under one shop.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {errorMessage ? <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600">{errorMessage}</div> : null}
          <div className="space-y-1.5">
            <Label className="text-zinc-600">Business name</Label>
            <Input {...form.register("name")} placeholder="Ada Fashion" />
            <p className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
              Storefront link: brinset.shop/<span className="font-medium text-[#635BFF]">{slug}</span>
            </p>
            {form.formState.errors.name ? <p className="text-xs text-red-500">{form.formState.errors.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-600">Business phone</Label>
            <div className="flex overflow-hidden rounded-lg border border-zinc-300 focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/30">
              <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500">+234</span>
              <Input {...form.register("phone")} type="tel" placeholder="0801 234 5678" className="border-0 focus-visible:ring-0" />
            </div>
            {form.formState.errors.phone ? <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-600">Business category</Label>
            <select
              {...form.register("category")}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/30"
            >
              {setupCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="h-11 w-full bg-[#635BFF] text-white hover:bg-[#635BFF]/90" disabled={pending}>
            {pending ? "Saving..." : "Continue to dashboard"}
          </Button>
        </form>
      </div>
    </main>
  );
}
