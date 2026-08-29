"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, FileWarning, Loader2, ScanSearch, XCircle } from "lucide-react";
import { Alert, StatusBadge } from "@/components/ui/primitives";
import { decideClaim } from "@/app/actions/claims";
import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@/types";

type Decision = "approve" | "reject" | "review" | "request_documents";

const ACTIONS: Array<{
  key: Decision;
  label: string;
  icon: typeof CheckCircle2;
  resulting: ClaimStatus;
  className: string;
}> = [
  {
    key: "approve",
    label: "Approve",
    icon: CheckCircle2,
    resulting: "approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  },
  {
    key: "review",
    label: "Under review",
    icon: ScanSearch,
    resulting: "under_review",
    className: "border-royal-200 bg-royal-50 text-royal-800 hover:bg-royal-100",
  },
  {
    key: "request_documents",
    label: "Request docs",
    icon: FileWarning,
    resulting: "documents_required",
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
  {
    key: "reject",
    label: "Reject",
    icon: XCircle,
    resulting: "closed",
    className: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
  },
];

/** Four one-click decisions. Each writes history and notifies the customer. */
export function DecisionBar({
  claimId,
  current,
  disabled,
}: {
  claimId: string;
  current: ClaimStatus;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Decision | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );

  async function decide(decision: Decision) {
    setPending(decision);
    setFeedback(null);
    const result = await decideClaim(claimId, decision);
    setPending(null);

    if (!result.ok) {
      setFeedback({ tone: "error", message: result.message ?? "That change could not be saved." });
      return;
    }
    setFeedback({ tone: "success", message: "Saved. The customer has been notified." });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-ink-500">Current</span>
        <StatusBadge status={current} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((action) => {
          const isCurrent = action.resulting === current;
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              disabled={disabled || pending !== null || isCurrent}
              onClick={() => decide(action.key)}
              aria-label={`Set status to ${action.label}`}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
                action.className,
                (disabled || isCurrent) && "cursor-not-allowed opacity-45 hover:bg-inherit",
              )}
            >
              {pending === action.key ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Icon aria-hidden className="size-4" />
              )}
              {action.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-ink-400">
        Every decision writes a timestamped entry to the case history and notifies the customer.
        Use the panel below if you need to add your own wording.
      </p>
    </div>
  );
}
