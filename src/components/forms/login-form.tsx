"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { AuthHeading, PasswordInput, SupabaseNotice } from "@/components/forms/shared";
import { Turnstile } from "@/components/forms/turnstile";
import { isTurnstileEnabled } from "@/lib/turnstile";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const notice = params.get("notice");

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

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
      ...(captchaToken ? { options: { captchaToken } } : {}),
    });

    if (error) {
      setFormError(
        error.message.toLowerCase().includes("invalid")
          ? "That email and password combination does not match an account."
          : error.message,
      );
      return;
    }

    const next = params.get("next");
    router.replace(next && next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <div>
      <AuthHeading
        title="Welcome back"
        subtitle="Sign in to review your cases, answer a reviewer or start a new claim."
      />

      {!isSupabaseConfigured && <SupabaseNotice className="mb-6" />}

      {notice === "registered" && (
        <Alert tone="success" title="Account created" className="mb-6">
          Check your inbox for the confirmation link, then sign in. If it has not arrived in a
          couple of minutes, look in your spam folder.
        </Alert>
      )}
      {notice === "link-invalid" && (
        <Alert tone="warning" title="That link did not work" className="mb-6">
          Confirmation and reset links can only be used once, and expire after a short window.
          Request a new one, or sign in below if the account is already confirmed.
        </Alert>
      )}
      {notice === "password-updated" && (
        <Alert tone="success" title="Password updated" className="mb-6">
          Sign in with your new password.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <div>
          <Field label="Password" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
          </Field>
          <div className="mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-royal-600 hover:text-royal-800"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Turnstile onToken={setCaptchaToken} />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          leadingIcon={<LogIn aria-hidden className="size-4.5" />}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        New to RoyalRefund?{" "}
        <Link href="/register" className="font-bold text-royal-600 hover:text-royal-800">
          Create an account
        </Link>
      </p>
    </div>
  );
}
