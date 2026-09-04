"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { decideLoan, decideWithdrawal } from "@/app/actions/banking";
import { cn } from "@/lib/utils";

type Kind = "withdrawal" | "loan";

/**
 * Approve or reject a withdrawal or a loan.
 *
 * Both decisions run through a database function that moves the money and sets
 * the status in one call, so the note is the only thing collected here. A
 * rejection asks for one and an approval does not: the customer is told why
 * they were turned down, and "approved" explains itself.
 */
export function RequestDecision({ id, kind }: { id: string; kind: Kind }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(choice: "approve" | "reject") {
    if (choice === "reject" && note.trim().length < 4) {
      setError("Say why it was rejected, so the customer knows what to do next.");
      return;
    }

    setPending(choice);
    setError(null);

    const result =
      kind === "withdrawal"
        ? await decideWithdrawal(id, choice === "approve" ? "completed" : "rejected", note)
        : await decideLoan(id, choice === "approve" ? "approved" : "rejected", note);

    if (!result.ok) {
      setPending(null);
      setError(result.message ?? "That decision could not be saved.");
      return;
    }

    // Left pending on purpose: the row is about to move out of the list.
    router.refresh();
  }

  return (
    <div className="mt-4 border-t border-ink-100 pt-4">
      <label htmlFor={`note-${id}`} className="text-xs font-bold text-ink-500">
        Note to the customer
        <span className="font-medium text-ink-400"> — required to reject</span>
      </label>
      <textarea
        id={`note-${id}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={2}
        maxLength={300}
        placeholder="Paid out to the account on file."
        className="mt-1.5 w-full resize-y rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 focus:border-royal-400 focus:ring-2 focus:ring-royal-100 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => decide("approve")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50",
          )}
        >
          {pending === "approve" ? (
            <Loader2 aria-hidden className="size-3.5 animate-spin" />
          ) : (
            <Check aria-hidden className="size-3.5" />
          )}
          {kind === "withdrawal" ? "Mark as paid" : "Approve"}
        </button>

        <button
          type="button"
          disabled={pending !== null}
          onClick={() => decide("reject")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 transition-colors hover:bg-rose-100 disabled:opacity-50"
        >
          {pending === "reject" ? (
            <Loader2 aria-hidden className="size-3.5 animate-spin" />
          ) : (
            <X aria-hidden className="size-3.5" />
          )}
          Reject
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
