import Link from "next/link";
import { DatabaseZap, Lock } from "lucide-react";
import { Logo } from "@/components/brand/logo";

/**
 * Shown instead of the admin console when the deployment has no database.
 *
 * Previously the admin layout skipped its authorisation check whenever
 * Supabase was unconfigured, which meant any deployment missing its
 * environment variables — a preview build, for instance — served a working
 * looking admin console to anyone holding the URL. Absent credentials must
 * fail closed, not open.
 */
export function AdminNotConfigured() {
  return (
    <div className="grid min-h-dvh place-items-center bg-white px-6 py-20">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <span className="mx-auto mt-12 grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <DatabaseZap aria-hidden className="size-8" />
        </span>

        <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-ink-950">
          Administration is unavailable here
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          This deployment has no database connected, so no reviewer can be identified and no case
          can be loaded. The admin console stays closed rather than showing example records to
          whoever opens the link.
        </p>

        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink-50 px-3.5 py-2 text-xs font-medium text-ink-600 ring-1 ring-ink-100 ring-inset">
          <Lock aria-hidden className="size-3.5" />
          Set the Supabase environment variables, then redeploy
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50"
          >
            Back to the site
          </Link>
        </div>
      </div>
    </div>
  );
}
