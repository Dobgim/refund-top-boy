import type { Metadata } from "next";
import { BadgeCheck, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, Badge, Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/common";
import { VerificationForm } from "@/components/forms/verification-form";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getMyVerification } from "@/lib/queries";
import { ID_DOCUMENT_LABELS, VERIFICATION_META, type IdDocumentType } from "@/lib/verification";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Identity verification",
  robots: { index: false, follow: false },
};

export default async function VerifyPage() {
  const [profile, verification] = await Promise.all([getCurrentProfile(), getMyVerification()]);
  const status = verification?.status ?? profile?.verification_status ?? "unverified";
  const meta = VERIFICATION_META[status];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Identity verification"
        description="A one-time check before your first claim. It confirms the person filing a case is the person the money belongs to."
        action={<Badge tone={meta.tone}>{meta.label}</Badge>}
      />

      {status === "verified" && (
        <Card className="border-mint-500/30 bg-mint-500/5 p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mint-500/15 text-mint-600">
              <BadgeCheck aria-hidden className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
                You are verified
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {verification?.reviewed_at
                  ? `Approved on ${formatDateTime(verification.reviewed_at)}.`
                  : "Your identity has been confirmed."}{" "}
                You can submit refund claims.
              </p>
              <ButtonLink href="/dashboard/claims/new" size="sm" className="mt-4">
                Start a claim
              </ButtonLink>
            </div>
          </div>
        </Card>
      )}

      {status === "pending" && (
        <Card className="border-royal-200 bg-royal-50/50 p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-royal-100 text-royal-700">
              <Clock aria-hidden className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
                Your document is under review
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {verification
                  ? `${ID_DOCUMENT_LABELS[verification.document_type as IdDocumentType]} submitted on ${formatDateTime(verification.created_at)}.`
                  : ""}{" "}
                We will notify you as soon as a reviewer has looked at it. You do not need to do
                anything else.
              </p>
            </div>
          </div>
        </Card>
      )}

      {status === "rejected" && (
        <Alert tone="error" title="Your document could not be accepted">
          {verification?.rejection_reason ??
            "The image was not clear enough to verify. Please upload a better copy."}
        </Alert>
      )}

      {status !== "verified" && status !== "pending" && (
        <Alert tone="warning" title="Verification is required before you can file a claim">
          {meta.description}
        </Alert>
      )}

      {status !== "verified" && status !== "pending" && (
        <Card className="p-6 sm:p-7">
          <VerificationForm
            defaultName={profile?.full_name ?? ""}
            resubmitting={status === "rejected"}
          />
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-ink-950">
          <ShieldCheck aria-hidden className="size-4.5 text-mint-600" />
          How your document is handled
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-500">
          {[
            "Uploaded straight into a private bucket partitioned by your account id.",
            "Readable only by you and an authorised reviewer, through a link that expires after one minute.",
            "Never shown on any public page, and never attached to a case file.",
            "Used solely to confirm identity before a claim is filed.",
          ].map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-royal-400" />
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 border-t border-ink-100 pt-4 text-xs leading-relaxed text-ink-400">
          <ShieldAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          We will never ask for a banking password, card PIN, one-time code or recovery phrase as
          part of verification. An identity document is all that is needed.
        </p>
      </Card>
    </div>
  );
}
