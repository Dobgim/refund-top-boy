"use client";

import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Floating } from "@/components/ui/motion";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

const TRANSACTIONS = [
  { label: "Duplicate charge", meta: "RR-2026-0118", amount: "+ $486.50", positive: true },
  { label: "Subscription refund", meta: "RR-2026-0119", amount: "+ €129.00", positive: true },
  { label: "Review fee", meta: "No charge", amount: "- $0.00", positive: false },
];

const BARS = [38, 54, 46, 72, 61, 88, 76];

/**
 * Original recovery console illustration. Built from layout primitives rather
 * than a bitmap so it stays crisp, themeable and accessible.
 */
export function RecoveryConsole({ className }: { className?: string }) {
  const { reduced } = useMotionSafe();

  return (
    <div className={cn("relative mx-auto w-full max-w-[30rem]", className)}>
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(closest-side,rgb(99_102_241/0.35),transparent)] blur-2xl"
      />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 34, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.85, ease: EASE_OUT, delay: 0.15 }}
        className="relative rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-3 shadow-glow backdrop-blur-xl"
      >
        <div className="rounded-[1.35rem] bg-white p-5 shadow-[0_30px_70px_-40px_rgb(8_12_28/0.9)]">
          {/* account card */}
          <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2e2a80,#4338ca_45%,#6366f1)] p-5 text-white">
            <div aria-hidden className="absolute -top-14 -right-10 size-40 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-white/60 uppercase">
                  Recovery account
                </p>
                <p className="mt-2 font-display text-3xl leading-none font-extrabold tracking-tight">
                  $12,480<span className="text-white/60">.75</span>
                </p>
                <p className="mt-1.5 text-xs text-white/60">Across 4 open cases</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[0.68rem] font-bold whitespace-nowrap ring-1 ring-white/20 ring-inset">
                <ShieldCheck aria-hidden className="size-3.5 text-mint-400" />
                Secured
              </span>
            </div>

            <div className="relative mt-5 flex items-end gap-1.5" aria-hidden>
              {BARS.map((height, index) => (
                <motion.span
                  key={index}
                  initial={reduced ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.06, ease: EASE_OUT }}
                  style={{ height: `${height * 0.42}px` }}
                  className={cn(
                    "flex-1 origin-bottom rounded-t-[3px]",
                    index === BARS.length - 1 ? "bg-gold-400" : "bg-white/35",
                  )}
                />
              ))}
            </div>
          </div>

          {/* recovery progress */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-bold text-ink-950">Recovery progress</p>
              <p className="font-mono text-sm font-bold text-royal-600">68%</p>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-100">
              <motion.div
                initial={reduced ? false : { width: 0 }}
                animate={{ width: "68%" }}
                transition={{ duration: 1.3, delay: 0.6, ease: EASE_OUT }}
                className="h-full rounded-full bg-[linear-gradient(90deg,#6366f1,#14b98a)]"
                style={reduced ? { width: "68%" } : undefined}
              />
            </div>
            <p className="mt-2 text-xs text-ink-400">3 of 5 cases past the review stage</p>
          </div>

          {/* transactions */}
          <ul className="mt-5 space-y-2">
            {TRANSACTIONS.map((item, index) => (
              <motion.li
                key={item.meta + item.label}
                initial={reduced ? false : { opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.75 + index * 0.12, ease: EASE_OUT }}
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    item.positive ? "bg-emerald-100 text-emerald-700" : "bg-ink-200/70 text-ink-500",
                  )}
                >
                  {item.positive ? (
                    <ArrowDownLeft aria-hidden className="size-4" />
                  ) : (
                    <ArrowUpRight aria-hidden className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">{item.label}</span>
                  <span className="block truncate font-mono text-[0.68rem] text-ink-400">{item.meta}</span>
                </span>
                <span
                  className={cn(
                    "font-mono text-sm font-bold whitespace-nowrap",
                    item.positive ? "text-emerald-600" : "text-ink-400",
                  )}
                >
                  {item.amount}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* floating: status */}
      <Floating distance={14} duration={6.5} className="absolute -top-6 -left-4 z-10 sm:-left-12">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ duration: 0.6, delay: 0.9, ease: EASE_OUT }}
          className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-ink-900/85 px-3.5 py-2.5 text-white shadow-lift backdrop-blur-md"
        >
          <span aria-hidden className="relative grid size-2.5 place-items-center">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint-400" />
            <span className="size-2.5 rounded-full bg-mint-400" />
          </span>
          <span className="text-xs font-bold">Case under review</span>
        </motion.div>
      </Floating>

      {/* floating: recovered amount */}
      <Floating distance={11} duration={7.5} delay={0.4} className="absolute -right-3 bottom-16 z-10 sm:-right-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 3 }}
          transition={{ duration: 0.6, delay: 1.05, ease: EASE_OUT }}
          className="w-44 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-lift"
        >
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-mint-500/12 text-mint-600">
              <TrendingUp aria-hidden className="size-4" />
            </span>
            <p className="text-[0.68rem] font-bold tracking-wide text-ink-400 uppercase">Recovered</p>
          </div>
          <p className="mt-2 font-display text-xl font-extrabold text-ink-950">$4,912.30</p>
          <p className="text-[0.68rem] text-ink-400">Returned in the last 90 days</p>
        </motion.div>
      </Floating>

      {/* floating: notification */}
      <Floating distance={9} duration={5.5} delay={0.8} className="absolute -bottom-5 left-2 z-10 sm:-left-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: EASE_OUT }}
          className="flex max-w-[16rem] items-start gap-2.5 rounded-2xl border border-ink-100 bg-white px-3.5 py-3 shadow-lift"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-royal-600 text-white">
            <BadgeCheck aria-hidden className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-ink-950">Documents accepted</span>
            <span className="block truncate font-mono text-[0.66rem] text-ink-400">
              RR-2026-0121
            </span>
          </span>
        </motion.div>
      </Floating>

      {/* floating: badge */}
      <Floating distance={8} duration={8} delay={0.2} className="absolute -top-2 right-2 z-10 sm:-right-6">
        <motion.span
          initial={reduced ? false : { opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 1.35, ease: EASE_OUT }}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-3 py-1.5 text-[0.68rem] font-extrabold text-ink-950 shadow-lift"
        >
          <Sparkles aria-hidden className="size-3.5" />
          Live updates
        </motion.span>
      </Floating>
    </div>
  );
}
