import Link from "next/link";
import { ArrowUpRight, MessagesSquare } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { getAdminMessages } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const { data: messages } = await getAdminMessages();
  const awaitingReply = messages.filter((message) => message.sender_role === "user").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Customer communication across every case, newest first. Open a case to reply in context."
      />

      <p className="text-sm text-ink-500">
        {messages.length} total · {awaitingReply} from customers
      </p>

      {messages.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare aria-hidden className="size-6" />}
          title="No messages yet"
          description="Conversations started on a case will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => (
            <li key={message.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/claims/${message.reference}`}
                    className="inline-flex items-center gap-1 font-mono text-sm font-bold text-royal-700 hover:underline"
                  >
                    {message.reference}
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </Link>
                  <Badge tone={message.sender_role === "admin" ? "info" : "neutral"}>
                    {message.sender_role === "admin" ? "Case handler" : "Customer"}
                  </Badge>
                  <time dateTime={message.created_at} className="ml-auto text-xs text-ink-400">
                    {formatDateTime(message.created_at)}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{message.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
