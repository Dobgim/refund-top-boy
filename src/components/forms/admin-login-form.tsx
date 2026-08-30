"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { AuthHeading, PasswordInput, SupabaseNotice } from "@/components/forms/shared";
import { Turnstile } from "@/components/forms/turnstile";
import { isTurnstileEnabled } from "@/lib/turnstile";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Staff sign-in. No registration link and no sign-up path: administrator
 * accounts are provisioned directly, never self-served.
 *
 * The role itself is still decided server-side. This form only authenticates;
 * `/admin` re-reads the role from the database and row level security enforces
 * it again on every query.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFormError("Authentication is unavailable until Supabase credentials are configured.");
      return;
    }

    if (isTurnstileEnabled && !captchaToken) {
      setFormError("Please complete the security check below.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
      ...(captchaToken ? { options: { captchaToken } } : {}),
    });

    if (error || !data.user) {
      // Deliberately identical for a wrong password and a non-admin account:
      // this page should not confirm which addresses hold staff access.
      setFormError("Those credentials do not match an administrator account.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if ((profile as { role?: string } | null)?.role !== "admin") {
      await supabase.auth.signOut();
      setFormError("Those credentials do not match an administrator account.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div>
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-xs font-bold tracking-[0.14em] text-ink-600 uppercase">
        <ShieldCheck aria-hidden className="size-3.5 text-royal-600" />
        Staff access
      </span>

      <AuthHeading
        title="Administrator sign in"
        subtitle="Restricted to authorised reviewers. Every action taken here is written to the activity log."
      />

      {!isSupabaseConfigured && <SupabaseNotice className="mb-6" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Work email" htmlFor="admin-email" error={errors.email?.message} required>
          <Input
            id="admin-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field label="Password" htmlFor="admin-password" error={errors.password?.message} required>
          <PasswordInput
            id="admin-password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Turnstile onToken={setCaptchaToken} />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          leadingIcon={<LogIn aria-hidden className="size-4.5" />}
        >
          Sign in to admin
        </Button>
      </form>

      <p className="mt-8 text-center text-xs leading-relaxed text-ink-400">
        Administrator accounts are provisioned directly and cannot be created from this page.
      </p>
    </div>
  );
}
