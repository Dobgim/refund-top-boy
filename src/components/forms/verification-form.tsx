"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  CheckCircle2,
  IdCard,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { submitVerification } from "@/app/actions/verification";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  ALLOWED_ID_LABEL,
  ALLOWED_ID_TYPES,
  ID_BUCKET,
  validateIdFile,
} from "@/lib/verification";
import { documentsForCountry, findSpec, specKey } from "@/lib/id-documents";
import { formatBytes, safeFileName, cn } from "@/lib/utils";

interface Side {
  file: File;
  preview: string | null;
}

function SidePicker({
  label,
  hint,
  side,
  onPick,
  onClear,
  disabled,
}: {
  label: string;
  hint: string;
  side: Side | null;
  onPick: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-sm font-semibold text-ink-800">{label}</p>
      <p className="mt-0.5 mb-2 text-xs text-ink-400">{hint}</p>

      {side ? (
        <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white">
          {side.preview ? (
            // Local object URL for a file the user just picked, never a remote asset.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={side.preview}
              alt={`${label} preview`}
              className="h-44 w-full bg-ink-50 object-contain"
            />
          ) : (
            <div className="flex h-44 items-center justify-center bg-ink-50 text-sm text-ink-500">
              PDF selected
            </div>
          )}
          <div className="flex items-center gap-2 border-t border-ink-100 px-3 py-2.5">
            <CheckCircle2 aria-hidden className="size-4 shrink-0 text-mint-600" />
            <span className="min-w-0 flex-1 truncate text-xs text-ink-600">
              {side.file.name} · {formatBytes(side.file.size)}
            </span>
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              aria-label={`Remove the ${label.toLowerCase()}`}
              className="grid size-7 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50/50 transition-colors hover:border-royal-300 hover:bg-royal-50 disabled:opacity-50"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-white text-royal-600 shadow-soft">
            <Upload aria-hidden className="size-5" />
          </span>
          <span className="text-sm font-semibold text-ink-700">Choose a photo</span>
          <span className="text-xs text-ink-400">{ALLOWED_ID_LABEL}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_ID_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function VerificationForm({
  defaultName,
  country,
  resubmitting,
}: {
  defaultName: string;
  /** Taken from the profile, so the list only offers documents that exist there. */
  country: string | null;
  resubmitting?: boolean;
}) {
  const router = useRouter();
  const available = documentsForCountry(country);
  const [selected, setSelected] = useState(() => specKey(available[0]));
  const [fullName, setFullName] = useState(defaultName);
  const [documentNumber, setDocumentNumber] = useState("");
  const [front, setFront] = useState<Side | null>(null);
  const [back, setBack] = useState<Side | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving">("idle");

  const spec = findSpec(country, selected) ?? available[0];
  // The number of images asked for follows from the document itself.
  const wantsBack = spec.sides === 2;
  const busy = phase !== "idle";

  function pick(setter: (s: Side | null) => void, sideLabel: string) {
    return (file: File) => {
      const problem = validateIdFile(file, sideLabel);
      if (problem) {
        setError(problem);
        return;
      }
      setError(null);
      setter({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      });
    };
  }

  async function upload(file: File, label: string, userId: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Storage is unavailable.");
    const path = `${userId}/${crypto.randomUUID()}-${label}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(ID_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(`The ${label} image could not be uploaded.`);
    return path;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!front) return setError("Upload the front of your document.");
    if (wantsBack && !back) return setError("This document type needs the back as well.");
    if (fullName.trim().length < 2) return setError("Enter the name printed on the document.");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return setError("Verification is unavailable on this deployment.");

    setPhase("uploading");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session expired. Please sign in again.");

      const frontPath = await upload(front.file, "front", user.id);
      const backPath = wantsBack && back ? await upload(back.file, "back", user.id) : "";

      setPhase("saving");
      const result = await submitVerification({
        documentType: spec.type,
        documentLabel: spec.label,
        fullName: fullName.trim(),
        documentNumber: documentNumber.trim(),
        frontPath,
        backPath,
      });

      if (!result.ok) throw new Error(result.message ?? "Submission failed.");

      router.refresh();
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "Something went wrong.");
    } finally {
      setPhase("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {error && <Alert tone="error">{error}</Alert>}

      <Alert tone="info" title="What we need">
        A clear photo of a government-issued document, with all four corners visible and nothing
        covered. We use it only to confirm you are who you say you are before a claim is filed.
      </Alert>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Document type"
          htmlFor="doc-type"
          hint={
            country
              ? `Documents issued in ${country}.`
              : "Set your country in profile settings for a country-specific list."
          }
          required
        >
          <Select
            id="doc-type"
            value={selected}
            disabled={busy}
            onChange={(event) => {
              setSelected(event.target.value);
              // A passport needs one image, a card needs two: drop anything
              // already picked for a side the new document does not have.
              setBack(null);
            }}
          >
            {available.map((option) => (
              <option key={specKey(option)} value={specKey(option)}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Document number"
          htmlFor="doc-number"
          hint="Optional, but it speeds the check up."
        >
          <Input
            id="doc-number"
            value={documentNumber}
            disabled={busy}
            onChange={(event) => setDocumentNumber(event.target.value)}
          />
        </Field>

        <Field
          label="Full name as printed"
          htmlFor="doc-name"
          className="sm:col-span-2"
          hint="It must match the document exactly, including middle names."
          required
        >
          <Input
            id="doc-name"
            value={fullName}
            disabled={busy}
            onChange={(event) => setFullName(event.target.value)}
          />
        </Field>
      </div>

      <div className={cn("grid gap-5", wantsBack && "sm:grid-cols-2")}>
        <SidePicker
          label={wantsBack ? "Front of document" : "Photo page"}
          hint={spec.hint ?? "The side carrying your photo."}
          side={front}
          onPick={pick(setFront, "front")}
          onClear={() => setFront(null)}
          disabled={busy}
        />

        {wantsBack && (
          <SidePicker
            label="Back of document"
            hint="The reverse, including any barcode or chip strip."
            side={back}
            onPick={pick(setBack, "back")}
            onClear={() => setBack(null)}
            disabled={busy}
          />
        )}
      </div>

      <p className="flex items-start gap-2 text-sm text-ink-500">
        <IdCard aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-300" />
        {wantsBack
          ? `A ${spec.label.toLowerCase()} is a card, so both sides are needed.`
          : `A ${spec.label.toLowerCase()} carries everything on one page, so a single image is enough.`}
      </p>

      <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-400 sm:max-w-sm">
          <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-mint-600" />
          Stored in a private bucket only you and an authorised reviewer can open, and never shown
          on any public page.
        </p>
        <Button
          type="submit"
          size="lg"
          loading={busy}
          leadingIcon={
            busy ? (
              <Loader2 aria-hidden className="size-4.5 animate-spin" />
            ) : (
              <ShieldCheck aria-hidden className="size-4.5" />
            )
          }
        >
          {phase === "uploading"
            ? "Uploading"
            : phase === "saving"
              ? "Submitting"
              : resubmitting
                ? "Resubmit for review"
                : "Submit for verification"}
        </Button>
      </div>

      {front && wantsBack && !back && (
        <p className="flex items-center gap-2 text-sm text-amber-700">
          <TriangleAlert aria-hidden className="size-4" />
          Still need the back of the document.
        </p>
      )}
    </form>
  );
}
