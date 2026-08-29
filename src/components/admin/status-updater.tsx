"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { updateClaimStatus } from "@/app/actions/claims";
import { CLAIM_STATUSES, CLAIM_STATUS_META } from "@/lib/claims";
import type { ClaimStatus } from "@/types";

export function StatusUpdater({
  claimId,
  current,
  disabled,
}: {
  claimId: string;
  current: ClaimStatus;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ClaimStatus>(current);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function save() {
    setPending(true);
    setFeedback(null);
    const result = await updateClaimStatus(claimId, status, note);
    setPending(false);

    if (!result.ok) {
      setFeedback({ tone: "error", message: result.message ?? "The status could not be updated." });
      return;
    }
    setFeedback({ tone: "success", message: "Status updated and recorded on the case timeline." });
    setNote("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <Field label="Case status" htmlFor="status">
        <Select
          id="status"
          value={status}
          disabled={disabled || pending}
          onChange={(event) => setStatus(event.target.value as ClaimStatus)}
        >
          {CLAIM_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CLAIM_STATUS_META[value].label}
            </option>
          ))}
        </Select>
      </Field>

      <p className="rounded-xl bg-ink-50 px-3.5 py-3 text-sm text-ink-500">
        {CLAIM_STATUS_META[status].description}
      </p>

      <Field
        label="Note for the case owner"
        htmlFor="status-note"
        hint="Optional, but a short explanation saves a round trip."
      >
        <Textarea
          id="status-note"
          rows={3}
          value={note}
          disabled={disabled || pending}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Explain what changed and what happens next."
        />
      </Field>

      <Button
        type="button"
        fullWidth
        onClick={save}
        loading={pending}
        disabled={disabled}
        leadingIcon={<Save aria-hidden className="size-4" />}
      >
        {disabled ? "Unavailable in preview mode" : "Save status"}
      </Button>
    </div>
  );
}
