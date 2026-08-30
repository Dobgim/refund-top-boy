import type { Metadata } from "next";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { getMyAccount, getMyTransactions } from "@/lib/queries";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Transactions",
  robots: { index: false, follow: false },
};

/** Anything that increases the balance is shown as money in. */
const CREDIT_TYPES = [
  "deposit",
  "transfer_in",
  "refund_credit",
  "interest",
  "loan_disbursement",
  "fdr_maturity",
];

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  transfer_in: "Transfer received",
  transfer_out: "Transfer sent",
  bill_payment: "Bill payment",
  refund_credit: "Recovered funds",
  fee: "Fee",
  interest: "Interest",
  loan_disbursement: "Loan disbursed",
  loan_repayment: "Loan repayment",
  dps_deposit: "DPS deposit",
  fdr_open: "Fixed deposit opened",
  fdr_maturity: "Fixed deposit matured",
};

export default async function TransactionsPage() {
  const [account, transactions] = await Promise.all([getMyAccount(), getMyTransactions()]);
  const currency = account?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Every movement on your account, newest first."
        action={
          <span className="rounded-full bg-ink-50 px-3.5 py-2 text-sm font-bold text-ink-900 ring-1 ring-ink-100 ring-inset">
            {formatCurrency(account?.balance ?? 0, currency)}
          </span>
        }
      />

      {transactions.length === 0 ? (
        <EmptyState
          icon={<Receipt aria-hidden className="size-6" />}
          title="No transactions yet"
          description="When a claim is settled or you move money, it appears here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-ink-100">
            {transactions.map((txn) => {
              const credit = CREDIT_TYPES.includes(txn.type);
              return (
                <li key={txn.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      credit ? "bg-mint-500/12 text-mint-600" : "bg-ink-100 text-ink-600",
                    )}
                  >
                    {credit ? (
                      <ArrowDownLeft aria-hidden className="size-4.5" />
                    ) : (
                      <ArrowUpRight aria-hidden className="size-4.5" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink-950">
                      {TYPE_LABELS[txn.type] ?? txn.type}
                    </span>
                    <span className="block truncate text-xs text-ink-400">
                      {txn.description ?? txn.counterparty ?? ""} · {formatDateTime(txn.created_at)}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span
                      className={cn(
                        "block font-mono text-sm font-bold whitespace-nowrap",
                        credit ? "text-mint-600" : "text-ink-900",
                      )}
                    >
                      {credit ? "+" : "−"} {formatCurrency(txn.amount, currency)}
                    </span>
                    <span className="block font-mono text-[0.68rem] text-ink-400">
                      bal {formatCurrency(txn.balance_after, currency)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
