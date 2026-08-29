"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { updateClaimDetails } from "@/app/actions/claims";
import { adminClaimEditSchema, type AdminClaimEditValues } from "@/lib/validations/claim";
import {
  CLAIM_TYPES,
  CLAIM_TYPE_LABELS,
  CURRENCY_GROUPS,
  TRANSACTION_TYPE_GROUPS,
} from "@/lib/claims";
import type { ClaimDetail } from "@/lib/queries";

export function ClaimEditor({ claim, disabled }: { claim: ClaimDetail; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminClaimEditValues>({
    resolver: zodResolver(adminClaimEditSchema),
    defaultValues: {
      claimType: claim.claim_type,
      amount: claim.amount,
      currency: claim.currency as AdminClaimEditValues["currency"],
      transactionDate: claim.transaction_date ?? "",
      transactionType: claim.transaction_type ?? "",
      transactionReference: claim.transaction_reference ?? "",
      reason: claim.reason,
      description: claim.description,
      supportingDetails: claim.supporting_details ?? "",
    },
  });

  async function onSubmit(values: AdminClaimEditValues) {
    setFeedback(null);
    const result = await updateClaimDetails(claim.id, values);
    if (!result.ok) {
      setFeedback({ tone: "error", message: result.message ?? "The case could not be updated." });
      return;
    }
    setFeedback({ tone: "success", message: "Case updated. The customer has been notified." });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="space-y-3">
        {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}
        <Button
          type="button"
          variant="outline"
          fullWidth
          disabled={disabled}
          onClick={() => setOpen(true)}
          leadingIcon={<PencilLine aria-hidden className="size-4" />}
        >
          {disabled ? "Unavailable in preview mode" : "Edit case details"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Case type" htmlFor="edit-type" error={errors.claimType?.message}>
          <Select id="edit-type" {...register("claimType")}>
            {CLAIM_TYPES.map((type) => (
              <option key={type} value={type}>{CLAIM_TYPE_LABELS[type]}</option>
            ))}
          </Select>
        </Field>

        <Field label="Currency" htmlFor="edit-currency" error={errors.currency?.message}>
          <Select id="edit-currency" {...register("currency")}>
            {CURRENCY_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <Field label="Amount claimed" htmlFor="edit-amount" error={errors.amount?.message}>
          <Input
            id="edit-amount"
            type="number"
            step="any"
            min="0"
            {...register("amount", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Transaction date" htmlFor="edit-date" error={errors.transactionDate?.message}>
          <Input id="edit-date" type="date" {...register("transactionDate")} />
        </Field>

        <Field label="Transaction type" htmlFor="edit-txtype" error={errors.transactionType?.message}>
          <Select id="edit-txtype" {...register("transactionType")}>
            <option value="">Not recorded</option>
            {TRANSACTION_TYPE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <Field
          label="Transaction reference"
          htmlFor="edit-txref"
          error={errors.transactionReference?.message}
        >
          <Input id="edit-txref" className="font-mono text-sm" {...register("transactionReference")} />
        </Field>
      </div>

      <Field label="Reason" htmlFor="edit-reason" error={errors.reason?.message}>
        <Input id="edit-reason" {...register("reason")} />
      </Field>

      <Field label="What happened" htmlFor="edit-desc" error={errors.description?.message}>
        <Textarea id="edit-desc" rows={5} {...register("description")} />
      </Field>

      <Field
        label="Supporting details"
        htmlFor="edit-support"
        error={errors.supportingDetails?.message}
      >
        <Textarea id="edit-support" rows={3} {...register("supportingDetails")} />
      </Field>

      <p className="text-xs text-ink-400">
        The customer is notified whenever a reviewer amends their case.
      </p>

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={isSubmitting}
          leadingIcon={<Save aria-hidden className="size-4" />}
        >
          Save changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          leadingIcon={<X aria-hidden className="size-4" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
