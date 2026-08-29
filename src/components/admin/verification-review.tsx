"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/primitives";
import { Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { reviewVerification } from "@/app/actions/verification";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ID_BUCKET } from "@/lib/verification";
import { cn } from "@/lib/utils";

/** Renders one stored document behind a short-lived signed URL. */
function DocumentPane({ path, label }: { path: string; label: string }) {
  // Resolved in the initialiser rather than in an effect, so the unavailable
  // case does not cause a second render pass.
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(() => !path);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !path) return;
    let active = true;
    supabase.storage
      .from(ID_BUCKET)
      .createSignedUrl(path, 300)
      .then(({ data, error }: { data: { signedUrl?: string } | null; error: unknown }) => {
        if (!active) return;
        if (error || !data?.signedUrl) setFailed(true);
        else setUrl(data.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [path]);

  const isPdf = path.toLowerCase().endsWith(".pdf");

  return (
    <figure className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <figcaption className="flex items-center justify-between gap-3 border-b border-ink-100 px-3.5 py-2.5">
        <span className="text-xs font-bold tracking-wide text-ink-600 uppercase">{label}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-royal-600 hover:text-royal-800"
          >
            Open full size
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
        )}
      </figcaption>

      <div className="grid h-64 place-items-center bg-ink-50">
        {failed ? (
          <p className="px-4 text-center text-sm text-ink-400">
            This document could not be opened.
          </p>
        ) : !url ? (
          <Loader2 aria-label="Loading document" className="size-5 animate-spin text-royal-600" />
        ) : isPdf ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-royal-600 hover:underline"
          >
            Open the PDF
          </a>
        ) : (
          // Signed, expiring URL from Supabase Storage — not a static asset.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-contain" />
        )}
      </div>
    </figure>
  );
}

export function VerificationReview({
  verificationId,
  frontPath,
  backPath,
  decided,
}: {
  verificationId: string;
  frontPath: string;
  backPath: string | null;
  decided: boolean;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<"verified" | "rejected" | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );

  async function decide(decision: "verified" | "rejected") {
    setPending(decision);
    setFeedback(null);
    const result = await reviewVerification(verificationId, decision, reason);
    setPending(null);

    if (!result.ok) {
      setFeedback({ tone: "error", message: result.message ?? "The decision could not be saved." });
      return;
    }
    setFeedback({
      tone: "success",
      message:
        decision === "verified"
          ? "Approved. The customer can now file claims."
          : "Rejected. The customer has been told why and can resubmit.",
    });
    setReason("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <div className={cn("grid gap-4", backPath && "sm:grid-cols-2")}>
        <DocumentPane path={frontPath} label="Front" />
        {backPath && <DocumentPane path={backPath} label="Back" />}
      </div>

      <div>
        <label htmlFor={`reason-${verificationId}`} className="text-sm font-semibold text-ink-800">
          Reason, if rejecting
        </label>
        <p className="mt-0.5 mb-2 text-xs text-ink-400">
          Shown to the customer verbatim, so say what they need to change.
        </p>
        <Textarea
          id={`reason-${verificationId}`}
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. The back of the card is blurred and the number cannot be read."
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={() => decide("verified")}
          loading={pending === "verified"}
          disabled={pending !== null}
          leadingIcon={<CheckCircle2 aria-hidden className="size-4" />}
        >
          {decided ? "Re-approve" : "Approve"}
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => decide("rejected")}
          loading={pending === "rejected"}
          disabled={pending !== null}
          leadingIcon={<XCircle aria-hidden className="size-4" />}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
