import type { Metadata } from "next";
import Link from "next/link";
import { DoorOpen, Mail, TriangleAlert } from "lucide-react";
import { Alert, Card } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/common";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getMyClaims } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account closing",
  robots: { index: false, follow: false },
};

export default async function AccountClosingPage() {
  const [profile, { data: claims }] = await Promise.all([getCurrentProfile(), getMyClaims()]);

  const open = claims.filter(
    (claim) => !["resolved", "closed"].includes(claim.status),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account closing"
        description="Close your account and have your personal data removed."
      />
      <VerificationBanner status={profile?.verification_status ?? "unverified"} />
      <SettingsTabs />

      {open.length > 0 && (
        <Alert tone="warning" title={`You have ${open.length} open ${open.length === 1 ? "case" : "cases"}`}>
          Closing your account ends those cases without a decision. If you are waiting on a refund,
          let them finish first — you can close afterwards.
        </Alert>
      )}

      <Card className="max-w-2xl p-5 sm:p-6">
        <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <DoorOpen aria-hidden className="size-6" />
        </span>

        <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-ink-950">
          What closing does
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink-600">
          {[
            "Your profile, cases, uploaded documents, messages and identity document are deleted.",
            "Any open case is withdrawn and will not be reviewed further.",
            "A payout already recorded against a resolved case is unaffected — that money is between you and the paying party.",
            "Anonymised counts may remain in aggregate figures, with nothing identifying you.",
          ].map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" />
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-ink-50 px-4 py-3.5">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <p className="text-sm leading-relaxed text-ink-600">
            Closing is permanent and cannot be undone. To protect against an unattended browser
            being used to wipe an account, closure is confirmed with you by email rather than from a
            button here.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href={`mailto:${SITE.supportEmail}?subject=${encodeURIComponent("Account closure request")}&body=${encodeURIComponent(
              `Please close my RoyalRefund account.\n\nAccount email: ${profile?.email ?? ""}\n`,
            )}`}
            variant="danger"
            leadingIcon={<Mail aria-hidden className="size-4" />}
          >
            Request account closure
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="outline">
            Keep my account
          </ButtonLink>
        </div>
      </Card>

      <p className="text-xs leading-relaxed text-ink-400">
        Prefer to talk first?{" "}
        <Link href="/contact" className="font-semibold text-royal-600 hover:text-royal-800">
          Contact support
        </Link>{" "}
        and tell us what is not working. Most reasons for leaving are fixable.
      </p>
    </div>
  );
}
