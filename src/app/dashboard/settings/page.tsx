import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, BadgeCheck, UserRound } from "lucide-react";
import { Badge, Card } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { getCurrentProfile } from "@/lib/supabase/server";
import { GENDER_LABELS, VERIFICATION_META, type Gender } from "@/lib/verification";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile settings",
  robots: { index: false, follow: false },
};

export default async function ProfileSettingsPage() {
  const profile = await getCurrentProfile();
  const status = profile?.verification_status ?? "unverified";
  const verification = VERIFICATION_META[status];

  const details: Array<[string, string]> = [
    ["Full name", profile?.full_name || "—"],
    ["Username", profile?.username ? `@${profile.username}` : "Not set"],
    ["Email", profile?.email || "—"],
    ["Phone", profile?.phone || "Not set"],
    ["Gender", profile?.gender ? GENDER_LABELS[profile.gender as Gender] : "Not set"],
    ["Country", profile?.country || "—"],
    ["Member since", profile?.created_at ? formatDate(profile.created_at) : "—"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile settings"
        description="The details held against your account."
      />

      <VerificationBanner status={status} />
      <SettingsTabs />

      <Card className="max-w-2xl p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-950">
          <UserRound aria-hidden className="size-4.5 text-ink-400" />
          Your details
        </h2>

        <dl className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
          {details.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3.5">
              <dt className="text-sm text-ink-500">{label}</dt>
              <dd className="flex items-center gap-1.5 text-right text-sm font-semibold break-words text-ink-900">
                {label === "Username" && profile?.username && (
                  <AtSign aria-hidden className="size-3.5 text-ink-300" />
                )}
                {label === "Username" && profile?.username ? profile.username : value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          To change your name, username or email, send a message on any of your cases and a reviewer
          will update it. Changing the name on a verified account requires a fresh identity check.
        </p>
      </Card>

      <Card className="max-w-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-950">
            <BadgeCheck aria-hidden className="size-4.5 text-ink-400" />
            Identity verification
          </h2>
          <Badge tone={verification.tone}>{verification.label}</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{verification.description}</p>
        <Link
          href="/dashboard/verification"
          className="mt-3 inline-block text-sm font-bold text-royal-600 hover:text-royal-800"
        >
          Open Verification Center
        </Link>
      </Card>
    </div>
  );
}
