import type { Metadata } from "next";
import { FilePlus2, Inbox } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { ClaimsList, PageHeader } from "@/components/dashboard/common";
import { getMyClaims } from "@/lib/queries";

export const metadata: Metadata = {
  title: "My claims",
  robots: { index: false, follow: false },
};

export default async function MyClaimsPage() {
  const { data: claims } = await getMyClaims();

  return (
    <div className="space-y-7">
      <PageHeader
        title="My claims"
        description="Every case on your account, newest first. Select a reference to open the full history."
        action={
          <ButtonLink href="/dashboard/claims/new" leadingIcon={<FilePlus2 aria-hidden className="size-4" />}>
            Start a claim
          </ButtonLink>
        }
      />

      {claims.length === 0 ? (
        <EmptyState
          icon={<Inbox aria-hidden className="size-6" />}
          title="No claims yet"
          description="Your claim history will appear here. Submitting a case takes about ten minutes."
          action={<ButtonLink href="/dashboard/claims/new" size="sm">Start your first claim</ButtonLink>}
        />
      ) : (
        <ClaimsList claims={claims} />
      )}
    </div>
  );
}
