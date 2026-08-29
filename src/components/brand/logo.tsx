import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * RoyalRefund mark: a shield (protection) whose inner counter-form is a return
 * arrow (recovery), topped by three crown notches (the "royal" cue).
 * Drawn entirely as vector paths so it scales to any size without an asset.
 */
export function LogoMark({
  className,
  monochrome = false,
}: {
  className?: string;
  monochrome?: boolean;
}) {
  const field = monochrome ? "currentColor" : "#4338ca";

  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="RoyalRefund" className={cn("size-9", className)}>
      <rect width="48" height="48" rx="13" fill={field} />

      {/* crown notches */}
      <path
        d="M15.5 12.6 18.6 15l2.6-3.4 2.8 3.6 2.8-3.6 2.6 3.4 3.1-2.4-1.1 4.4H16.6z"
        fill="#f2c866"
      />

      {/* shield */}
      <path
        d="M24 19.2c3.1 0 6.1-.55 8.7-1.6v8.1c0 5.1-3.4 9.5-8.7 11.6-5.3-2.1-8.7-6.5-8.7-11.6v-8.1c2.6 1.05 5.6 1.6 8.7 1.6Z"
        fill="#ffffff"
        fillOpacity="0.14"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1.3"
      />

      {/* return arrow */}
      <path
        d="M28.9 28.3a5.6 5.6 0 1 1-1.35-5.9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M28.6 18.6v4.6h-4.6"
        fill="none"
        stroke="#f2c866"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-[1.16rem] leading-none font-extrabold tracking-[-0.02em]",
        tone === "light" ? "text-white" : "text-ink-950",
        className,
      )}
    >
      Royal
      <span className={tone === "light" ? "text-gold-300" : "text-royal-600"}>Refund</span>
    </span>
  );
}

export function Logo({
  tone = "dark",
  href = "/",
  className,
  markClassName,
}: {
  tone?: "dark" | "light";
  href?: string | null;
  className?: string;
  markClassName?: string;
}) {
  const content = (
    <>
      <LogoMark className={cn("size-9 shrink-0", markClassName)} />
      <Wordmark tone={tone} />
    </>
  );

  if (href === null) {
    return <span className={cn("inline-flex items-center gap-2.5", className)}>{content}</span>;
  }

  return (
    <Link
      href={href}
      aria-label="RoyalRefund home"
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
    >
      {content}
    </Link>
  );
}
