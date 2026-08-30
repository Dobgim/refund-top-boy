import Link from "next/link";
import { ArrowUpRight, BanknoteArrowDown, Info } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ClaimSummary } from "@/lib/queries";

/**
 * Where a customer sees money that has been returned to them.
 *
 * Lists what each settled case returned. The running balance lives on the
 * account card at the top of the dashboard; this is the per-case breakdown
 * behind it.
 */
export function PayoutWallet({ claims, holder }: { claims: ClaimSummary[]; holder: string }) {
  const settled = claims.filter((claim) => claim.settled_at && claim.settlement_amount);

  // Payouts are grouped by the currency they were actually paid in, so a USDT
  // figure is never silently added to a GBP one.
  const totals = settled.reduce<Record<string, number>>((accumulator, claim) => {
    const code = claim.settlement_currency ?? claim.currency;
    accumulator[code] = (accumulator[code] ?? 0) + (claim.settlement_amount ?? 0);
    return accumulator;
  }, {});

  const entries = Object.entries(totals);
  const primary = entries[0] ?? ["USD", 0];

  return (
    <div className="overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft">
      {/* the card face */}
      <div className="relative overflow-hidden bg-ink-950 p-6 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-royal-600/25 blur-2xl"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.16em] text-white/55 uppercase">
              Returned to you
            </p>
            <p className="mt-2 font-display text-3xl leading-none font-extrabold tracking-tight">
              {formatCurrency(primary[1], primary[0])}
            </p>
            {entries.length > 1 && (
              <p className="mt-2 text-xs text-white/60">
                plus{" "}
                {entries
                  .slice(1)
                  .map(([code, value]) => formatCurrency(value, code))
                  .join(" · ")}
              </p>
            )}
          </div>
          <LogoMark className="size-8 shrink-0" />
        </div>

        <div className="relative mt-8 flex items-end justify-between gap-4">
          <span className="truncate text-sm font-semibold text-white/75">{holder}</span>
          <span className="font-mono text-xs text-white/55">
            {settled.length} {settled.length === 1 ? "payout" : "payouts"}
          </span>
        </div>
      </div>

      {/* the ledger */}
      <div className="p-5 sm:p-6">
        {settled.length === 0 ? (
          <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-500">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-300" />
            Nothing returned yet. When a reviewer approves a case, the amount and how it was sent
            appear here.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {settled.map((claim) => (
              <li key={claim.id}>
                <Link
                  href={`/dashboard/claims/${claim.reference}`}
                  className="flex items-center gap-3 py-3.5 transition-colors hover:bg-ink-50/60"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint-500/12 text-mint-600">
                    <BanknoteArrowDown aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-sm font-bold text-ink-950">
                      {claim.reference}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {claim.settled_at ? formatDate(claim.settled_at) : ""}
                      {claim.settlement_currency &&
                        claim.settlement_currency !== claim.currency &&
                        ` · converted from ${claim.currency}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-bold text-mint-600">
                      +{" "}
                      {formatCurrency(
                        claim.settlement_amount ?? 0,
                        claim.settlement_currency ?? claim.currency,
                      )}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden className="size-4 shrink-0 text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 border-t border-ink-100 pt-4 text-xs leading-relaxed text-ink-400">
          Each amount was credited to your RoyalRefund account when the case settled. Move it,
          spend it or withdraw it from the account card above.
        </p>
      </div>
    </div>
  );
}
