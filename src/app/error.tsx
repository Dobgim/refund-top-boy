"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the platform log; the digest is what support would ask for.
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--page-muted)] px-6 py-20">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <TriangleAlert aria-hidden className="size-8" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink-950">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          The page could not be rendered. Nothing you submitted has been lost — try again, and if it
          keeps happening, send us the reference below.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-ink-400">Error reference: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} leadingIcon={<RefreshCw aria-hidden className="size-4" />}>
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-ink-200 bg-white px-5 text-[0.95rem] font-semibold text-ink-900 transition-colors hover:bg-ink-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
