import type { Metadata } from "next";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { getCurrentProfile } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Change password",
  robots: { index: false, follow: false },
};

export default async function ChangePasswordPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <PageHeader title="Change password" description="Update the password you sign in with." />
      <VerificationBanner status={profile?.verification_status ?? "unverified"} />
      <SettingsTabs />

      <Card className="max-w-xl p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-950">
          <KeyRound aria-hidden className="size-4.5 text-ink-400" />
          New password
        </h2>
        <p className="mt-1 mb-5 text-sm text-ink-500">
          You will be asked for your current password first.
        </p>
        <ChangePasswordForm email={profile?.email ?? ""} />
      </Card>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-400">
        <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-mint-600" />
        Only ever enter your RoyalRefund password on this site. We will never ask for a banking
        password, card PIN, one-time code or recovery phrase.
      </p>
    </div>
  );
}
