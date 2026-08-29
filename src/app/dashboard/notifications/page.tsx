import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, Inbox } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { MarkAllRead } from "@/components/dashboard/mark-all-read";
import { getMyNotifications } from "@/lib/queries";
import { formatDateTime, relativeTime, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const { data: notifications } = await getMyNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Every update a reviewer has made to your cases, newest first."
        action={unread > 0 ? <MarkAllRead /> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Inbox aria-hidden className="size-6" />}
          title="Nothing yet"
          description="When a reviewer changes a case status, amends a case or records a payout, it appears here."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((item) => (
            <li key={item.id}>
              <Card
                className={cn(
                  "p-5 transition-colors",
                  !item.read && "border-royal-200 bg-royal-50/40",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl",
                      item.read ? "bg-ink-100 text-ink-500" : "bg-royal-600 text-white",
                    )}
                  >
                    <BellRing aria-hidden className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink-950">{item.title}</p>
                      {!item.read && <Badge tone="info">New</Badge>}
                    </div>
                    {item.body && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.body}</p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                      <time dateTime={item.created_at} title={formatDateTime(item.created_at)}>
                        {relativeTime(item.created_at)}
                      </time>
                      {item.reference && (
                        <Link
                          href={`/dashboard/claims/${item.reference}`}
                          className="font-mono font-semibold text-royal-600 hover:underline"
                        >
                          {item.reference}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
