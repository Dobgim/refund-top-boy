"use server";

import { newsletterSchema } from "@/lib/validations/claim";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { verifyTurnstileToken } from "@/lib/turnstile";
import type { ActionState } from "@/types";

export async function subscribeToNewsletter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Checked with Cloudflare before anything touches the database.
  const passed = await verifyTurnstileToken(formData.get("cf-turnstile-response")?.toString());
  if (!passed) {
    return { status: "error", message: "The security check failed. Please try again." };
  }

  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Enter a valid email address",
    };
  }

  if (!isSupabaseConfigured) {
    return {
      status: "success",
      message: "Thanks. Supabase is not connected in this preview, so nothing was stored.",
    };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "The newsletter service is unavailable right now." };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: parsed.data.email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    return { status: "error", message: "We could not save that address. Please try again." };
  }

  return { status: "success", message: "You are on the list. Check your inbox for a confirmation." };
}
