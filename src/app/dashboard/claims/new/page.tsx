import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClaimForm } from "@/components/forms/claim-form";
import { PageHeader } from "@/components/dashboard/common";
import { getCurrentProfile } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Start a claim",
  robots: { index: false, follow: false },
};

export default async function NewClaimPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <Link
        href="/dashboard/claims"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to my claims
      </Link>

      <PageHeader
        title="Start a claim"
        description="Four short sections. Everything is validated before the case is submitted, and you receive a reference as soon as it is."
      />

      <ClaimForm
        defaultName={profile?.full_name ?? ""}
        defaultEmail={profile?.email ?? ""}
        defaultCountry={profile?.country ?? ""}
      />
    </div>
  );
}
