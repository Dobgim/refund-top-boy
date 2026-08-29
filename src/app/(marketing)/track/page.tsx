import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarDays, Clock, Lock, SearchX, Tag } from "lucide-react";
import { Alert, Card, Container, EmptyState, Spinner, StatusBadge } from "@/components/ui/primitives";
import { ClaimTimeline, StageTracker, StatusHint } from "@/components/dashboard/common";
import { TrackForm } from "@/components/track/track-form";
import { ButtonLink } from "@/components/ui/button";
import { trackClaim } from "@/lib/queries";
import { CLAIM_TYPE_LABELS } from "@/lib/claims";
import { formatDate, relativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track a case",
  description:
    "Check the current stage of a RoyalRefund case using its reference. No sign-in required and no personal details revealed.",
  alternates: { canonical: "/track" },
};

type Search = Promise<{ ref?: string }>;

async function TrackResult({ reference }: { reference: string }) {
  const { data: claim } = await trackClaim(reference);

  if (!claim) {
    return (
      <EmptyState
        className="mt-8"
        icon={<SearchX aria-hidden className="size-6" />}
        title="No case found for that reference"
        description="Check the reference for typos. If you submitted the case while signed in, your dashboard has the exact code."
        action={
          <ButtonLink href="/dashboard/claims" size="sm" variant="outline">
            Open my dashboard
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="mt-8 space-y-5">
      <Card className="p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-ink-400 uppercase">Claim reference</p>
            <p className="mt-1 font-mono text-xl font-extrabold text-ink-950">{claim.reference}</p>
          </div>
          <StatusBadge status={claim.status} className="text-sm" />
        </div>

        <div className="mt-6">
          <StageTracker status={claim.status} />
        </div>

        <div className="mt-6 border-t border-ink-100 pt-5">
          <StatusHint status={claim.status} />
        </div>

        <dl className="mt-6 grid gap-4 border-t border-ink-100 pt-5 sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <CalendarDays aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-300" />
            <div>
              <dt className="text-xs text-ink-400">Date submitted</dt>
              <dd className="text-sm font-semibold text-ink-900">{formatDate(claim.created_at)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Tag aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-300" />
            <div>
              <dt className="text-xs text-ink-400">Case type</dt>
              <dd className="text-sm font-semibold text-ink-900">
                {CLAIM_TYPE_LABELS[claim.claim_type]}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-300" />
            <div>
              <dt className="text-xs text-ink-400">Last update</dt>
              <dd className="text-sm font-semibold text-ink-900">{relativeTime(claim.last_update)}</dd>
            </div>
          </div>
        </dl>
      </Card>

      <Card className="p-6 sm:p-7">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Case history</h2>
        <ClaimTimeline events={claim.timeline} className="mt-5" />
      </Card>

      <Alert tone="info" title="Only the case status is public">
        Amounts, documents, messages and contact details are never shown on this page. Sign in to your
        account to see the full case.
      </Alert>
    </div>
  );
}

export default async function TrackPage({ searchParams }: { searchParams: Search }) {
  const { ref } = await searchParams;

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-100 bg-white pt-30 pb-16 text-ink-900 sm:pt-34 lg:pt-38">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-royal-600/6 blur-[120px]"
        />
        <Container size="narrow" className="relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-600">
            <Lock aria-hidden className="size-3.5 text-mint-600" />
            No sign-in required
          </span>
          <h1 className="text-balance-tight mt-6 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-ink-950 sm:text-5xl">
            Track a case
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-ink-500">
            Enter the reference issued when the case was submitted to see its current stage and the
            history of every status change.
          </p>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container size="narrow">
          <Card className="p-6 sm:p-7">
            <Suspense fallback={<Spinner />}>
              <TrackForm />
            </Suspense>
          </Card>

          {ref ? (
            <Suspense
              key={ref}
              fallback={
                <div className="mt-10 grid place-items-center">
                  <Spinner label="Looking up case" />
                </div>
              }
            >
              <TrackResult reference={ref} />
            </Suspense>
          ) : (
            <EmptyState
              className="mt-8"
              icon={<SearchX aria-hidden className="size-6" />}
              title="Nothing to show yet"
              description="Enter a claim reference above and the current stage will appear here."
            />
          )}
        </Container>
      </section>
    </>
  );
}
