import Link from "next/link";
import { ArrowRight, CheckCircle2, FolderOpen, Hourglass, Layers, Users, Wallet } from "lucide-react";
import { Card, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { PageHeader, StatCard } from "@/components/dashboard/common";
import { getAdminClaims, getAdminStats } from "@/lib/queries";
import { CLAIM_STATUS_META, CLAIM_TYPE_LABELS } from "@/lib/claims";
import { formatCurrency, relativeTime } from "@/lib/utils";
import type { ClaimStatus } from "@/types";

export default async function AdminOverviewPage() {
  const [{ data: stats }, { data: claims }] = await Promise.all([
    getAdminStats(),
    getAdminClaims({ sort: "newest" }),
  ]);

  const byStatus = (Object.keys(CLAIM_STATUS_META) as ClaimStatus[]).map((status) => ({
    status,
    count: claims.filter((claim) => claim.status === status).length,
  }));
  const maxCount = Math.max(1, ...byStatus.map((entry) => entry.count));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Administration"
        description="Case volume, queue health and the most recent submissions across all accounts."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total claims" value={stats.total} icon={Layers} tone="royal" />
        <StatCard label="Pending triage" value={stats.pending} icon={Hourglass} tone="amber" hint="Status: submitted" />
        <StatCard label="Active" value={stats.active} icon={FolderOpen} tone="ink" hint="In review or approved" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="mint" />
        <StatCard label="Registered users" value={stats.users} icon={Users} tone="royal" />
        <StatCard
          label="Value under review"
          value={formatCurrency(stats.amount)}
          icon={Wallet}
          tone="ink"
          hint="Sum of all case amounts"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Queue by status</h2>
          <ul className="mt-5 space-y-4">
            {byStatus.map(({ status, count }) => (
              <li key={status}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-700">{CLAIM_STATUS_META[status].label}</span>
                  <span className="font-mono font-bold text-ink-950">{count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-royal-600"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
              Latest submissions
            </h2>
            <Link
              href="/admin/claims"
              className="inline-flex items-center gap-1 text-sm font-bold text-royal-600 hover:text-royal-800"
            >
              All claims
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>

          {claims.length === 0 ? (
            <EmptyState
              className="mt-5"
              title="No claims submitted yet"
              description="New cases will appear here as soon as they are created."
            />
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {claims.slice(0, 6).map((claim) => (
                <li key={claim.id}>
                  <Link
                    href={`/admin/claims/${claim.reference}`}
                    className="flex flex-col gap-2 py-3.5 transition-colors hover:bg-ink-50/60 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-sm font-bold text-ink-950">
                        {claim.reference}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-400">
                        {CLAIM_TYPE_LABELS[claim.claim_type]} · {claim.owner?.full_name ?? "Unknown account"}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold whitespace-nowrap text-ink-900">
                        {formatCurrency(claim.amount, claim.currency)}
                      </span>
                      <StatusBadge status={claim.status} />
                      <span className="hidden text-xs whitespace-nowrap text-ink-400 sm:inline">
                        {relativeTime(claim.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
