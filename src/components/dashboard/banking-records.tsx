import { Badge } from "@/components/ui/primitives";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BadgeTone } from "@/components/ui/primitives";

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: "warn",
  approved: "good",
  active: "info",
  completed: "good",
  matured: "good",
  rejected: "neutral",
  cancelled: "neutral",
};

/**
 * One list for withdrawals, bills, savings schemes, deposits and loans.
 *
 * They share a shape — an amount, a status, a date and one distinguishing
 * field — so a single renderer reads the row rather than five near-identical
 * components drifting apart over time.
 */
export function BankingRecords({
  records,
  currency,
}: {
  records: Array<Record<string, unknown>>;
  currency: string;
}) {
  function amountOf(row: Record<string, unknown>): number {
    const raw = row.amount ?? row.principal ?? row.monthly_amount ?? 0;
    return Number(raw);
  }

  function labelOf(row: Record<string, unknown>): string {
    if (row.biller) return `${row.biller} · ${row.bill_number}`;
    if (row.destination) return `${row.method} · ${row.destination}`;
    if (row.purpose) return String(row.purpose);
    if (row.tenure_months) return `${row.tenure_months} month term`;
    return "—";
  }

  function suffixOf(row: Record<string, unknown>): string | null {
    if (row.monthly_amount) return "per month";
    if (row.matures_on) return `matures ${formatDate(String(row.matures_on))}`;
    return null;
  }

  return (
    <ul className="mt-4 divide-y divide-ink-100">
      {records.map((row) => {
        const status = String(row.status ?? "completed");
        const suffix = suffixOf(row);

        return (
          <li key={String(row.id)} className="flex items-start gap-3 py-3.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-950">
                {labelOf(row)}
              </span>
              <span className="mt-0.5 block text-xs text-ink-400">
                {formatDate(String(row.created_at))}
                {suffix ? ` · ${suffix}` : ""}
                {row.decision_note ? ` · ${row.decision_note}` : ""}
                {row.note ? ` · ${row.note}` : ""}
              </span>
            </span>

            <span className="shrink-0 text-right">
              <span className="block font-mono text-sm font-bold whitespace-nowrap text-ink-950">
                {formatCurrency(amountOf(row), currency)}
              </span>
              <Badge tone={STATUS_TONE[status] ?? "neutral"} className="mt-1">
                {status}
              </Badge>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
