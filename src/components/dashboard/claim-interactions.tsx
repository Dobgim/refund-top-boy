"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, FileText, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Alert, EmptyState } from "@/components/ui/primitives";
import { postClaimMessage } from "@/app/actions/claims";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DOCUMENTS_BUCKET } from "@/lib/supabase/config";
import { formatBytes, formatDateTime, cn } from "@/lib/utils";

export function MessageComposer({ claimId, disabled }: { claimId: string; disabled?: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setPending(true);
    setError(null);
    const result = await postClaimMessage(claimId, body);
    setPending(false);
    if (!result.ok) {
      setError(result.message ?? "The message could not be sent.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="mt-5">
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <label htmlFor="message-body" className="sr-only">
        Message to your case handler
      </label>
      <Textarea
        id="message-body"
        rows={3}
        value={body}
        disabled={disabled || pending}
        onChange={(event) => setBody(event.target.value)}
        placeholder={disabled ? "Messaging is unavailable in this preview." : "Write a message"}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-400">Never include a password, PIN or full card number.</p>
        <Button
          type="button"
          size="sm"
          onClick={send}
          disabled={disabled || body.trim().length < 2}
          loading={pending}
          leadingIcon={<Send aria-hidden className="size-4" />}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export function MessageThread({
  messages,
}: {
  messages: Array<{ id: string; sender_role: "user" | "admin"; body: string; created_at: string }>;
}) {
  if (messages.length === 0) {
    return (
      <p className="mt-4 text-sm text-ink-400">
        No messages yet. Anything you or your reviewer writes will appear here.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {messages.map((message) => {
        const fromReviewer = message.sender_role === "admin";
        return (
          <li
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3",
              fromReviewer
                ? "mr-auto rounded-tl-sm bg-ink-100 text-ink-800"
                : "ml-auto rounded-tr-sm bg-royal-600 text-white",
            )}
          >
            <p className="text-[0.68rem] font-bold tracking-wide uppercase opacity-70">
              {fromReviewer ? "Case handler" : "You"}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{message.body}</p>
            <time
              dateTime={message.created_at}
              className={cn("mt-1.5 block text-[0.68rem]", fromReviewer ? "text-ink-400" : "text-white/60")}
            >
              {formatDateTime(message.created_at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}

export function DocumentList({
  documents,
  demo,
}: {
  documents: Array<{ id: string; file_name: string; size_bytes: number; created_at: string; storage_path: string }>;
  demo: boolean;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function open(id: string, path: string) {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !path) {
      setError("Downloads are unavailable in this preview.");
      return;
    }
    setBusyId(id);
    const { data, error: signError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(path, 60);
    setBusyId(null);

    if (signError || !data?.signedUrl) {
      setError("That document could not be opened. It may have been removed.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        className="mt-4 py-10"
        icon={<FileText aria-hidden className="size-5" />}
        title="No documents attached"
        description="Evidence you upload for this case will be listed here."
      />
    );
  }

  return (
    <div className="mt-4">
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <ul className="space-y-2">
        {documents.map((document) => (
          <li
            key={document.id}
            className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3.5 py-3"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-royal-50 text-royal-600">
              <FileText aria-hidden className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900">
                {document.file_name}
              </span>
              <span className="block text-xs text-ink-400">
                {formatBytes(document.size_bytes)} · {formatDateTime(document.created_at)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => open(document.id, document.storage_path)}
              disabled={demo}
              aria-label={`Open ${document.file_name}`}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-royal-50 hover:text-royal-700 disabled:opacity-40"
            >
              {busyId === document.id ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Download aria-hidden className="size-4" />
              )}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-400">
        Documents are stored privately and opened through a link that expires after one minute.
      </p>
    </div>
  );
}
