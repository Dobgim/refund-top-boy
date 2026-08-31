"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/primitives";
import { PasswordInput, PasswordStrength } from "@/components/forms/shared";
import { passwordSchema } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { describeAuthError } from "@/lib/auth-errors";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((v) => v.password !== v.currentPassword, {
    path: ["password"],
    message: "Choose a password you have not used here before",
  });

type Values = z.infer<typeof schema>;

/**
 * Password change for a signed-in account.
 *
 * Supabase does not require the current password to call updateUser, so this
 * re-authenticates first. Without that, anyone reaching an unattended, already
 * signed-in browser could silently take the account over.
 */
export function ChangePasswordForm({ email }: { email: string }) {
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const password = watch("password") ?? "";

  async function onSubmit(values: Values) {
    setFeedback(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFeedback({ tone: "error", message: "Password changes are unavailable on this deployment." });
      return;
    }

    // Prove the person at the keyboard knows the existing password.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: values.currentPassword,
    });

    if (reauthError) {
      setFeedback({ tone: "error", message: "Your current password is not correct." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFeedback({ tone: "error", message: describeAuthError(error.message) });
      return;
    }

    reset();
    setFeedback({
      tone: "success",
      message: "Password updated. Use the new one next time you sign in.",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {feedback && <Alert tone={feedback.tone}>{feedback.message}</Alert>}

      <Field
        label="Current password"
        htmlFor="current-password"
        error={errors.currentPassword?.message}
        required
      >
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
      </Field>

      <div>
        <Field label="New password" htmlFor="new-password" error={errors.password?.message} required>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>
        <PasswordStrength value={password} />
      </div>

      <Field
        label="Confirm new password"
        htmlFor="confirm-new-password"
        error={errors.confirmPassword?.message}
        required
      >
        <PasswordInput
          id="confirm-new-password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </Field>

      <Button
        type="submit"
        loading={isSubmitting}
        leadingIcon={<KeyRound aria-hidden className="size-4" />}
      >
        Update password
      </Button>
    </form>
  );
}
