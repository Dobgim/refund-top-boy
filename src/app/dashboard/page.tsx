import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FolderOpen,
  Hourglass,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { PageHeader, StatCard, StageTracker } from "@/components/dashboard/common";
import { PayoutWallet } from "@/components/dashboard/payout-wallet";
import { AccountCard } from "@/components/dashboard/account-card";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { getMyClaims, getMyAccount } from "@/lib/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { CLAIM_TYPE_LABELS } from "@/lib/claims";
import { formatCurrency, formatDate, relativeTime } from "@/lib/utils";

export default async function DashboardOverviewPage() {
  const [profile, { data: claims }, account] = await Promise.all([
    getCurrentProfile(),
    getMyClaims(),
    getMyAccount(),
  ]);

  const active = claims.filter((claim) =>
    ["submitted", "under_review", "documents_required", "approved"].includes(claim.status),
  );
  const completed = claims.filter((claim) => ["resolved", "closed"].includes(claim.status));
  const pending = claims.filter((claim) => claim.status === "documents_required");
  // Only money actually recorded as paid out counts as recovered.
  const settled = claims.filter((claim) => claim.settled_at && claim.settlement_amount);
  const recovered = settled.reduce((sum, claim) => sum + (claim.settlement_amount ?? 0), 0);
  const recoveredCurrency = settled[0]?.settlement_currency ?? settled[0]?.currency ?? "USD";

  const firstName = (profile?.full_name ?? "there").split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="A snapshot of everything currently open on your account."
        action={
          <ButtonLink href="/dashboard/claims/new" leadingIcon={<FilePlus2 aria-hidden className="size-4" />}>
            Start a claim
          </ButtonLink>
        }
      />

      <VerificationBanner status={profile?.verification_status ?? "unverified"} />

      {/* the account, immediately under the verification bar */}
      <AccountCard account={account} holder={profile?.full_name ?? "Your account"} />

      {/* account status */}
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint-500/10 text-mint-600 ring-1 ring-mint-500/20 ring-inset">
            <ShieldCheck aria-hidden className="size-5" />
          </span>
          <div>
            <p className="font-bold text-ink-950">
              Account status:{" "}
              <span className="text-mint-600 capitalize">{profile?.account_status ?? "active"}</span>
            </p>
            <p className="mt-0.5 text-sm text-ink-500">
              {profile?.email ?? "amara.osei@example.com"}
              {profile?.country ? ` · ${profile.country}` : ""}
            </p>
          </div>
        </div>
        <p className="text-sm text-ink-400">
          Member since {formatDate(profile?.created_at ?? new Date().toISOString())}
        </p>
      </Card>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active cases" value={active.length} icon={FolderOpen} tone="royal" hint="In the pipeline right now" />
        <StatCard label="Awaiting your input" value={pending.length} icon={Hourglass} tone="amber" hint="Documents requested" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} tone="mint" hint="Resolved or closed" />
        <StatCard
          label="Recovered"
          value={formatCurrency(recovered, recoveredCurrency)}
          icon={ClipboardList}
          tone="ink"
          hint="Across resolved cases"
        />
      </div>

      {/* payouts */}
      <PayoutWallet claims={claims} holder={profile?.full_name ?? "Your account"} />

      {/* active case detail */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Recent cases</h2>
            <Link
              href="/dashboard/claims"
              className="inline-flex items-center gap-1 text-sm font-bold text-royal-600 hover:text-royal-800"
            >
              View all
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>

          {claims.length === 0 ? (
            <EmptyState
              className="mt-5"
              icon={<Inbox aria-hidden className="size-6" />}
              title="No claims yet"
              description="Your claim history will appear here once you submit your first case."
              action={
                <ButtonLink href="/dashboard/claims/new" size="sm">
                  Start your first claim
                </ButtonLink>
              }
            />
          ) : (
            <ul className="mt-5 divide-y divide-ink-100">
              {claims.slice(0, 4).map((claim) => (
                <li key={claim.id}>
                  <Link
                    href={`/dashboard/claims/${claim.reference}`}
                    className="flex flex-col gap-2 py-4 transition-colors hover:bg-ink-50/60 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-sm font-bold text-ink-950">
                        {claim.reference}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-ink-500">
                        {CLAIM_TYPE_LABELS[claim.claim_type]} · {claim.reason}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                      <StatusBadge status={claim.status} />
                      <span className="text-xs text-ink-400">{relativeTime(claim.last_update)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
            {active[0] ? "Latest case progress" : "Nothing in progress"}
          </h2>
          {active[0] ? (
            <>
              <p className="mt-1 font-mono text-sm font-bold text-royal-700">{active[0].reference}</p>
              <StageTracker status={active[0].status} className="mt-6" />
              <p className="mt-6 text-sm leading-relaxed text-ink-500">
                Last updated {relativeTime(active[0].last_update)}. You will see a new entry on the case
                timeline whenever the status changes.
              </p>
              <ButtonLink
                href={`/dashboard/claims/${active[0].reference}`}
                variant="outline"
                size="sm"
                className="mt-5"
                trailingIcon={<ArrowRight aria-hidden className="size-4" />}
              >
                Open case
              </ButtonLink>
            </>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              When you have an open case, its current stage and next step appear here.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
