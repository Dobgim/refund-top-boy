import type { Metadata } from "next";
import { Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { VerificationBanner } from "@/components/dashboard/verification-banner";
import { WithdrawForm } from "@/components/dashboard/banking-forms";
import { BankingRecords } from "@/components/dashboard/banking-records";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getMyAccount, getMyBankingRecords } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Withdraw",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const [profile, account, records] = await Promise.all([
    getCurrentProfile(),
    getMyAccount(),
    getMyBankingRecords<Record<string, unknown>>("withdrawal_requests"),
  ]);

  const balance = account?.balance ?? 0;
  const currency = account?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdraw"
        description="Move money out to your bank, mobile money or wallet."
        action={
          <span className="rounded-full bg-ink-50 px-3.5 py-2 text-sm font-bold text-ink-900 ring-1 ring-ink-100 ring-inset">
            {formatCurrency(balance, currency)}
          </span>
        }
      />

      <VerificationBanner status={profile?.verification_status ?? "unverified"} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card className="p-5 sm:p-6">
          <WithdrawForm balance={balance} currency={currency} />
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
            Withdrawal requests
          </h2>
          {records.length === 0 ? (
            <EmptyState
              className="mt-4 py-10"
              title="Nothing here yet"
              description="Anything you create appears in this list."
            />
          ) : (
            <BankingRecords records={records} currency={currency} />
          )}
        </Card>
      </div>
    </div>
  );
}
