"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, AtSign, Check, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Input, Select } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { AuthHeading, PasswordInput, PasswordStrength, SupabaseNotice } from "@/components/forms/shared";
import { Turnstile } from "@/components/forms/turnstile";
import { isTurnstileEnabled } from "@/lib/turnstile";
import {
  registerCredentialsSchema,
  registerProfileSchema,
  type RegisterCredentials,
  type RegisterProfile,
} from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { COUNTRIES } from "@/lib/data/countries";
import { GENDERS, GENDER_LABELS } from "@/lib/verification";
import { appOrigin } from "@/lib/site";
import { cn } from "@/lib/utils";

const STEPS = ["Your details", "About you"] as const;

function Progress({ step }: { step: 0 | 1 }) {
  return (
    <ol className="mb-8 flex items-center gap-3" aria-label="Registration progress">
      {STEPS.map((label, index) => {
        const done = index < step;
        const active = index === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2.5">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold transition-colors",
                done && "bg-mint-500 text-white",
                active && "bg-royal-600 text-white ring-4 ring-royal-500/15",
                !done && !active && "bg-ink-100 text-ink-400",
              )}
            >
              {done ? <Check aria-hidden className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "truncate text-xs font-bold",
                active ? "text-ink-950" : done ? "text-mint-600" : "text-ink-400",
              )}
            >
              {label}
            </span>
            {index === 0 && (
              <span
                aria-hidden
                className={cn("h-0.5 flex-1 rounded-full", done ? "bg-mint-500" : "bg-ink-100")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [credentials, setCredentials] = useState<RegisterCredentials | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  /* ------------------------------------------------------------- step one */
  const credentialsForm = useForm<RegisterCredentials>({
    resolver: zodResolver(registerCredentialsSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const password = credentialsForm.watch("password") ?? "";

  function onNext(values: RegisterCredentials) {
    setCredentials(values);
    setFormError(null);
    setStep(1);
  }

  /* ------------------------------------------------------------- step two */
  const profileForm = useForm<RegisterProfile>({
    resolver: zodResolver(registerProfileSchema),
    defaultValues: {
      username: "",
      gender: undefined as unknown as RegisterProfile["gender"],
      country: "",
      acceptTerms: false as unknown as true,
    },
  });

  async function onSignUp(values: RegisterProfile) {
    setFormError(null);
    if (!credentials) {
      setStep(0);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFormError("Registration is unavailable until Supabase credentials are configured.");
      return;
    }

    if (isTurnstileEnabled && !captchaToken) {
      setFormError("Please complete the security check below.");
      return;
    }

    // Check the username before creating the account, so a collision does not
    // surface as an opaque database error after the auth user already exists.
    setCheckingUsername(true);
    const { data: available, error: checkError } = await supabase.rpc("username_available", {
      candidate: values.username,
    });
    setCheckingUsername(false);

    if (!checkError && available === false) {
      profileForm.setError("username", { message: "That username is already taken" });
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
          country: values.country,
          username: values.username,
          gender: values.gender,
        },
        emailRedirectTo: `${appOrigin()}/auth/callback?next=/welcome`,
        ...(captchaToken ? { captchaToken } : {}),
      },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("already registered")) {
        setFormError("An account already exists for that email address.");
        setStep(0);
        return;
      }
      if (message.includes("username")) {
        profileForm.setError("username", { message: "That username is already taken" });
        return;
      }
      setFormError(error.message);
      return;
    }

    // With email confirmation switched off in Supabase, signUp returns a live
    // session and the account is usable immediately — so go straight to the
    // welcome screen rather than telling someone to check an inbox that will
    // never receive anything. With confirmation on, there is no session yet and
    // the message about the emailed link is correct.
    if (signUpData.session) {
      router.push("/welcome");
      router.refresh();
      return;
    }

    router.push("/login?notice=registered");
  }

  return (
    <div>
      <AuthHeading
        title="Create your account"
        subtitle={
          step === 0
            ? "Start with your name and how you will sign in."
            : "Almost there. Pick a username and tell us how to address you."
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice className="mb-6" />}

      <Progress step={step} />

      {formError && (
        <Alert tone="error" className="mb-5">
          {formError}
        </Alert>
      )}

      {step === 0 ? (
        <form
          onSubmit={credentialsForm.handleSubmit(onNext)}
          className="space-y-5"
          noValidate
          key="step-one"
        >
          <Field
            label="Full name"
            htmlFor="fullName"
            error={credentialsForm.formState.errors.fullName?.message}
            required
          >
            <Input
              id="fullName"
              autoComplete="name"
              aria-invalid={Boolean(credentialsForm.formState.errors.fullName)}
              {...credentialsForm.register("fullName")}
            />
          </Field>

          <Field
            label="Email address"
            htmlFor="email"
            error={credentialsForm.formState.errors.email?.message}
            required
          >
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              aria-invalid={Boolean(credentialsForm.formState.errors.email)}
              {...credentialsForm.register("email")}
            />
          </Field>

          <div>
            <Field
              label="Password"
              htmlFor="password"
              error={credentialsForm.formState.errors.password?.message}
              required
            >
              <PasswordInput
                id="password"
                autoComplete="new-password"
                aria-invalid={Boolean(credentialsForm.formState.errors.password)}
                {...credentialsForm.register("password")}
              />
            </Field>
            <PasswordStrength value={password} />
          </div>

          <Field
            label="Confirm password"
            htmlFor="confirmPassword"
            error={credentialsForm.formState.errors.confirmPassword?.message}
            required
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={Boolean(credentialsForm.formState.errors.confirmPassword)}
              {...credentialsForm.register("confirmPassword")}
            />
          </Field>

          <Button
            type="submit"
            size="lg"
            fullWidth
            trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}
          >
            Next
          </Button>
        </form>
      ) : (
        <form
          onSubmit={profileForm.handleSubmit(onSignUp)}
          className="space-y-5"
          noValidate
          key="step-two"
        >
          <Field
            label="Username"
            htmlFor="username"
            error={profileForm.formState.errors.username?.message}
            hint="3 to 20 characters. Letters, numbers and underscores, starting with a letter."
            required
          >
            <div className="relative">
              <AtSign
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-ink-300"
              />
              <Input
                id="username"
                autoComplete="username"
                spellCheck={false}
                className="pl-11"
                aria-invalid={Boolean(profileForm.formState.errors.username)}
                {...profileForm.register("username")}
              />
            </div>
          </Field>

          <Field
            label="Gender"
            htmlFor="gender"
            error={profileForm.formState.errors.gender?.message}
            required
          >
            <Select
              id="gender"
              defaultValue=""
              aria-invalid={Boolean(profileForm.formState.errors.gender)}
              {...profileForm.register("gender")}
            >
              <option value="" disabled>
                Choose an option
              </option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Country"
            htmlFor="country"
            error={profileForm.formState.errors.country?.message}
            required
          >
            <Select
              id="country"
              aria-invalid={Boolean(profileForm.formState.errors.country)}
              {...profileForm.register("country")}
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <div className="flex items-start gap-3">
              <Checkbox id="acceptTerms" {...profileForm.register("acceptTerms")} />
              <label htmlFor="acceptTerms" className="text-sm leading-relaxed text-ink-600">
                I agree to the{" "}
                <Link href="/legal/terms" className="font-semibold text-royal-600 hover:text-royal-800">
                  Terms
                </Link>{" "}
                and the{" "}
                <Link
                  href="/legal/privacy"
                  className="font-semibold text-royal-600 hover:text-royal-800"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            <div className="mt-1.5">
              <FieldError>{profileForm.formState.errors.acceptTerms?.message}</FieldError>
            </div>
          </div>

          <Turnstile onToken={setCaptchaToken} />

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={profileForm.formState.isSubmitting || checkingUsername}
              leadingIcon={
                checkingUsername ? (
                  <Loader2 aria-hidden className="size-4.5 animate-spin" />
                ) : (
                  <UserPlus aria-hidden className="size-4.5" />
                )
              }
            >
              Sign up now
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              fullWidth
              onClick={() => {
                setFormError(null);
                setStep(0);
              }}
              leadingIcon={<ArrowLeft aria-hidden className="size-4.5" />}
            >
              Back
            </Button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-royal-600 hover:text-royal-800">
          Sign in
        </Link>
      </p>
    </div>
  );
}
