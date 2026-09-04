import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import { Alert, Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { RequestDecision } from "@/components/admin/request-decision";
import { getAdminLoans } from "@/lib/queries";
import { formatCurrency, formatDateTime, relativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Loan applications",
  robots: { index: false, follow: false },
};

const STATUS_TONE = {
  pending: "warn",
  approved: "good",
  completed: "good",
  rejected: "neutral",
} as const;

const STATUS_LABEL = {
  pending: "Awaiting decision",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
} as const;

export default async function AdminLoansPage() {
  const { data: loans } = await getAdminLoans();
  const pending = loans.filter((loan) => loan.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loan applications"
        description="Nothing is disbursed until a reviewer approves. Approving credits the customer's account in the same database call that records the decision."
      />

      {loans.length > 0 && (
        <p className="text-sm text-ink-500">
          {loans.length} total · {pending.length} awaiting a decision
        </p>
      )}

      {loans.length === 0 ? (
        <>
          <EmptyState
            icon={<Landmark aria-hidden className="size-6" />}
            title="No loan applications"
            description="Every application arrives here, and is emailed to your support address at the same time."
          />
          <Alert tone="info" title="Not seeing applications you expected?">
            Loans need the banking tables. If you have not run{" "}
            <code className="font-mono text-xs">supabase/09_banking.sql</code> yet, do that and
            applications will start appearing.
          </Alert>
        </>
      ) : (
        <ul className="space-y-3">
          {loans.map((loan) => (
            <li key={loan.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-ink-950">{formatCurrency(loan.amount)}</h2>
                      <Badge tone={STATUS_TONE[loan.status]}>{STATUS_LABEL[loan.status]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                      {loan.customer} ·{" "}
                      <a
                        href={`mailto:${loan.email}`}
                        className="font-semibold text-royal-600 hover:underline"
                      >
                        {loan.email}
                      </a>
                    </p>
                  </div>

                  <time
                    dateTime={loan.created_at}
                    title={formatDateTime(loan.created_at)}
                    className="shrink-0 text-xs text-ink-400"
                  >
                    {relativeTime(loan.created_at)}
                  </time>
                </div>

                <dl className="mt-4 grid gap-3 rounded-xl bg-ink-50 px-4 py-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold text-ink-500">Term</dt>
                    <dd className="text-ink-800">{loan.tenure_months} months</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-ink-500">Rate</dt>
                    <dd className="text-ink-800">{loan.rate_percent}% a year</dd>
                  </div>
                </dl>

                <p className="mt-3 rounded-xl bg-ink-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-ink-700">
                  {loan.purpose}
                </p>

                {loan.decision_note && (
                  <p className="mt-3 text-sm text-ink-600">
                    <span className="font-bold text-ink-500">Decision note: </span>
                    {loan.decision_note}
                  </p>
                )}

                {loan.status === "pending" && <RequestDecision id={loan.id} kind="loan" />}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
