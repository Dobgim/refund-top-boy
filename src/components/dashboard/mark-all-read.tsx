"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/app/actions/claims";

export function MarkAllRead() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={pending}
      leadingIcon={<CheckCheck aria-hidden className="size-4" />}
      onClick={async () => {
        setPending(true);
        await markNotificationsRead();
        setPending(false);
        router.refresh();
      }}
    >
      Mark all as read
    </Button>
  );
}
