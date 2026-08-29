import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BanknoteArrowDown,
  PencilLine,
  CalendarDays,
  Hash,
  Landmark,
  MapPin,
  Tag,
  Wallet,
} from "lucide-react";
import { Alert, Card, StatusBadge } from "@/components/ui/primitives";
import { ClaimTimeline, PageHeader, StageTracker, StatusHint } from "@/components/dashboard/common";
import {
  DocumentList,
  MessageComposer,
  MessageThread,
} from "@/components/dashboard/claim-interactions";
import { getMyClaim } from "@/lib/queries";
import { ButtonLink } from "@/components/ui/button";
import { CLAIM_TYPE_LABELS, SETTLEMENT_METHOD_LABELS } from "@/lib/claims";
import { formatCurrency, formatDate } from "@/lib/utils";

type Params = Promise<{ reference: string }>;
type Search = Promise<{ submitted?: string; updated?: string; locked?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Case ${reference.toUpperCase()}`,
    robots: { index: false, follow: false },
  };
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-300" />
      <dt className="w-36 shrink-0 text-sm text-ink-400">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-semibold break-words text-ink-900">{value}</dd>
    </div>
  );
}

export default async function ClaimDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { reference } = await params;
  const { submitted, updated, locked } = await searchParams;
  const { data: claim, demo } = await getMyClaim(reference);

  if (!claim) notFound();

  return (
    <div className="space-y-7">
      <Link
        href="/dashboard/claims"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to my claims
      </Link>

      {submitted && (
        <Alert tone="success" title="Case submitted">
          Keep the reference <strong className="font-mono">{claim.reference}</strong> somewhere safe. You
          can use it on the public tracker without signing in.
        </Alert>
      )}

      {updated && (
        <Alert tone="success" title="Case updated">
          Your changes were saved and the case has been resubmitted for review.
        </Alert>
      )}
      {locked && (
        <Alert tone="warning" title="This case can no longer be edited">
          A decision has already been recorded against it. Send a message below if something is
          wrong and a reviewer will pick it up.
        </Alert>
      )}

      <PageHeader
        title={claim.reference}
        description={claim.reason}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={claim.status} className="text-sm" />
            {["submitted", "documents_required", "under_review"].includes(claim.status) && (
              <ButtonLink
                href={`/dashboard/claims/${claim.reference}/edit`}
                variant="outline"
                size="sm"
                leadingIcon={<PencilLine aria-hidden className="size-4" />}
              >
                Edit claim
              </ButtonLink>
            )}
          </div>
        }
      />

      {claim.status === "documents_required" && (
        <Alert tone="warning" title="More information is needed">
          A reviewer has asked for something before this can continue. Use{" "}
          <strong className="font-semibold">Edit claim</strong> to correct the details or attach the
          missing evidence, then resubmit.
        </Alert>
      )}

      {claim.settled_at && claim.approved_amount !== null && (
        <Card className="border-mint-500/30 bg-mint-500/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint-500/15 text-mint-600">
                <BanknoteArrowDown aria-hidden className="size-5" />
              </span>
              <div>
                <p className="font-bold text-ink-950">Payout recorded</p>
                <p className="mt-0.5 text-sm text-ink-600">
                  {formatCurrency(claim.approved_amount, claim.currency)} returned via{" "}
                  {claim.settlement_method
                    ? SETTLEMENT_METHOD_LABELS[claim.settlement_method].toLowerCase()
                    : "the original payment method"}
                  {" on "}
                  {formatDate(claim.settled_at)}.
                </p>
                {claim.settlement_note && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{claim.settlement_note}</p>
                )}
              </div>
            </div>
            {claim.settlement_reference && (
              <div className="shrink-0 sm:text-right">
                <p className="text-xs text-ink-400">Payout reference</p>
                <p className="font-mono text-sm font-bold break-all text-ink-900">
                  {claim.settlement_reference}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        <StageTracker status={claim.status} />
        <div className="mt-5 border-t border-ink-100 pt-4">
          <StatusHint status={claim.status} />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Case details</h2>
            <dl className="mt-3 divide-y divide-ink-100">
              <DetailRow icon={Hash} label="Claim ID" value={claim.reference} />
              <DetailRow icon={CalendarDays} label="Submitted" value={formatDate(claim.created_at)} />
              <DetailRow icon={Tag} label="Case type" value={CLAIM_TYPE_LABELS[claim.claim_type]} />
              <DetailRow
                icon={Wallet}
                label="Amount"
                value={formatCurrency(claim.amount, claim.currency)}
              />
              <DetailRow
                icon={Landmark}
                label="Transaction"
                value={`${claim.transaction_type ?? "—"}${
                  claim.transaction_date ? ` on ${formatDate(claim.transaction_date)}` : ""
                }${claim.transaction_reference ? ` · ${claim.transaction_reference}` : ""}`}
              />
              <DetailRow icon={MapPin} label="Country" value={claim.country ?? "—"} />
            </dl>

            <div className="mt-5 border-t border-ink-100 pt-5">
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
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Messages</h2>
            <MessageThread messages={claim.messages} />
            <MessageComposer claimId={claim.id} disabled={demo} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Case timeline</h2>
            <ClaimTimeline events={claim.timeline} className="mt-5" />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
              Uploaded documents
            </h2>
            <DocumentList documents={claim.documents} demo={demo} />
          </Card>
        </div>
      </div>
    </div>
  );
}
