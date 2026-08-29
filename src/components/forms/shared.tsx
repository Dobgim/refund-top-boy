"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/ui/primitives";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** Shown wherever a form needs Supabase but the project has no credentials. */
export function SupabaseNotice({ className }: { className?: string }) {
  return (
    <Alert tone="warning" title="Supabase is not connected" className={className}>
      This preview is running without database credentials, so sign-in, registration and case data are
      unavailable. Add <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
      <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
      <code className="font-mono text-xs">.env.local</code> to enable them.
    </Alert>
  );
}

export function PasswordInput({ className, ...props }: ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-12", className)} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
      >
        {visible ? <EyeOff aria-hidden className="size-4.5" /> : <Eye aria-hidden className="size-4.5" />}
      </button>
    </div>
  );
}

const RULES = [
  { label: "10+ characters", test: (value: string) => value.length >= 10 },
  { label: "Lowercase", test: (value: string) => /[a-z]/.test(value) },
  { label: "Uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Number", test: (value: string) => /[0-9]/.test(value) },
];

export function PasswordStrength({ value }: { value: string }) {
  const passed = RULES.filter((rule) => rule.test(value)).length;
  const percent = (passed / RULES.length) * 100;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            percent < 50 ? "bg-rose-400" : percent < 100 ? "bg-amber-400" : "bg-mint-500",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn("text-xs font-medium", ok ? "text-mint-600" : "text-ink-400")}
            >
              {ok ? "✓" : "○"} {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-950">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{subtitle}</p>
    </div>
  );
}
