import type { Metadata } from "next";
import { Fingerprint, KeyRound, LogOut, MailCheck, ShieldCheck } from "lucide-react";
import { Alert, Badge, Card } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { getCurrentProfile, getSessionUser } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Security settings",
  robots: { index: false, follow: false },
};

export default async function SecuritySettingsPage() {
  const [profile, user] = await Promise.all([getCurrentProfile(), getSessionUser()]);

  const rows = [
    {
      icon: MailCheck,
      label: "Email confirmed",
      value: user?.email_confirmed_at ? formatDateTime(user.email_confirmed_at) : "Not confirmed",
      ok: Boolean(user?.email_confirmed_at),
    },
    {
      icon: KeyRound,
      label: "Password last changed",
      value: profile?.updated_at ? formatDateTime(profile.updated_at) : "—",
      ok: true,
    },
    {
      icon: Fingerprint,
      label: "Last sign-in",
      value: user?.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : "—",
      ok: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security settings"
        description="How this account is protected, and how to end your session."
      />
      <VerificationBanner status={profile?.verification_status ?? "unverified"} />
      <SettingsTabs />

      <Card className="max-w-2xl p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
          Account security
        </h2>
        <ul className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
                <row.icon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 flex-1 text-sm text-ink-600">{row.label}</span>
              <span className="text-right text-sm font-semibold text-ink-900">{row.value}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="max-w-2xl p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
          Sessions
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          Signing out here ends the session on this device. If you think someone else has your
          password, change it first, then sign out.
        </p>
        <form action="/auth/sign-out" method="post" className="mt-4">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-900 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut aria-hidden className="size-4" />
            Sign out of this device
          </button>
        </form>
      </Card>

      <Alert tone="info" title="What protects your account">
        <ul className="mt-1 space-y-1">
          <li>Sessions are issued over httpOnly cookies and refreshed on every request.</li>
          <li>Your cases and documents are readable only by you and an authorised reviewer.</li>
          <li>Identity documents are served through links that expire after minutes.</li>
        </ul>
      </Alert>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-400">
        <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-mint-600" />
        <span>
          Verification status:{" "}
          <Badge tone="neutral">{profile?.verification_status ?? "unverified"}</Badge>
        </span>
      </p>
    </div>
  );
}
