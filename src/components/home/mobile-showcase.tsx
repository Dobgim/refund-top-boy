"use client";

import { motion } from "framer-motion";
import {
  Apple,
  Bell,
  ChevronRight,
  Fingerprint,
  Smartphone,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { Container, Section, SectionHeading, Badge } from "@/components/ui/primitives";
import { Floating, Reveal } from "@/components/ui/motion";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACTIVITY = [
  { title: "Documents accepted", meta: "RR-2026-0121", tone: "good" as const },
  { title: "Reviewer assigned", meta: "RR-2026-0118", tone: "info" as const },
  { title: "Statement requested", meta: "RR-2026-0120", tone: "warn" as const },
];

const SPARK = [26, 34, 30, 46, 41, 58, 52, 68, 74];

function PhoneMockup() {
  const { reduced } = useMotionSafe();

  return (
    <div className="relative mx-auto w-[min(19rem,84vw)] sm:w-[20rem]">
      <motion.div
        initial={reduced ? false : { opacity: 0, x: 60, rotate: 6 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
        className="relative rounded-[2.6rem] border-[7px] border-ink-900 bg-ink-900 shadow-[0_50px_90px_-40px_rgb(8_12_28/0.85)]"
      >
        {/* side buttons */}
        <span aria-hidden className="absolute top-24 -left-[9px] h-12 w-[3px] rounded-l bg-ink-700" />
        <span aria-hidden className="absolute top-40 -left-[9px] h-8 w-[3px] rounded-l bg-ink-700" />
        <span aria-hidden className="absolute top-28 -right-[9px] h-16 w-[3px] rounded-r bg-ink-700" />

        <div className="relative overflow-hidden rounded-[2.05rem] bg-[var(--page-muted)]">
          {/* notch + status bar */}
          <div className="relative flex items-center justify-between px-6 pt-3 pb-1 text-[0.62rem] font-bold text-ink-700">
            <span className="font-mono">9:41</span>
            <span
              aria-hidden
              className="absolute top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-900"
            />
            <span className="flex items-center gap-1">
              <Wifi aria-hidden className="size-3" />
              <span aria-hidden className="inline-block h-2.5 w-5 rounded-[3px] border border-ink-500 p-[1px]">
                <span className="block h-full w-3/4 rounded-[1px] bg-ink-700" />
              </span>
            </span>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT }}
            className="space-y-3.5 px-4 pt-3 pb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold text-ink-400">Good morning</p>
                <p className="font-display text-sm font-extrabold text-ink-950">Amara Osei</p>
              </div>
              <span className="relative grid size-8 place-items-center rounded-xl bg-white text-ink-600 shadow-soft">
                <Bell aria-hidden className="size-3.5" />
                <span aria-hidden className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-rose-500" />
              </span>
            </div>

            {/* balance */}
            <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1c1a4e,#4338ca)] p-4 text-white">
              <div aria-hidden className="absolute -top-10 -right-6 size-24 rounded-full bg-white/10 blur-lg" />
              <p className="relative text-[0.6rem] font-bold tracking-[0.16em] text-white/60 uppercase">
                Recovered balance
              </p>
              <p className="relative mt-1 font-display text-2xl font-extrabold">$12,480.75</p>
              <div className="relative mt-3 flex items-end gap-1" aria-hidden>
                {SPARK.map((height, index) => (
                  <motion.span
                    key={index}
                    initial={reduced ? false : { scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.05, ease: EASE_OUT }}
                    style={{ height: `${height * 0.36}px` }}
                    className={cn(
                      "flex-1 origin-bottom rounded-t-[2px]",
                      index === SPARK.length - 1 ? "bg-gold-400" : "bg-white/30",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* recovery progress */}
            <div className="rounded-2xl bg-white p-3.5 shadow-soft">
              <div className="flex items-center justify-between text-[0.7rem]">
                <span className="font-bold text-ink-800">Recovery progress</span>
                <span className="font-mono font-bold text-royal-600">68%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <motion.div
                  initial={reduced ? false : { width: 0 }}
                  whileInView={{ width: "68%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.7, ease: EASE_OUT }}
                  style={reduced ? { width: "68%" } : undefined}
                  className="h-full rounded-full bg-[linear-gradient(90deg,#6366f1,#14b98a)]"
                />
              </div>
            </div>

            {/* activity */}
            <div className="rounded-2xl bg-white p-3.5 shadow-soft">
              <p className="text-[0.7rem] font-bold text-ink-800">Recent activity</p>
              <ul className="mt-2.5 space-y-2">
                {ACTIVITY.map((item, index) => (
                  <motion.li
                    key={item.meta}
                    initial={reduced ? false : { opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.8 + index * 0.12, ease: EASE_OUT }}
                    className="flex items-center gap-2"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        item.tone === "good" && "bg-mint-500",
                        item.tone === "info" && "bg-royal-500",
                        item.tone === "warn" && "bg-amber-500",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.7rem] font-semibold text-ink-900">
                        {item.title}
                      </span>
                      <span className="block truncate font-mono text-[0.6rem] text-ink-400">
                        {item.meta}
                      </span>
                    </span>
                    <ChevronRight aria-hidden className="size-3 shrink-0 text-ink-300" />
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* security */}
            <div className="flex items-center gap-2 rounded-2xl bg-ink-950 px-3.5 py-2.5 text-white">
              <Fingerprint aria-hidden className="size-4 shrink-0 text-mint-400" />
              <span className="text-[0.65rem] font-semibold">Device session verified</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Floating distance={12} duration={6.5} className="absolute -top-4 -left-6 z-10 hidden sm:block">
        <div className="w-40 rounded-2xl border border-ink-100 bg-white p-3 shadow-lift">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-mint-500/12 text-mint-600">
              <TrendingUp aria-hidden className="size-3.5" />
            </span>
            <span className="text-[0.62rem] font-bold tracking-wide text-ink-400 uppercase">
              This month
            </span>
          </div>
          <p className="mt-1.5 font-display text-lg font-extrabold text-ink-950">+ $1,204</p>
        </div>
      </Floating>

      <Floating distance={10} duration={7.5} delay={0.5} className="absolute -right-6 bottom-20 z-10 hidden sm:block">
        <div className="rounded-2xl bg-royal-600 px-3.5 py-2.5 text-white shadow-lift">
          <p className="text-[0.62rem] font-bold tracking-wide uppercase opacity-70">Case update</p>
          <p className="text-xs font-bold">Approved</p>
        </div>
      </Floating>
    </div>
  );
}

export function MobileShowcaseSection() {
  return (
    <Section tone="dark" className="overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora" />
      <div aria-hidden className="pointer-events-none absolute inset-0 star-field opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -left-40 size-[34rem] -translate-y-1/2 rounded-full bg-royal-600/20 blur-[130px]"
      />

      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal preset="fadeRight">
              <SectionHeading
                align="left"
                tone="dark"
                eyebrow="On any device"
                title="The same case, in your pocket"
                description="The portal is a responsive web application, so the dashboard you use on a laptop is the dashboard you carry. Check a status, answer a reviewer, or upload the document they asked for, from wherever you happen to be."
              />
            </Reveal>

            <Reveal preset="fadeUp" delay={0.15} className="mt-8">
              <ul className="space-y-3">
                {[
                  "Layouts reflow rather than shrink, down to 320px wide",
                  "Touch targets sized for thumbs, not cursors",
                  "Uploads work straight from the camera roll",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-ink-200">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.25} className="mt-9">
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink
                  href="/dashboard"
                  size="lg"
                  variant="gold"
                  leadingIcon={<Smartphone aria-hidden className="size-4.5" />}
                >
                  Open the dashboard
                </ButtonLink>
                <Badge tone="gold">
                  <Apple aria-hidden className="size-3.5" />
                  Works in any mobile browser
                </Badge>
              </div>
            </Reveal>
          </div>

          <div className="relative">
            <PhoneMockup />
          </div>
        </div>
      </Container>
    </Section>
  );
}
