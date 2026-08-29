"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/logo";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

function Chip() {
  return (
    <svg viewBox="0 0 40 30" className="h-6 w-8" aria-hidden>
      <rect width="40" height="30" rx="5" fill="#e3ac3c" />
      <rect x="3" y="3" width="34" height="24" rx="3" fill="#f2c866" />
      <path
        d="M14 3v24M26 3v24M3 11h34M3 19h34"
        stroke="#c08c26"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Magnetic stripe rendered on the card's underside edge. */
function StripeEdge({ tone }: { tone: "dark" | "light" }) {
  return (
    <div aria-hidden className="absolute inset-x-0 -bottom-px">
      <div className={cn("h-2.5 w-full", tone === "dark" ? "bg-ink-900" : "bg-ink-800")} />
      <div className="h-1 w-full bg-white/85" />
      <div className={cn("h-2 w-full", tone === "dark" ? "bg-ink-900" : "bg-ink-800")} />
      <div className="h-1 w-full bg-white/85" />
      <div className={cn("h-1.5 w-full", tone === "dark" ? "bg-ink-900" : "bg-ink-800")} />
    </div>
  );
}

function PaymentCard({
  tone,
  holder,
  className,
}: {
  tone: "dark" | "light";
  holder: string;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "relative aspect-[1.58/1] w-full overflow-hidden rounded-[1.35rem] p-6 shadow-[0_44px_70px_-30px_rgb(0_0_0/0.85)] ring-1 ring-inset",
        dark
          ? "bg-[linear-gradient(135deg,#241f52,#332a70_50%,#171338)] text-white ring-white/12"
          : "bg-[linear-gradient(135deg,#dbeaf2,#c3dbe8_55%,#a9c9dc)] text-ink-900 ring-white/60",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-16 -right-10 size-44 rounded-full blur-2xl",
          dark ? "bg-white/10" : "bg-white/50",
        )}
      />

      <div className="relative flex items-start justify-between">
        <Chip />
        <div className="flex items-center gap-1.5">
          <LogoMark className="size-6" gradientId={`hero-card-${tone}`} />
          <span className="font-display text-sm font-extrabold tracking-tight">RoyalRefund</span>
        </div>
      </div>

      <p
        className={cn(
          "relative mt-6 font-mono text-[1.05rem] tracking-[0.14em] sm:text-xl",
          dark ? "text-white/90" : "text-ink-800",
        )}
      >
        •••• •••• •••• 4560
      </p>

      <div className="relative mt-5 flex items-end justify-between gap-4">
        <span className={cn("truncate text-xs font-semibold", dark ? "text-white/70" : "text-ink-600")}>
          {holder}
        </span>
        <span className={cn("font-mono text-xs whitespace-nowrap", dark ? "text-white/70" : "text-ink-600")}>
          EXP 12/28
        </span>
      </div>

      <StripeEdge tone={tone} />
    </div>
  );
}

/** Two overlapping payment cards, tilted, as the hero's focal graphic. */
export function HeroCards({ className }: { className?: string }) {
  const { reduced } = useMotionSafe();

  return (
    <div className={cn("relative mx-auto w-full max-w-[30rem]", className)}>
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[30rem] max-w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.4),transparent)] blur-2xl"
      />

      {/* back card */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: 70, y: 60, rotate: 4 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -14 }}
        transition={{ duration: 1, delay: 0.35, ease: EASE_OUT }}
        className="absolute top-[30%] left-[26%] w-[68%]"
      >
        <PaymentCard tone="light" holder="Kenneth Allen" />
      </motion.div>

      {/* front card */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 44, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -19 }}
        transition={{ duration: 1, delay: 0.15, ease: EASE_OUT }}
        className="relative w-[86%]"
      >
        <PaymentCard tone="dark" holder="Kenneth Allen" />
      </motion.div>

      {/* spacer so the absolutely positioned back card is inside the flow box */}
      <div aria-hidden className="h-28 sm:h-32" />
    </div>
  );
}
