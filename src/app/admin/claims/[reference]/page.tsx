import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, User } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { ClaimTimeline, PageHeader, StageTracker } from "@/components/dashboard/common";
import {
  DocumentList,
  MessageComposer,
  MessageThread,
} from "@/components/dashboard/claim-interactions";
import { StatusUpdater } from "@/components/admin/status-updater";
import { DecisionBar } from "@/components/admin/decision-bar";
import { ClaimEditor } from "@/components/admin/claim-editor";
import { SettlementForm } from "@/components/admin/settlement-form";
import { getMyClaim } from "@/lib/queries";
import { CLAIM_TYPE_LABELS } from "@/lib/claims";
import { formatCurrency, formatDate } from "@/lib/utils";

type Params = Promise<{ reference: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { reference } = await params;
  return { title: `Review ${reference.toUpperCase()}`, robots: { index: false, follow: false } };
}

export default async function AdminClaimDetailPage({ params }: { params: Params }) {
  const { reference } = await params;
  const { data: claim, demo } = await getMyClaim(reference);

  if (!claim) notFound();

  return (
    <div className="space-y-7">
      <Link
        href="/admin/claims"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to claims
      </Link>

      <PageHeader
        title={claim.reference}
        description={claim.reason}
        action={<StatusBadge status={claim.status} className="text-sm" />}
      />

      <Card className="p-5 sm:p-6">
        <StageTracker status={claim.status} />
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Case summary</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Case type", CLAIM_TYPE_LABELS[claim.claim_type]],
                ["Amount", formatCurrency(claim.amount, claim.currency)],
                ["Submitted", formatDate(claim.created_at)],
                ["Transaction date", claim.transaction_date ? formatDate(claim.transaction_date) : "—"],
                ["Transaction type", claim.transaction_type ?? "—"],
                ["Transaction reference", claim.transaction_reference ?? "—"],
                ["Country", claim.country ?? "—"],
                ["Last update", formatDate(claim.last_update)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold break-words text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 border-t border-ink-100 pt-5">
              <h3 className="text-sm font-bold text-ink-950">What happened</h3>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-600">
                {claim.description}
              </p>
              {claim.supporting_details && (
                <>
                  <h3 className="mt-5 text-sm font-bold text-ink-950">Supporting details</h3>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-600">
                    {claim.supporting_details}
                  </p>
                </>
              )}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
              Amend the case
            </h2>
            <p className="mt-1 mb-4 text-sm text-ink-500">
              Correct anything the customer mistyped. Every change is logged and the customer is told.
            </p>
            <ClaimEditor claim={claim} disabled={demo} />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
              Customer communication
            </h2>
            <MessageThread messages={claim.messages} />
            <MessageComposer claimId={claim.id} disabled={demo} />
          </Card>

        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Decision</h2>
            <div className="mt-4">
              <DecisionBar claimId={claim.id} current={claim.status} disabled={demo} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
                Proof of transfer
              </h2>
              <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600">
                {claim.documents.length} {claim.documents.length === 1 ? "file" : "files"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Evidence the customer uploaded for {formatCurrency(claim.amount, claim.currency)}.
            </p>
            <DocumentList documents={claim.documents} demo={demo} />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
              Status with a custom note
            </h2>
            <div className="mt-4">
              <StatusUpdater claimId={claim.id} current={claim.status} disabled={demo} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
              Record a payout
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Available once a case is approved, and visible to the customer immediately.
            </p>
            <div className="mt-4">
              <SettlementForm claim={claim} disabled={demo} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Account</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <User aria-hidden className="size-4 shrink-0 text-ink-300" />
                <span className="font-semibold text-ink-900">{claim.contact_name}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail aria-hidden className="size-4 shrink-0 text-ink-300" />
                <span className="min-w-0 truncate text-ink-600">{claim.contact_email}</span>
              </li>
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Case timeline</h2>
            <ClaimTimeline events={claim.timeline} className="mt-5" />
          </Card>
        </div>
      </div>
    </div>
  );
}
