"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { FieldError as InlineError } from "@/components/ui/field";
import { AuthHeading, PasswordInput, PasswordStrength, SupabaseNotice } from "@/components/forms/shared";
import { Turnstile } from "@/components/forms/turnstile";
import { isTurnstileEnabled } from "@/lib/turnstile";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { COUNTRIES } from "@/lib/data/countries";
import { appOrigin } from "@/lib/site";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      country: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  const password = watch("password") ?? "";

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFormError("Registration is unavailable until Supabase credentials are configured.");
      return;
    }

    if (isTurnstileEnabled && !captchaToken) {
      setFormError("Please complete the security check below.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        // Stored on the auth user and copied into `profiles` by a database trigger.
        data: { full_name: values.fullName, country: values.country },
        emailRedirectTo: `${appOrigin()}/auth/callback?next=/dashboard`,
        // Supabase re-checks this with Cloudflare before creating the account.
        ...(captchaToken ? { captchaToken } : {}),
      },
    });

    if (error) {
      setFormError(
        error.message.toLowerCase().includes("already registered")
          ? "An account already exists for that email address."
          : error.message,
      );
      return;
    }

    router.push("/login?notice=registered");
  }

  return (
    <div>
      <AuthHeading
        title="Create your account"
        subtitle="Three details and a password. We do not ask for card numbers, PINs or bank credentials."
      />

      {!isSupabaseConfigured && <SupabaseNotice className="mb-6" />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Alex Morgan"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
        </Field>

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

        <Field label="Country" htmlFor="country" error={errors.country?.message} required>
          <Select id="country" aria-invalid={Boolean(errors.country)} {...register("country")}>
            <option value="">Select your country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <Field label="Password" htmlFor="password" error={errors.password?.message} required>
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
          label="Confirm password"
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

        <div>
          <div className="flex items-start gap-3">
            <Checkbox id="acceptTerms" {...register("acceptTerms")} />
            <label htmlFor="acceptTerms" className="text-sm leading-relaxed text-ink-600">
              I agree to the{" "}
              <Link href="/legal/terms" className="font-semibold text-royal-600 hover:text-royal-800">
                Terms
              </Link>{" "}
              and the{" "}
              <Link href="/legal/privacy" className="font-semibold text-royal-600 hover:text-royal-800">
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          <div className="mt-1.5">
            <InlineError>{errors.acceptTerms?.message}</InlineError>
          </div>
        </div>

        <Turnstile onToken={setCaptchaToken} />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          leadingIcon={<UserPlus aria-hidden className="size-4.5" />}
        >
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-royal-600 hover:text-royal-800">
          Sign in
        </Link>
      </p>
    </div>
  );
}
