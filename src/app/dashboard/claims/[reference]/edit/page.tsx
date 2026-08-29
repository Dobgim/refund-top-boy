import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { ClaimForm } from "@/components/forms/claim-form";
import { getMyClaim } from "@/lib/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import type { ClaimStatus } from "@/types";

export const metadata: Metadata = {
  title: "Edit claim",
  robots: { index: false, follow: false },
};

/** Mirrors the database policy in supabase/06_owner_edit.sql. */
const EDITABLE: ClaimStatus[] = ["submitted", "documents_required", "under_review"];

type Params = Promise<{ reference: string }>;

export default async function EditClaimPage({ params }: { params: Params }) {
  const { reference } = await params;
  const [{ data: claim }, profile] = await Promise.all([getMyClaim(reference), getCurrentProfile()]);

  if (!claim) notFound();

  // A decided case is frozen, so the decision keeps referring to the evidence
  // it was actually made on.
  if (!EDITABLE.includes(claim.status)) {
    redirect(`/dashboard/claims/${claim.reference}?locked=1`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <Link
        href={`/dashboard/claims/${claim.reference}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to the case
      </Link>

      <PageHeader
        title={`Edit ${claim.reference}`}
        description="Correct anything you got wrong, attach any missing evidence, and resubmit. Your reviewer is told the case was updated."
      />

      <Alert tone="info" title="Your reference stays the same">
        Editing does not create a new case. The history, documents and messages already on{" "}
        {claim.reference} are kept.
      </Alert>

      <ClaimForm
        defaultName={profile?.full_name ?? ""}
        defaultEmail={profile?.email ?? ""}
        defaultCountry={profile?.country ?? ""}
        editing={{
          id: claim.id,
          reference: claim.reference,
          contactName: claim.contact_name,
          contactEmail: claim.contact_email,
          country: claim.country ?? "",
          transactionDate: claim.transaction_date ?? "",
          transactionType: claim.transaction_type ?? "",
          amount: claim.amount,
          currency: claim.currency as never,
          transactionReference: claim.transaction_reference ?? "",
          claimType: claim.claim_type,
          reason: claim.reason,
          description: claim.description,
          supportingDetails: claim.supporting_details ?? "",
        }}
      />
    </div>
  );
}
