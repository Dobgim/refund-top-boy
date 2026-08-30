import Link from "next/link";
import { CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import { VERIFICATION_META } from "@/lib/verification";
import type { ProfileVerificationStatus } from "@/types";
import { cn } from "@/lib/utils";

/**
 * The standing verification notice. Loud while something is required of the
 * customer, quiet once it is not, and absent entirely when verified.
 */
export function VerificationBanner({
  status,
  className,
}: {
  status: ProfileVerificationStatus;
  className?: string;
}) {
  if (status === "verified") return null;

  const config = {
    unverified: {
      icon: TriangleAlert,
      wrap: "border-rose-300 bg-rose-50",
      badge: "bg-rose-500 text-white",
      title: "text-rose-900",
      body: "text-rose-800",
      link: "text-rose-900",
      heading: "Verification Center",
      message: "You have information to submit in Verification Center",
      cta: "Submit now",
    },
    rejected: {
      icon: TriangleAlert,
      wrap: "border-rose-300 bg-rose-50",
      badge: "bg-rose-500 text-white",
      title: "text-rose-900",
      body: "text-rose-800",
      link: "text-rose-900",
      heading: "Verification Center",
      message: "Your identity document was not accepted. Please submit a new one",
      cta: "Resubmit now",
    },
    pending: {
      icon: Clock,
      wrap: "border-royal-200 bg-royal-50",
      badge: "bg-royal-600 text-white",
      title: "text-ink-950",
      body: "text-ink-600",
      link: "text-royal-700",
      heading: "Verification Center",
      message: "Your document is under review. We will let you know as soon as it is decided",
      cta: "View status",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-4 rounded-card border-2 border-dashed p-4 sm:p-5",
        config.wrap,
        className,
      )}
    >
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl", config.badge)}>
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("font-display text-lg font-bold tracking-tight", config.title)}>
          {config.heading}
        </p>
        <p className={cn("mt-0.5 text-sm leading-relaxed", config.body)}>
          {config.message}{" "}
          <Link
            href="/dashboard/verification"
            className={cn("font-bold underline underline-offset-2", config.link)}
          >
            {config.cta}
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Compact confirmation shown once verification has been granted. */
export function VerifiedNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-mint-500/10 px-3.5 py-1.5 text-xs font-semibold text-mint-700 ring-1 ring-mint-500/25 ring-inset",
        className,
      )}
    >
      <CheckCircle2 aria-hidden className="size-3.5" />
      {VERIFICATION_META.verified.label}
    </p>
  );
}
