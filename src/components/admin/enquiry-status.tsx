"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CircleDot, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { deleteEnquiry, setEnquiryStatus } from "@/app/actions/support";
import { cn } from "@/lib/utils";

type Status = "new" | "in_progress" | "resolved";

const NEXT: Array<{ to: Status; label: string; icon: typeof Check; className: string }> = [
  {
    to: "in_progress",
    label: "Working on it",
    icon: CircleDot,
    className: "border-royal-200 bg-royal-50 text-royal-800 hover:bg-royal-100",
  },
  {
    to: "resolved",
    label: "Resolved",
    icon: Check,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  },
  {
    to: "new",
    label: "Reopen",
    icon: RotateCcw,
    className: "border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
  },
];

export function EnquiryStatusControls({ id, current }: { id: string; current: Status }) {
  const router = useRouter();
  const [pending, setPending] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Deleting is irreversible, so the button asks once before it will do it.
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function move(to: Status) {
    setPending(to);
    setError(null);
    const result = await setEnquiryStatus(id, to);
    setPending(null);
    if (!result.ok) {
      setError(result.message ?? "That change could not be saved.");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    setError(null);
    const result = await deleteEnquiry(id);
    if (!result.ok) {
      setDeleting(false);
      setConfirming(false);
      setError(result.message ?? "That message could not be deleted.");
      return;
    }
    // Left spinning on purpose: the row is about to disappear with the refresh.
    router.refresh();
  }

  const busy = pending !== null || deleting;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {NEXT.filter((action) => action.to !== current).map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.to}
              type="button"
              disabled={busy}
              onClick={() => move(action.to)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50",
                action.className,
              )}
            >
              {pending === action.to ? (
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
              ) : (
                <Icon aria-hidden className="size-3.5" />
              )}
              {action.label}
            </button>
          );
        })}

        <button
          type="button"
          disabled={busy}
          onClick={remove}
          onBlur={() => setConfirming(false)}
          aria-label={confirming ? "Confirm deleting this message" : "Delete this message"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50",
            confirming
              ? "border-rose-300 bg-rose-100 text-rose-900 hover:bg-rose-200"
              : "border-ink-200 bg-white text-ink-500 hover:bg-rose-50 hover:text-rose-700",
          )}
        >
          {deleting ? (
            <Loader2 aria-hidden className="size-3.5 animate-spin" />
          ) : (
            <Trash2 aria-hidden className="size-3.5" />
          )}
          {confirming ? "Delete for good?" : "Delete"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
