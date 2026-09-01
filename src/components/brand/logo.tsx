import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * RoyalRefund mark: a classical bank facade — pediment, columns and plinth.
 *
 * The neoclassical bank front is the one piece of iconography read as "bank"
 * almost universally, which is what this needs to say at 16px in a browser tab.
 * Three thick columns rather than four or five: at favicon size, thinner ones
 * blur into a single grey block.
 *
 * Drawn as vector paths so it scales to any size without an asset.
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

      {/* pediment */}
      <path d="M24 9.5 38.5 20H9.5z" fill="#ffffff" />

      {/* entablature */}
      <rect x="11" y="21.4" width="26" height="2.6" rx="1.1" fill="#ffffff" />

      {/* columns */}
      <rect x="15" y="25.4" width="4" height="8.4" rx="0.9" fill="#ffffff" />
      <rect x="22" y="25.4" width="4" height="8.4" rx="0.9" fill="#ffffff" />
      <rect x="29" y="25.4" width="4" height="8.4" rx="0.9" fill="#ffffff" />

      {/* plinth, in the royal gold */}
      <rect x="10" y="35.2" width="28" height="3.4" rx="1.4" fill="#f2c866" />
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
