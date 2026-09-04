import type { Metadata } from "next";
import { Banknote } from "lucide-react";
import { Alert, Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { RequestDecision } from "@/components/admin/request-decision";
import { getAdminWithdrawals } from "@/lib/queries";
import { formatCurrency, formatDateTime, relativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Withdrawals",
  robots: { index: false, follow: false },
};

const STATUS_TONE = {
  pending: "warn",
  approved: "info",
  completed: "good",
  rejected: "neutral",
} as const;

const STATUS_LABEL = {
  pending: "Awaiting decision",
  approved: "Approved",
  completed: "Paid",
  rejected: "Rejected",
} as const;

export default async function AdminWithdrawalsPage() {
  const { data: requests } = await getAdminWithdrawals();
  const pending = requests.filter((request) => request.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawals"
        description="Money a customer has asked to take out. The amount is held against their balance from the moment they ask, so every request needs a decision."
      />

      {requests.length > 0 && (
        <p className="text-sm text-ink-500">
          {requests.length} total · {pending.length} awaiting a decision
        </p>
      )}

      {requests.length === 0 ? (
        <>
          <EmptyState
            icon={<Banknote aria-hidden className="size-6" />}
            title="No withdrawal requests"
            description="Anything a customer asks to withdraw arrives here, and is emailed to your support address at the same time."
          />
          <Alert tone="info" title="Not seeing requests you expected?">
            Withdrawals need the banking tables. If you have not run{" "}
            <code className="font-mono text-xs">supabase/09_banking.sql</code> yet, do that and
            requests will start appearing.
          </Alert>
        </>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-ink-950">
                        {formatCurrency(request.amount)}
                      </h2>
                      <Badge tone={STATUS_TONE[request.status]}>
                        {STATUS_LABEL[request.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                      {request.customer} ·{" "}
                      <a
                        href={`mailto:${request.email}`}
                        className="font-semibold text-royal-600 hover:underline"
                      >
                        {request.email}
                      </a>
                    </p>
                  </div>

                  <time
                    dateTime={request.created_at}
                    title={formatDateTime(request.created_at)}
                    className="shrink-0 text-xs text-ink-400"
                  >
                    {relativeTime(request.created_at)}
                  </time>
                </div>

                <dl className="mt-4 grid gap-3 rounded-xl bg-ink-50 px-4 py-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold text-ink-500">Method</dt>
                    <dd className="text-ink-800">{request.method}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-ink-500">Destination</dt>
                    <dd className="break-words text-ink-800">{request.destination}</dd>
                  </div>
                </dl>

                {request.note && (
                  <p className="mt-3 text-sm text-ink-600">
                    <span className="font-bold text-ink-500">Note: </span>
                    {request.note}
                  </p>
                )}

                {request.status === "pending" && (
                  <RequestDecision id={request.id} kind="withdrawal" />
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
