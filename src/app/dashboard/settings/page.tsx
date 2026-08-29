import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { getCurrentProfile } from "@/lib/supabase/server";
import { VERIFICATION_META } from "@/lib/verification";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

export default async function DashboardSettingsPage() {
  const profile = await getCurrentProfile();
  const verification = VERIFICATION_META[profile?.verification_status ?? "unverified"];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Account settings"
        description="Your details and the password you sign in with."
      />

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-950">
          <UserRound aria-hidden className="size-4.5 text-ink-400" />
          Your details
        </h2>
        <dl className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
          {[
            ["Name", profile?.full_name ?? "—"],
            ["Email", profile?.email ?? "—"],
            ["Country", profile?.country ?? "—"],
            ["Member since", profile?.created_at ? formatDate(profile.created_at) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3">
              <dt className="text-sm text-ink-500">{label}</dt>
              <dd className="text-right text-sm font-semibold break-words text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-ink-400">
          To change your name or email, send a message on any of your cases and a reviewer will
          update it.
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-950">
            <BadgeCheck aria-hidden className="size-4.5 text-ink-400" />
            Identity verification
          </h2>
          <Badge tone={verification.tone}>{verification.label}</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{verification.description}</p>
        <Link
          href="/dashboard/verify"
          className="mt-3 inline-block text-sm font-bold text-royal-600 hover:text-royal-800"
        >
          Open verification
        </Link>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-950">
          <KeyRound aria-hidden className="size-4.5 text-ink-400" />
          Change password
        </h2>
        <p className="mt-1 mb-5 text-sm text-ink-500">
          You will be asked for your current password first.
        </p>
        <ChangePasswordForm email={profile?.email ?? ""} />
      </Card>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-400">
        <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-mint-600" />
        RoyalRefund will never ask for a banking password, card PIN, one-time code or recovery
        phrase. Only ever enter your RoyalRefund password on this site.
      </p>
    </div>
  );
}
