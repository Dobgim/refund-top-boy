import Link from "next/link";
import type { ReactNode } from "react";
import { Info, Paperclip, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CLAIM_STAGES, CLAIM_STATUS_META, CLAIM_TYPE_LABELS, stageIndexFor } from "@/lib/claims";
import { formatDate, formatDateTime, formatCurrency, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/primitives";
import type { ClaimSummary } from "@/lib/queries";
import type { ClaimStatus } from "@/types";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Shown when the database is not connected on this deployment. */
export function DemoBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-gold-400/30 bg-gold-400/10 px-4 py-3 text-sm text-gold-600 sm:px-6 lg:px-9">
      <TriangleAlert aria-hidden className="mt-0.5 size-4.5 shrink-0" />
      <p className="leading-relaxed">
        {children ?? (
          <>
            <strong className="font-bold">Preview mode.</strong> The database is not connected on this
            deployment, so this area is showing example cases and nothing you change is saved.
          </>
        )}
      </p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "royal",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "royal" | "mint" | "amber" | "ink";
}) {
  const tones = {
    royal: "bg-royal-50 text-royal-600 ring-royal-100",
    mint: "bg-mint-500/10 text-mint-600 ring-mint-500/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    ink: "bg-ink-100 text-ink-700 ring-ink-200",
  };
  return (
    <div className="rounded-card border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500">{label}</p>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset", tones[tone])}>
          <Icon aria-hidden className="size-4.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function StageTracker({ status, className }: { status: ClaimStatus; className?: string }) {
  const current = stageIndexFor(status);
  return (
    <ol className={cn("flex flex-wrap items-center gap-y-3", className)}>
      {CLAIM_STAGES.map((stage, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={stage.key} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-[0.7rem] font-extrabold",
                done && "bg-mint-500 text-white",
                active && "bg-royal-600 text-white ring-4 ring-royal-500/15",
                !done && !active && "bg-ink-100 text-ink-400",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "truncate text-xs font-bold",
                active ? "text-ink-950" : done ? "text-mint-600" : "text-ink-400",
              )}
            >
              {stage.label}
            </span>
            {index < CLAIM_STAGES.length - 1 && (
              <span
                aria-hidden
                className={cn("hidden h-0.5 flex-1 rounded-full sm:block", done ? "bg-mint-500" : "bg-ink-100")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ClaimTimeline({
  events,
  className,
}: {
  events: Array<{ id?: string; status: ClaimStatus; note: string | null; created_at: string }>;
  className?: string;
}) {
  if (events.length === 0) {
    return (
      <p className={cn("flex items-center gap-2 text-sm text-ink-400", className)}>
        <Info aria-hidden className="size-4" />
        No status changes recorded yet.
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-6 border-l border-ink-200 pl-6", className)}>
      {events.map((event, index) => {
        const last = index === events.length - 1;
        return (
          <li key={event.id ?? `${event.status}-${event.created_at}`} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute top-1 -left-[1.9rem] grid size-3.5 place-items-center rounded-full ring-4 ring-white",
                last ? "bg-royal-600" : "bg-ink-300",
              )}
            />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <time dateTime={event.created_at} className="text-xs text-ink-400">
                {formatDateTime(event.created_at)}
              </time>
            </div>
            {event.note && <p className="mt-2 text-sm leading-relaxed text-ink-600">{event.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}

/** Responsive claims list: a table on wide screens, stacked cards on mobile. */
export function ClaimsList({
  claims,
  basePath = "/dashboard/claims",
  showOwner = false,
}: {
  claims: ClaimSummary[];
  basePath?: string;
  showOwner?: boolean;
}) {
  return (
    <>
      {/* mobile */}
      <ul className="space-y-3 lg:hidden">
        {claims.map((claim) => (
          <li key={claim.id}>
            <Link
              href={`${basePath}/${claim.reference}`}
              className="block rounded-card border border-ink-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-bold text-ink-950">{claim.reference}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {CLAIM_TYPE_LABELS[claim.claim_type]}
                  </p>
                </div>
                <StatusBadge status={claim.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink-600">{claim.reason}</p>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-400">
                <span>{formatDate(claim.created_at)}</span>
                <span className="font-mono font-bold text-ink-900">
                  {formatCurrency(claim.amount, claim.currency)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* desktop */}
      <div className="hidden overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/60 text-xs tracking-wide text-ink-500 uppercase">
                <th scope="col" className="px-5 py-3.5 font-bold">Reference</th>
                {showOwner && <th scope="col" className="px-5 py-3.5 font-bold">Account</th>}
                <th scope="col" className="px-5 py-3.5 font-bold">Type</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Submitted</th>
                <th scope="col" className="px-5 py-3.5 text-right font-bold">Amount</th>
                {showOwner && <th scope="col" className="px-5 py-3.5 font-bold">Proof</th>}
                <th scope="col" className="px-5 py-3.5 font-bold">Status</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Last update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {claims.map((claim) => (
                <tr key={claim.id} className="transition-colors hover:bg-royal-50/40">
                  <td className="px-5 py-4">
                    <Link
                      href={`${basePath}/${claim.reference}`}
                      className="font-mono font-bold text-royal-700 hover:underline"
                    >
                      {claim.reference}
                    </Link>
                    <span className="mt-0.5 block max-w-[16rem] truncate text-xs text-ink-400">
                      {claim.reason}
                    </span>
                  </td>
                  {showOwner && (
                    <td className="px-5 py-4">
                      <span className="block truncate font-semibold text-ink-800">
                        {claim.owner?.full_name ?? "—"}
                      </span>
                      <span className="block max-w-[14rem] truncate text-xs text-ink-400">
                        {claim.owner?.email ?? ""}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4 text-ink-600">{CLAIM_TYPE_LABELS[claim.claim_type]}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-ink-600">{formatDate(claim.created_at)}</td>
                  <td className="px-5 py-4 text-right font-mono font-bold whitespace-nowrap text-ink-950">
                    {formatCurrency(claim.amount, claim.currency)}
                  </td>
                  {showOwner && (
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                          claim.document_count
                            ? "bg-mint-500/10 text-mint-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        <Paperclip aria-hidden className="size-3.5" />
                        {claim.document_count ?? 0}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-ink-500">
                    {formatDate(claim.last_update)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function StatusHint({ status }: { status: ClaimStatus }) {
  return <p className="text-sm leading-relaxed text-ink-500">{CLAIM_STATUS_META[status].description}</p>;
}
