"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/field";
import { FieldError } from "@/components/ui/field";
import { trackSchema } from "@/lib/validations/claim";

export function TrackForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("ref") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = trackSchema.safeParse({ reference: value });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a claim reference");
      return;
    }
    setError(null);
    startTransition(() => router.push(`/track?ref=${encodeURIComponent(parsed.data.reference)}`));
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="reference" className="block text-sm font-semibold text-ink-800">
        Enter Claim Reference
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-ink-300" />
          <Input
            id="reference"
            value={value}
            onChange={(event) => setValue(event.target.value.toUpperCase())}
            placeholder="RR-2019-0118"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "reference-error" : "reference-hint"}
            className="pl-11 font-mono tracking-wide uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-royal-600 px-6 text-sm font-bold text-white transition-colors hover:bg-royal-700 disabled:opacity-60"
        >
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Search aria-hidden className="size-4" />}
          Track case
        </button>
      </div>
      <p id="reference-hint" className="mt-2 text-sm text-ink-400">
        Your reference was issued when the case was submitted. Try{" "}
        <button
          type="button"
          onClick={() => setValue("RR-2019-0118")}
          className="font-mono font-semibold text-royal-600 underline underline-offset-2"
        >
          RR-2019-0118
        </button>{" "}
        to see an example case.
      </p>
      <div className="mt-1">
        <FieldError id="reference-error">{error}</FieldError>
      </div>
    </form>
  );
}
