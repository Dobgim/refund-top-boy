"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Fieldset, Input, Select, Textarea } from "@/components/ui/field";
import { Alert, Card } from "@/components/ui/primitives";
import { SupabaseNotice } from "@/components/forms/shared";
import { claimSchema, validateUploadFile, type ClaimValues } from "@/lib/validations/claim";
import { createClaim, updateOwnClaim } from "@/app/actions/claims";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DOCUMENTS_BUCKET, isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ALLOWED_UPLOAD_LABEL,
  ALLOWED_UPLOAD_TYPES,
  CLAIM_TYPES,
  CLAIM_TYPE_LABELS,
  CURRENCY_GROUPS,
  TRANSACTION_TYPE_GROUPS,
} from "@/lib/claims";
import { COUNTRIES } from "@/lib/data/countries";
import { formatBytes, safeFileName, cn } from "@/lib/utils";

type UploadState = "queued" | "uploading" | "done" | "error";

interface Attachment {
  id: string;
  /** Stable random prefix so two files with the same name cannot collide. */
  uid: string;
  file: File;
  state: UploadState;
  error?: string;
}

export interface ClaimFormInitialValues extends Partial<ClaimValues> {
  id: string;
  reference: string;
}

export function ClaimForm({
  defaultName,
  defaultEmail,
  defaultCountry,
  /** Present when correcting an existing case rather than filing a new one. */
  editing,
}: {
  defaultName: string;
  defaultEmail: string;
  defaultCountry: string;
  editing?: ClaimFormInitialValues;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "saving" | "uploading">("idle");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      contactName: editing?.contactName ?? defaultName,
      contactEmail: editing?.contactEmail ?? defaultEmail,
      country: editing?.country ?? defaultCountry,
      transactionDate: editing?.transactionDate ?? "",
      transactionType: editing?.transactionType ?? "",
      amount: (editing?.amount ?? undefined) as unknown as number,
      currency: editing?.currency ?? "USD",
      transactionReference: editing?.transactionReference ?? "",
      claimType: editing?.claimType ?? "card_dispute",
      reason: editing?.reason ?? "",
      description: editing?.description ?? "",
      supportingDetails: editing?.supportingDetails ?? "",
    },
  });

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files);
    const accepted: Attachment[] = [];
    const rejected: string[] = [];

    for (const file of incoming) {
      const problem = validateUploadFile(file);
      if (problem) rejected.push(problem);
      else {
        const uid = crypto.randomUUID();
        accepted.push({ id: `${file.name}-${file.size}-${uid}`, uid, file, state: "queued" });
      }
    }

    setAttachments((current) => [...current, ...accepted].slice(0, 8));
    setUploadNote(rejected.length ? rejected.join(" · ") : null);
  }, []);

  async function onSubmit(values: ClaimValues) {
    setFormError(null);
    setPhase("saving");

    const result = editing
      ? await updateOwnClaim(editing.id, values)
      : await createClaim(values);

    if (!result.ok) {
      setPhase("idle");
      if (result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          setError(key as keyof ClaimValues, { message });
        }
      }
      setFormError(result.message ?? "The case could not be submitted.");
      return;
    }

    if (editing) {
      // Any newly attached files still need uploading against the same case.
      const supabaseEdit = getSupabaseBrowserClient();
      if (supabaseEdit && attachments.some((a) => a.state === "queued")) {
        setPhase("uploading");
        await uploadAttachments(supabaseEdit, editing.id);
      }
      router.push(`/dashboard/claims/${editing.reference}?updated=1`);
      router.refresh();
      return;
    }

    // Upload evidence only after the case row exists, so every object has an owner.
    const supabase = getSupabaseBrowserClient();
    if (supabase && attachments.length > 0 && result.claimId) {
      setPhase("uploading");
      await uploadAttachments(supabase, result.claimId);
    }

    router.push(`/dashboard/claims/${result.reference}?submitted=1`);
    router.refresh();
  }

  async function uploadAttachments(
    supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
    claimId: string,
  ) {
    {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      for (const attachment of attachments) {
        if (attachment.state !== "queued") continue;
        setAttachments((current) =>
          current.map((item) => (item.id === attachment.id ? { ...item, state: "uploading" } : item)),
        );

        const cleanName = safeFileName(attachment.file.name);
        const path = `${user?.id}/${claimId}/${attachment.uid}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .upload(path, attachment.file, { contentType: attachment.file.type, upsert: false });

        if (uploadError) {
          setAttachments((current) =>
            current.map((item) =>
              item.id === attachment.id
                ? { ...item, state: "error", error: "Upload failed" }
                : item,
            ),
          );
          continue;
        }

        await supabase.from("claim_documents").insert({
          claim_id: claimId,
          user_id: user?.id,
          file_name: cleanName,
          storage_path: path,
          mime_type: attachment.file.type,
          size_bytes: attachment.file.size,
        });

        setAttachments((current) =>
          current.map((item) => (item.id === attachment.id ? { ...item, state: "done" } : item)),
        );
      }
    }
  }

  const uploaded = attachments.filter((item) => item.state === "done").length;
  const busy = isSubmitting || phase !== "idle";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {!isSupabaseConfigured && <SupabaseNotice />}
      {formError && <Alert tone="error" title="Case not submitted">{formError}</Alert>}

      <Card className="p-6 sm:p-7">
        <Fieldset
          legend="Personal information"
          description="Used to match the case to the account the transaction belongs to."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="contactName" error={errors.contactName?.message} required>
              <Input id="contactName" autoComplete="name" {...register("contactName")} />
            </Field>
            <Field label="Email address" htmlFor="contactEmail" error={errors.contactEmail?.message} required>
              <Input id="contactEmail" type="email" autoComplete="email" {...register("contactEmail")} />
            </Field>
            <Field label="Country" htmlFor="country" error={errors.country?.message} required className="sm:col-span-2">
              <Select id="country" {...register("country")}>
                <option value="">Select a country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </Select>
            </Field>
          </div>
        </Fieldset>
      </Card>

      <Card className="p-6 sm:p-7">
        <Fieldset
          legend="Transaction information"
          description="Copy these from your bank statement or block explorer. Accuracy here shortens the review considerably."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Transaction date" htmlFor="transactionDate" error={errors.transactionDate?.message} required>
              <Input id="transactionDate" type="date" {...register("transactionDate")} />
            </Field>
            <Field label="Transaction type" htmlFor="transactionType" error={errors.transactionType?.message} required>
              <Select id="transactionType" {...register("transactionType")}>
                <option value="">Select a type</option>
                {TRANSACTION_TYPE_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Field label="Amount" htmlFor="amount" error={errors.amount?.message} required>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                {...register("amount", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Currency" htmlFor="currency" error={errors.currency?.message} required>
              <Select id="currency" {...register("currency")}>
                {CURRENCY_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Field
              label="Reference number"
              htmlFor="transactionReference"
              error={errors.transactionReference?.message}
              hint="Optional. The bank or merchant reference from your statement, or the transaction hash for an on-chain transfer."
              className="sm:col-span-2"
            >
              <Input
                id="transactionReference"
                
                className="font-mono text-sm"
                {...register("transactionReference")}
              />
            </Field>
          </div>
        </Fieldset>
      </Card>

      <Card className="p-6 sm:p-7">
        <Fieldset legend="Case information" description="Tell the reviewer what went wrong, in your own words.">
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Case type" htmlFor="claimType" error={errors.claimType?.message} required>
                <Select id="claimType" {...register("claimType")}>
                  {CLAIM_TYPES.map((type) => (
                    <option key={type} value={type}>{CLAIM_TYPE_LABELS[type]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Reason" htmlFor="reason" error={errors.reason?.message} required hint="A one-line summary.">
                <Input id="reason" {...register("reason")} />
              </Field>
            </div>

            <Field
              label="What happened"
              htmlFor="description"
              error={errors.description?.message}
              required
              hint="Include dates, what you expected, and what the merchant or bank has said so far."
            >
              <Textarea id="description" rows={6} {...register("description")} />
            </Field>

            <Field
              label="Supporting details"
              htmlFor="supportingDetails"
              error={errors.supportingDetails?.message}
              hint="Optional. Anything else a reviewer should know."
            >
              <Textarea id="supportingDetails" rows={3} {...register("supportingDetails")} />
            </Field>
          </div>
        </Fieldset>
      </Card>

      <Card className="p-6 sm:p-7">
        <Fieldset legend="Documents" description={`Attach the evidence that supports the case. ${ALLOWED_UPLOAD_LABEL}.`}>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={cn(
              "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
              dragging ? "border-royal-400 bg-royal-50" : "border-ink-200 bg-ink-50/50",
            )}
          >
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-royal-600 shadow-soft">
              <UploadCloud aria-hidden className="size-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-800">
              Drag files here, or choose them from your device
            </p>
            <p className="mt-1 text-xs text-ink-400">{ALLOWED_UPLOAD_LABEL} · up to 8 files</p>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ALLOWED_UPLOAD_TYPES.join(",")}
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
              leadingIcon={<Paperclip aria-hidden className="size-4" />}
            >
              Choose files
            </Button>
          </div>

          {uploadNote && (
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-amber-700">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {uploadNote}
            </p>
          )}

          {attachments.length > 0 && (
            <>
              <ul className="mt-5 space-y-2">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3.5 py-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
                      <FileText aria-hidden className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {attachment.file.name}
                      </span>
                      <span className="block text-xs text-ink-400">
                        {formatBytes(attachment.file.size)}
                        {attachment.error ? ` · ${attachment.error}` : ""}
                      </span>
                    </span>

                    {attachment.state === "uploading" && (
                      <Loader2 aria-label="Uploading" className="size-4 animate-spin text-royal-600" />
                    )}
                    {attachment.state === "done" && (
                      <CheckCircle2 aria-label="Uploaded" className="size-4.5 text-mint-500" />
                    )}
                    {attachment.state === "error" && (
                      <TriangleAlert aria-label="Failed" className="size-4.5 text-rose-500" />
                    )}
                    {attachment.state === "queued" && (
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((current) => current.filter((item) => item.id !== attachment.id))
                        }
                        aria-label={`Remove ${attachment.file.name}`}
                        className="grid size-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {phase === "uploading" && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-royal-600 transition-[width] duration-300"
                      style={{ width: `${(uploaded / attachments.length) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    Uploading {uploaded} of {attachments.length} files
                  </p>
                </div>
              )}
            </>
          )}
        </Fieldset>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-400 sm:max-w-md">
          By submitting you confirm the information is accurate to the best of your knowledge. Never
          include a password, card PIN, full card number or recovery phrase in a case.
        </p>
        <Button
          type="submit"
          size="lg"
          loading={busy}
          leadingIcon={<Send aria-hidden className="size-4.5" />}
        >
          {phase === "uploading"
          ? "Uploading documents"
          : editing
            ? "Save and resubmit"
            : "Submit case"}
        </Button>
      </div>
    </form>
  );
}
