import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { EmptyState, Spinner } from "@/components/ui/primitives";
import { ClaimsList, PageHeader } from "@/components/dashboard/common";
import { ClaimFilters } from "@/components/admin/claim-filters";
import { getAdminClaims } from "@/lib/queries";
import { CLAIM_STATUSES } from "@/lib/claims";
import type { ClaimStatus } from "@/types";

type Search = Promise<{ q?: string; status?: string; sort?: string }>;

export default async function AdminClaimsPage({ searchParams }: { searchParams: Search }) {
  const { q = "", status = "all", sort = "newest" } = await searchParams;

  const safeStatus = CLAIM_STATUSES.includes(status as ClaimStatus)
    ? (status as ClaimStatus)
    : "all";
  const safeSort = (["newest", "oldest", "amount"] as const).includes(sort as "newest")
    ? (sort as "newest" | "oldest" | "amount")
    : "newest";

  const { data: claims } = await getAdminClaims({ search: q, status: safeStatus, sort: safeSort });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims"
        description="Search, filter and open any case in the system. Row level security still applies to every query."
      />

      <Suspense fallback={<Spinner />}>
        <ClaimFilters />
      </Suspense>

      <p className="text-sm text-ink-500">
        {claims.length} {claims.length === 1 ? "case" : "cases"} matching the current filters
      </p>

      {claims.length === 0 ? (
        <EmptyState
          icon={<SearchX aria-hidden className="size-6" />}
          title="No matching cases"
          description="Try a different reference, or clear the status filter."
        />
      ) : (
        <ClaimsList claims={claims} basePath="/admin/claims" showOwner />
      )}
    </div>
  );
}
