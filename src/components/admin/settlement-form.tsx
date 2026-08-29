"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BanknoteArrowDown, Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { recordSettlement } from "@/app/actions/claims";
import { settlementSchema, type SettlementValues } from "@/lib/validations/claim";
import { SETTLEMENT_METHODS, SETTLEMENT_METHOD_LABELS } from "@/lib/claims";
import { formatCurrency } from "@/lib/utils";
import type { ClaimDetail } from "@/lib/queries";

export function SettlementForm({ claim, disabled }: { claim: ClaimDetail; disabled?: boolean }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettlementValues>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      approvedAmount: claim.approved_amount ?? claim.amount,
      method: claim.settlement_method ?? "original_payment_method",
      reference: claim.settlement_reference ?? "",
      note: claim.settlement_note ?? "",
    },
  });

  async function onSubmit(values: SettlementValues) {
    setFeedback(null);
    const result = await recordSettlement(claim.id, values);
    if (!result.ok) {
      setFeedback({ tone: "error", message: result.message ?? "The payout could not be saved." });
      return;
    }
    setFeedback({
      tone: "success",
      message: "Payout recorded. The customer can see it on their dashboard.",
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <p className="flex items-start gap-2 rounded-xl bg-ink-50 px-3.5 py-3 text-sm text-ink-500">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        This records money being returned <strong className="font-semibold">to</strong> the customer.
        RoyalRefund never debits a customer and stores no card details.
      </p>

      <Field
        label="Amount approved"
        htmlFor="settle-amount"
        error={errors.approvedAmount?.message}
        hint={`Claimed: ${formatCurrency(claim.amount, claim.currency)}. Cannot exceed this.`}
        required
      >
        <Input
          id="settle-amount"
          type="number"
          step="any"
          min="0"
          {...register("approvedAmount", { valueAsNumber: true })}
        />
      </Field>

      <Field label="Returned via" htmlFor="settle-method" error={errors.method?.message} required>
        <Select id="settle-method" {...register("method")}>
          {SETTLEMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {SETTLEMENT_METHOD_LABELS[method]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Payout reference"
        htmlFor="settle-ref"
        error={errors.reference?.message}
        hint="Optional. The bank reference or transaction hash for the outgoing payment."
      >
        <Input id="settle-ref" className="font-mono text-sm" {...register("reference")} />
      </Field>

      <Field
        label="Note for the customer"
        htmlFor="settle-note"
        error={errors.note?.message}
        hint="Shown on their case and included in the notification."
      >
        <Textarea id="settle-note" rows={3} {...register("note")} />
      </Field>

      <Button
        type="submit"
        fullWidth
        loading={isSubmitting}
        disabled={disabled}
        leadingIcon={
          disabled ? (
            <Save aria-hidden className="size-4" />
          ) : (
            <BanknoteArrowDown aria-hidden className="size-4" />
          )
        }
      >
        {disabled ? "Unavailable in preview mode" : "Record payout to customer"}
      </Button>
    </form>
  );
}
