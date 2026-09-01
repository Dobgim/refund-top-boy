import type { Metadata } from "next";
import { Inbox, Mail, UserCheck } from "lucide-react";
import { Alert, Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { EnquiryStatusControls } from "@/components/admin/enquiry-status";
import { getSupportEnquiries } from "@/lib/queries";
import { formatDateTime, relativeTime } from "@/lib/utils";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Customer service",
  robots: { index: false, follow: false },
};

const STATUS_TONE = {
  new: "info",
  in_progress: "warn",
  resolved: "good",
} as const;

const STATUS_LABEL = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
} as const;

export default async function AdminSupportPage() {
  const { data: enquiries } = await getSupportEnquiries();

  const open = enquiries.filter((e) => e.status !== "resolved").length;
  const unread = enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer service"
        description={`Messages sent through the contact form. Each one is also emailed to ${SITE.supportEmail}.`}
      />

      {enquiries.length > 0 && (
        <p className="text-sm text-ink-500">
          {enquiries.length} total · {unread} new · {open} still open
        </p>
      )}

      {enquiries.length === 0 ? (
        <>
          <EmptyState
            icon={<Inbox aria-hidden className="size-6" />}
            title="No messages yet"
            description="Anything sent through the contact form arrives here, and is emailed to your support address at the same time."
          />
          <Alert tone="info" title="Not seeing messages you expected?">
            The inbox needs its table. If you have not run{" "}
            <code className="font-mono text-xs">supabase/12_support_enquiries.sql</code> yet, do that
            and messages will start appearing.
          </Alert>
        </>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-ink-950">{enquiry.subject}</h2>
                      <Badge tone={STATUS_TONE[enquiry.status]}>
                        {STATUS_LABEL[enquiry.status]}
                      </Badge>
                      {enquiry.user_id && (
                        <Badge tone="neutral">
                          <UserCheck aria-hidden className="size-3" />
                          Has an account
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                      {enquiry.name} ·{" "}
                      <a
                        href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}`}
                        className="font-semibold text-royal-600 hover:underline"
                      >
                        {enquiry.email}
                      </a>
                    </p>
                  </div>

                  <time
                    dateTime={enquiry.created_at}
                    title={formatDateTime(enquiry.created_at)}
                    className="shrink-0 text-xs text-ink-400"
                  >
                    {relativeTime(enquiry.created_at)}
                  </time>
                </div>

                <p className="mt-4 rounded-xl bg-ink-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-ink-700">
                  {enquiry.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                  <EnquiryStatusControls id={enquiry.id} current={enquiry.status} />
                  <a
                    href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-royal-600 hover:text-royal-800"
                  >
                    <Mail aria-hidden className="size-4" />
                    Reply by email
                  </a>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
