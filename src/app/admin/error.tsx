"use client";

import { RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <Alert tone="error" title="This page could not be loaded">
        The case data could not be read. This is usually temporary.
        {error.digest ? ` Reference: ${error.digest}.` : ""}
      </Alert>
      <Button className="mt-5" onClick={reset} leadingIcon={<RefreshCw aria-hidden className="size-4" />}>
        Try again
      </Button>
    </div>
  );
}
