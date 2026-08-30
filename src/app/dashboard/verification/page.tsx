import type { Metadata } from "next";
import { BadgeCheck, Clock, FileCheck2, History, ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, Badge, Card, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/common";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { VerificationForm } from "@/components/forms/verification-form";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getMyVerification } from "@/lib/queries";
import { ID_DOCUMENT_LABELS, VERIFICATION_META, type IdDocumentType } from "@/lib/verification";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Verification Center",
  robots: { index: false, follow: false },
};

export default async function VerificationCenterPage() {
  const [profile, verification] = await Promise.all([getCurrentProfile(), getMyVerification()]);
  const status = verification?.status ?? profile?.verification_status ?? "unverified";
  const meta = VERIFICATION_META[status];

  // Derived from the record itself rather than a separate audit table: the
  // submission, and the decision if one has been made.
  const history = verification
    ? [
        ...(verification.reviewed_at
          ? [
              {
                at: verification.reviewed_at,
                event: status === "verified" ? "Approved" : "Rejected",
                detail: verification.rejection_reason ?? "Identity confirmed.",
                tone: status === "verified" ? ("good" as const) : ("warn" as const),
              },
            ]
          : []),
        {
          at: verification.created_at,
          event: "Submitted",
          detail: `${ID_DOCUMENT_LABELS[verification.document_type as IdDocumentType]} uploaded for review.`,
          tone: "info" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Center"
        description="Confirm your identity once, then file as many claims as you need."
        action={<Badge tone={meta.tone}>{meta.label}</Badge>}
      />

      <VerificationBanner status={status} />
      <SettingsTabs />

      {/* ------------------------------------------------- identity section */}
      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4 sm:px-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
            Identity authentication
          </h2>
          <span
            className={
              status === "verified"
                ? "inline-flex items-center gap-1.5 rounded-full bg-mint-500/15 px-3 py-1.5 text-xs font-bold text-mint-700"
                : "inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-bold text-ink-600"
            }
          >
            <FileCheck2 aria-hidden className="size-3.5" />
            {meta.label}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {status === "verified" && (
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mint-500/15 text-mint-600">
                <BadgeCheck aria-hidden className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ink-950">Your identity is confirmed</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
                  {verification?.reviewed_at
                    ? `Approved on ${formatDateTime(verification.reviewed_at)}.`
                    : "You are verified."}{" "}
                  You can submit refund claims.
                </p>
                <ButtonLink href="/dashboard/claims/new" size="sm" className="mt-4">
                  Start a claim
                </ButtonLink>
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-royal-100 text-royal-700">
                <Clock aria-hidden className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ink-950">Under review</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
                  {verification
                    ? `${ID_DOCUMENT_LABELS[verification.document_type as IdDocumentType]} submitted on ${formatDateTime(verification.created_at)}.`
                    : ""}{" "}
                  Nothing more is needed from you right now.
                </p>
              </div>
            </div>
          )}

          {(status === "unverified" || status === "rejected") && (
            <>
              {status === "rejected" && (
                <Alert tone="error" title="Your document was not accepted" className="mb-5">
                  {verification?.rejection_reason ??
                    "The image was not clear enough. Please upload a better copy."}
                </Alert>
              )}
              <VerificationForm
                defaultName={profile?.full_name ?? ""}
                country={profile?.country ?? null}
                resubmitting={status === "rejected"}
              />
            </>
          )}
        </div>
      </Card>

      {/* ------------------------------------------------------ KYC history */}
      <Card className="p-0">
        <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4 sm:px-6">
          <History aria-hidden className="size-4.5 text-ink-400" />
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">KYC history</h2>
        </div>

        {history.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              className="py-10"
              icon={<FileCheck2 aria-hidden className="size-5" />}
              title="Nothing submitted yet"
              description="Once you upload a document, every submission and decision is listed here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-xs tracking-wide text-ink-500 uppercase">
                  <th scope="col" className="px-5 py-3 font-bold sm:px-6">Date</th>
                  <th scope="col" className="px-5 py-3 font-bold">Event</th>
                  <th scope="col" className="px-5 py-3 font-bold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {history.map((row) => (
                  <tr key={`${row.event}-${row.at}`}>
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-600 sm:px-6">
                      {formatDateTime(row.at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={row.tone}>{row.event}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-ink-950">
          <ShieldCheck aria-hidden className="size-4.5 text-mint-600" />
          How your document is handled
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-500">
          {[
            "Uploaded straight into a private bucket partitioned by your account id.",
            "Readable only by you and an authorised reviewer, through a link that expires after minutes.",
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
          part of verification.
        </p>
      </Card>
    </div>
  );
}
