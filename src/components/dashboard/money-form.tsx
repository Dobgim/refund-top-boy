"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/primitives";

/**
 * Shared shell for every money-moving form.
 *
 * They all do the same three things — collect fields, call one server action,
 * report what the database said — so the differences stay in the fields the
 * caller passes rather than being copied six times.
 */
export function MoneyForm<T>({
  action,
  values,
  submitLabel,
  disabled,
  disabledReason,
  successMessage,
  children,
  onDone,
}: {
  action: (raw: T) => Promise<{ ok: boolean; message?: string }>;
  values: () => T;
  submitLabel: string;
  disabled?: boolean;
  disabledReason?: string;
  successMessage: string;
  children: ReactNode;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setFeedback(null);

        const result = await action(values());
        setPending(false);

        if (!result.ok) {
          setFeedback({ tone: "error", message: result.message ?? "That did not go through." });
          return;
        }

        setFeedback({ tone: "success", message: successMessage });
        onDone?.();
        router.refresh();
      }}
    >
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}
      {disabled && disabledReason && <Alert tone="warning">{disabledReason}</Alert>}

      {children}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={pending}
        disabled={disabled}
        leadingIcon={pending ? <Loader2 aria-hidden className="size-4.5 animate-spin" /> : undefined}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
