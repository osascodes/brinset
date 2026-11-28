"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { joinStaffAction } from "@/features/staff/actions";
import AuthCard from "@/features/auth/components/AuthCard";
import PasswordInput from "@/features/auth/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JoinPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState("");
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    if (code.length !== 6) {
      setShopName("");
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/staff-preview?code=${encodeURIComponent(code)}`);
        const result = await response.json();
        setShopName(result.name || "");
      } catch {
        setShopName("");
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <AuthCard
      title="Join a shop"
      subtitle="Enter the 6-character invite code shared by your shop owner to set up your staff account."
      backHref="/login"
      backLabel="← Back to log in"
    >
      <form
        className="space-y-3"
        action={async (formData) => {
          setErrorMessage("");
          setPending(true);
          try {
            await joinStaffAction(formData);
          } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : "Could not join.");
            setPending(false);
          }
        }}
      >
        {errorMessage ? <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600">{errorMessage}</p> : null}
        <div className="space-y-1.5">
          <Label>Invite code</Label>
          <Input
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
            placeholder="A1B2C3"
            autoCapitalize="characters"
            required
          />
          {shopName ? <p className="text-xs font-medium text-emerald-600">✓ Joining: {shopName}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input name="name" placeholder="Ada Okafor" autoComplete="name" required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label>Create password</Label>
          <PasswordInput name="password" placeholder="At least 8 characters" autoComplete="new-password" required />
        </div>
        <Button type="submit" className="h-11 w-full bg-[#635BFF] text-white hover:bg-[#635BFF]/90" disabled={pending}>
          {pending ? "Joining..." : "Join shop"}
        </Button>
      </form>
      <p className="mt-3 text-center text-[12px] leading-5 text-zinc-400">
        By creating an account, you agree to Brinset's{' '}
        <Link href="/terms" className="font-medium text-[#635BFF]">Terms of Service</Link> and{' '}
        <Link href="/privacy" className="font-medium text-[#635BFF]">Privacy Policy</Link>.
      </p>
      <div className="mt-4 text-center text-sm text-zinc-500">
        Already joined? <Link href="/login" className="font-medium text-[#635BFF]">Log in</Link>
      </div>
    </AuthCard>
  );
}
