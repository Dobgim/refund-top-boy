"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { TURNSTILE_SITE_KEY, isTurnstileEnabled } from "@/lib/turnstile";
import { cn } from "@/lib/utils";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      appearance?: "always" | "execute" | "interaction-only";
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads the Cloudflare script once, however many widgets are on the page. */
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Renders the Turnstile challenge and hands the resulting token to the parent.
 * Renders nothing at all when no site key is configured.
 */
export function Turnstile({
  onToken,
  className,
  theme = "light",
}: {
  onToken: (token: string | null) => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);
  const id = useId();

  // Keep the latest callback without re-rendering the widget.
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!isTurnstileEnabled) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(hostRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          callback: (token) => onTokenRef.current(token),
          "error-callback": () => onTokenRef.current(null),
          "expired-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      const widgetId = widgetIdRef.current;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // Widget already torn down with the DOM node.
        }
      }
    };
  }, [theme]);

  if (!isTurnstileEnabled) return null;

  if (failed) {
    return (
      <p role="alert" className={cn("text-sm text-amber-700", className)}>
        The security check could not load. Disable any ad blocker for this site and refresh.
      </p>
    );
  }

  return (
    <div className={className}>
      <div ref={hostRef} id={`turnstile-${id}`} />
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
        <ShieldCheck aria-hidden className="size-3.5 text-mint-500" />
        Protected by Cloudflare Turnstile
      </p>
    </div>
  );
}
