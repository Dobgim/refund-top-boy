"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Keeps the marketing pages statically renderable: they ship with the signed-out
 * buttons and swap to a dashboard link once the browser confirms a session.
 */
export function AuthNavButtons({
  tone = "dark",
  stacked = false,
  onNavigate,
}: {
  tone?: "dark" | "light";
  stacked?: boolean;
  onNavigate?: () => void;
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(() =>
    getSupabaseBrowserClient() ? null : false,
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      if (active) setSignedIn(Boolean(data.user));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const wrap = cn("flex gap-2", stacked ? "flex-col" : "items-center");

  if (signedIn) {
    return (
      <div className={wrap}>
        <ButtonLink
          href="/dashboard"
          size={stacked ? "lg" : "md"}
          fullWidth={stacked}
          onClick={onNavigate}
          leadingIcon={<LayoutDashboard aria-hidden className="size-4" />}
        >
          Dashboard
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <ButtonLink
        href="/login"
        variant={tone === "light" ? "ghost" : "ghost"}
        size={stacked ? "lg" : "md"}
        fullWidth={stacked}
        onClick={onNavigate}
        className={tone === "light" ? "text-white hover:bg-white/10 hover:text-white" : undefined}
      >
        Login
      </ButtonLink>
      <ButtonLink href="/register" size={stacked ? "lg" : "md"} fullWidth={stacked} onClick={onNavigate}>
        Get Started
      </ButtonLink>
    </div>
  );
}
