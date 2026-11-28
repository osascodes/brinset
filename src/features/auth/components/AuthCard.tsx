import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AuthHeader from "@/components/common/AuthHeader";

export default function AuthCard({
  children,
  title,
  subtitle,
  backHref = "/",
  backLabel = "← Back",
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <Link href={backHref} className="inline-flex text-sm font-medium text-zinc-500 hover:text-zinc-950">
        {backLabel}
      </Link>
      <div className="mx-auto mt-3 w-full max-w-md">
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="space-y-2 px-5 pt-5">
            <AuthHeader />
            <h2 className="text-center text-xl font-semibold text-zinc-950">{title}</h2>
            {subtitle ? <p className="text-center text-sm leading-6 text-zinc-500">{subtitle}</p> : null}
          </CardHeader>
          <CardContent className="px-5 pb-5">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
