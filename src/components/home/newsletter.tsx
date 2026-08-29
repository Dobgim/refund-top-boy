"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { Turnstile } from "@/components/forms/turnstile";
import { newsletterSchema } from "@/lib/validations/claim";
import type { ActionState } from "@/types";
import { cn } from "@/lib/utils";

const INITIAL: ActionState = { status: "idle" };

function SubmitButton({ tone }: { tone: "light" | "dark" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors disabled:opacity-60",
        tone === "dark"
          ? "bg-white text-ink-950 hover:bg-gold-300"
          : "bg-royal-600 text-white hover:bg-royal-700",
      )}
    >
      {pending ? (
        <Loader2 aria-hidden className="size-4 animate-spin" />
      ) : (
        <ArrowRight aria-hidden className="size-4" />
      )}
      Subscribe
    </button>
  );
}

export function NewsletterForm({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const [state, formAction] = useActionState(subscribeToNewsletter, INITIAL);
  const [clientError, setClientError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const message = clientError ?? (state.status !== "idle" ? state.message : null);
  const isError = Boolean(clientError) || state.status === "error";
  const describedBy = message ? "newsletter-feedback" : undefined;

  return (
    <div className={className}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(event) => {
          const data = new FormData(event.currentTarget);
          const parsed = newsletterSchema.safeParse({ email: data.get("email") });
          if (!parsed.success) {
            event.preventDefault();
            setClientError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
            return;
          }
          setClientError(null);
        }}
        className="space-y-3"
        noValidate
      >
        <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Mail
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2",
              tone === "dark" ? "text-ink-400" : "text-ink-300",
            )}
          />
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            aria-invalid={isError || undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-12 w-full rounded-xl border pr-4 pl-11 text-sm transition-colors focus:outline-none focus:ring-4",
              tone === "dark"
                ? "border-white/12 bg-white/5 text-white placeholder:text-ink-500 focus:border-royal-400 focus:ring-royal-500/20"
                : "border-ink-200 bg-white text-ink-900 placeholder:text-ink-300 focus:border-royal-500 focus:ring-royal-500/12",
            )}
          />
        </div>
        <SubmitButton tone={tone} />
        </div>

        {/* Must live inside the form so its token is posted with the action. */}
        <Turnstile theme={tone === "dark" ? "dark" : "light"} onToken={setCaptchaToken} />
        <input type="hidden" name="cf-turnstile-response" value={captchaToken ?? ""} />
      </form>

      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={message}
            id="newsletter-feedback"
            role={isError ? "alert" : "status"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-3 flex items-start gap-2 text-sm font-medium",
              isError
                ? tone === "dark"
                  ? "text-rose-300"
                  : "text-rose-600"
                : tone === "dark"
                  ? "text-mint-400"
                  : "text-emerald-600",
            )}
          >
            {isError ? (
              <XCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
            )}
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
