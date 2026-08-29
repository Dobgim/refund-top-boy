import type { Metadata } from "next";
import { BadgeCheck, IdCard } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { VerificationReview } from "@/components/admin/verification-review";
import { getAllVerifications } from "@/lib/queries";
import { ID_DOCUMENT_LABELS, VERIFICATION_META, type IdDocumentType } from "@/lib/verification";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Identity verifications",
  robots: { index: false, follow: false },
};

export default async function AdminVerificationsPage() {
  const { data: verifications } = await getAllVerifications();

  // Anything still waiting on a decision comes first.
  const pending = verifications.filter((v) => v.status === "pending");
  const decided = verifications.filter((v) => v.status !== "pending");

  return (
    <div className="space-y-7">
      <PageHeader
        title="Identity verifications"
        description="Approve an identity document before the account can file a claim. Documents open through a link that expires after five minutes."
        action={
          pending.length > 0 ? (
            <Badge tone="warn">
              {pending.length} awaiting {pending.length === 1 ? "review" : "reviews"}
            </Badge>
          ) : undefined
        }
      />

      {verifications.length === 0 ? (
        <EmptyState
          icon={<IdCard aria-hidden className="size-6" />}
          title="No documents submitted yet"
          description="When a customer uploads an identity document it appears here for review."
        />
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-5">
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
                Awaiting review
              </h2>
              {pending.map((v) => (
                <Card key={v.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink-950">{v.owner?.full_name ?? v.full_name}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-500">{v.owner?.email ?? ""}</p>
                      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <div className="flex gap-2">
                          <dt className="text-ink-400">Document</dt>
                          <dd className="font-semibold text-ink-800">
                            {ID_DOCUMENT_LABELS[v.document_type as IdDocumentType]}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-400">Name on it</dt>
                          <dd className="font-semibold text-ink-800">{v.full_name}</dd>
                        </div>
                        {v.document_number && (
                          <div className="flex gap-2">
                            <dt className="text-ink-400">Number</dt>
                            <dd className="font-mono font-semibold text-ink-800">
                              {v.document_number}
                            </dd>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <dt className="text-ink-400">Submitted</dt>
                          <dd className="font-semibold text-ink-800">
                            {formatDateTime(v.created_at)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <Badge tone={VERIFICATION_META[v.status].tone}>
                      {VERIFICATION_META[v.status].label}
                    </Badge>
                  </div>

                  <div className="mt-5 border-t border-ink-100 pt-5">
                    <VerificationReview
                      verificationId={v.id}
                      frontPath={v.front_path}
                      backPath={v.back_path}
                      decided={false}
                    />
                  </div>
                </Card>
              ))}
            </section>
          )}

          {decided.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
                Already decided
              </h2>
              <Card className="divide-y divide-ink-100 p-0">
                {decided.map((v) => (
                  <div key={v.id} className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                    <span
                      className={
                        v.status === "verified"
                          ? "grid size-9 shrink-0 place-items-center rounded-lg bg-mint-500/12 text-mint-600"
                          : "grid size-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600"
                      }
                    >
                      <BadgeCheck aria-hidden className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink-950">
                        {v.owner?.full_name ?? v.full_name}
                      </span>
                      <span className="block truncate text-xs text-ink-400">
                        {ID_DOCUMENT_LABELS[v.document_type as IdDocumentType]}
                        {v.reviewed_at ? ` · ${formatDateTime(v.reviewed_at)}` : ""}
                        {v.rejection_reason ? ` · ${v.rejection_reason}` : ""}
                      </span>
                    </span>
                    <Badge tone={VERIFICATION_META[v.status].tone}>
                      {VERIFICATION_META[v.status].label}
                    </Badge>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}
