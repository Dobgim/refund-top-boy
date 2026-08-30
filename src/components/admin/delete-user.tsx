"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Trash2, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { deleteUserAccount } from "@/app/actions/users";

/**
 * Deletion is permanent and cascades through every table, so it asks the
 * reviewer to type the account's email first. A single misplaced click should
 * not be able to destroy someone's cases, documents and balance.
 */
export function DeleteUserButton({
  userId,
  email,
  name,
  disabled,
  disabledReason,
}: {
  userId: string;
  email: string;
  name: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = confirmation.trim().toLowerCase() === email.toLowerCase();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function confirm() {
    setPending(true);
    setError(null);
    const result = await deleteUserAccount(userId);
    setPending(false);

    if (!result.ok) {
      setError(result.message ?? "The account could not be deleted.");
      return;
    }
    setOpen(false);
    setConfirmation("");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        title={disabled ? disabledReason : `Delete ${name}`}
        onClick={() => setOpen(true)}
        aria-label={`Delete ${name}`}
        className="grid size-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-400"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-${userId}`}
          className="fixed inset-0 z-50 grid place-items-center p-4"
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md rounded-card border border-ink-100 bg-white p-6 shadow-lift">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-50"
            >
              <X aria-hidden className="size-4" />
            </button>

            <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <TriangleAlert aria-hidden className="size-6" />
            </span>

            <h2
              id={`delete-${userId}`}
              className="mt-4 font-display text-xl font-bold tracking-tight text-ink-950"
            >
              Delete {name}?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              This removes the account from Supabase entirely, along with their claims, uploaded
              documents, identity verification, messages, notifications, bank account and full
              transaction history. It cannot be undone.
            </p>

            {error && (
              <Alert tone="error" className="mt-4">
                {error}
              </Alert>
            )}

            <label
              htmlFor={`confirm-${userId}`}
              className="mt-5 block text-sm font-semibold text-ink-800"
            >
              Type <span className="font-mono text-ink-950">{email}</span> to confirm
            </label>
            <Input
              id={`confirm-${userId}`}
              value={confirmation}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-2 font-mono text-sm"
            />

            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                type="button"
                variant="danger"
                fullWidth
                disabled={!matches || pending}
                onClick={confirm}
                leadingIcon={
                  pending ? (
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                  ) : (
                    <Trash2 aria-hidden className="size-4" />
                  )
                }
              >
                Delete permanently
              </Button>
              <Button type="button" variant="outline" fullWidth onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
