"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, MailCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { AuthHeading, PasswordInput, PasswordStrength, SupabaseNotice } from "@/components/forms/shared";
import { Turnstile } from "@/components/forms/turnstile";
import { isTurnstileEnabled } from "@/lib/turnstile";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { appOrigin } from "@/lib/site";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFormError("Password recovery is unavailable until Supabase credentials are configured.");
      return;
    }

    if (isTurnstileEnabled && !captchaToken) {
      setFormError("Please complete the security check below.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${appOrigin()}/auth/callback?next=/reset-password`,
      ...(captchaToken ? { captchaToken } : {}),
    });

    // Deliberately generic: the response must not reveal whether an account exists.
    if (error && !error.message.toLowerCase().includes("user not found")) {
      setFormError("We could not start the reset. Please try again in a moment.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-mint-500/10 text-mint-600">
          <MailCheck aria-hidden className="size-7" />
        </div>
        <AuthHeading
          title="Check your inbox"
          subtitle={`If an account exists for ${getValues("email")}, a reset link is on its way. The link expires after a short window.`}
        />
        <Alert tone="info" className="mb-6">
          Nothing arrived? Check the spam folder, then try again in a few minutes.
        </Alert>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => setSent(false)}
        >
          Use a different address
        </Button>
        <p className="mt-6 text-center text-sm text-ink-500">
          <Link href="/login" className="font-bold text-royal-600 hover:text-royal-800">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading
        title="Reset your password"
        subtitle="Enter the email on your account and we will send a single-use link to set a new password."
      />

      {!isSupabaseConfigured && <SupabaseNotice className="mb-6" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Turnstile onToken={setCaptchaToken} />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          leadingIcon={<Send aria-hidden className="size-4.5" />}
        >
          Send reset link
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Remembered it?{" "}
        <Link href="/login" className="font-bold text-royal-600 hover:text-royal-800">
          Sign in instead
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password") ?? "";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady(false);
      return;
    }
    supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      setReady(Boolean(data.session));
    });
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFormError("Password updates are unavailable until Supabase credentials are configured.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFormError(error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?notice=password-updated");
  }

  return (
    <div>
      <AuthHeading
        title="Choose a new password"
        subtitle="Pick something you have not used elsewhere. You will be signed out of other sessions."
      />

      {!isSupabaseConfigured && <SupabaseNotice className="mb-6" />}

      {ready === false && isSupabaseConfigured && (
        <Alert tone="warning" title="This reset link is not active" className="mb-6">
          Open the link from your email again, or{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            request a new one
          </Link>
          .
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <div>
          <Field label="New password" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </Field>
          <PasswordStrength value={password} />
        </div>

        <Field
          label="Confirm new password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={ready === false}
          leadingIcon={<KeyRound aria-hidden className="size-4.5" />}
        >
          Update password
        </Button>
      </form>
    </div>
  );
}
