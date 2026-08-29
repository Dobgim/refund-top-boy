"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/field";
import { CLAIM_STATUSES, CLAIM_STATUS_META } from "@/lib/claims";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount", label: "Highest amount" },
];

export function ClaimFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("q") ?? "");

  function apply(next: Record<string, string>) {
    const query = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value && value !== "all") query.set(key, value);
      else query.delete(key);
    }
    startTransition(() => router.replace(`/admin/claims?${query.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-ink-100 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply({ q: search.trim() });
        }}
        className="relative min-w-0 flex-1"
      >
        <label htmlFor="admin-search" className="sr-only">
          Search claims by reference or reason
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-ink-300" />
        <Input
          id="admin-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reference or reason"
          className="pr-10 pl-11"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              apply({ q: "" });
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 hover:bg-ink-50"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </form>

      <div className="flex gap-3">
        <div className="min-w-0 flex-1 sm:w-48 sm:flex-none">
          <label htmlFor="admin-status" className="sr-only">
            Filter by status
          </label>
          <Select
            id="admin-status"
            defaultValue={params.get("status") ?? "all"}
            onChange={(event) => apply({ status: event.target.value })}
          >
            <option value="all">All statuses</option>
            {CLAIM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CLAIM_STATUS_META[status].label}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
          <label htmlFor="admin-sort" className="sr-only">
            Sort claims
          </label>
          <Select
            id="admin-sort"
            defaultValue={params.get("sort") ?? "newest"}
            onChange={(event) => apply({ sort: event.target.value })}
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {pending && <Loader2 aria-label="Updating results" className="size-4 shrink-0 animate-spin text-royal-600" />}
    </div>
  );
}
