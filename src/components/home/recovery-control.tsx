"use client";

import { motion } from "framer-motion";
import { ArrowRight, BellRing, CheckCircle2, Eye, FileUp, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Floating, Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { BENEFITS } from "@/lib/data/content";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";

const ICONS: Record<string, LucideIcon> = { FileUp, BellRing, Eye };

const CHECKLIST = [
  { label: "Transaction details", done: true },
  { label: "Statement extract", done: true },
  { label: "Merchant correspondence", done: true },
  { label: "Reviewer assessment", done: false },
];

/** Original two-layer case illustration: an evidence card over a progress ring. */
function CaseIllustration() {
  const { reduced } = useMotionSafe();

  return (
    <div className="relative mx-auto w-full max-w-[26rem]">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[3rem] bg-royal-600/8 blur-[70px]"
      />

      {/* progress ring */}
      <div className="relative mx-auto flex justify-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-[19rem]" role="img" aria-label="Case completion at 74 percent">
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#14b98a" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="82" fill="none" stroke="#e6eaf4" strokeWidth="14" />
          <motion.circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="14"
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            strokeDasharray="515"
            initial={reduced ? false : { strokeDashoffset: 515 }}
            whileInView={{ strokeDashoffset: 515 * (1 - 0.74) }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.5, ease: EASE_OUT }}
            style={reduced ? { strokeDashoffset: 515 * 0.26 } : undefined}
          />
          <text
            x="100"
            y="94"
            textAnchor="middle"
            className="fill-ink-950 font-display text-[2.1rem] font-extrabold"
          >
            74%
          </text>
          <text x="100" y="118" textAnchor="middle" className="fill-ink-400 text-[0.72rem] font-semibold">
            CASE COMPLETE
          </text>
        </svg>
      </div>

      {/* evidence card */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT }}
        className="relative -mt-14 rounded-card border border-ink-100 bg-white p-5 shadow-lift"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.16em] text-ink-400 uppercase">
              Evidence checklist
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-ink-950">RR-2019-0118</p>
          </div>
          <span className="grid size-9 place-items-center rounded-xl bg-ink-950 text-gold-300">
            <Lock aria-hidden className="size-4" />
          </span>
        </div>

        <ul className="mt-4 space-y-2.5">
          {CHECKLIST.map((item, index) => (
            <motion.li
              key={item.label}
              initial={reduced ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.35 + index * 0.1, ease: EASE_OUT }}
              className="flex items-center gap-2.5 text-sm"
            >
              <CheckCircle2
                aria-hidden
                className={item.done ? "size-4.5 shrink-0 text-mint-500" : "size-4.5 shrink-0 text-ink-200"}
              />
              <span className={item.done ? "font-medium text-ink-800" : "text-ink-400"}>{item.label}</span>
              {!item.done && (
                <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-bold text-amber-700">
                  In progress
                </span>
              )}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <Floating distance={10} duration={6} className="absolute -right-2 -bottom-6 z-10 sm:-right-8">
        <div className="flex items-center gap-2.5 rounded-2xl bg-ink-950 px-3.5 py-2.5 text-white shadow-lift">
          <span className="grid size-7 place-items-center rounded-lg bg-mint-500/20 text-mint-400">
            <CheckCircle2 aria-hidden className="size-4" />
          </span>
          <span className="text-xs font-bold">Evidence verified</span>
        </div>
      </Floating>
    </div>
  );
}

export function RecoveryControlSection() {
  return (
    <Section tone="muted">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal preset="fadeRight" className="order-2 lg:order-1">
            <CaseIllustration />
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal preset="fadeLeft">
              <SectionHeading
                align="left"
                eyebrow="Ownership"
                title="Your Money. Your Case. Your Control."
                description="A refund case fails when information is scattered across inboxes and nobody can say what stage it is at. RoyalRefund keeps the evidence, the history and the current status in one record that you and your reviewer both read from."
              />
            </Reveal>

            <RevealGroup stagger={0.1} delay={0.1} className="mt-9 space-y-5" as="ul">
              {BENEFITS.map((benefit) => {
                const Icon = ICONS[benefit.icon] ?? FileUp;
                return (
                  <RevealItem key={benefit.title} as="li" preset="fadeUp" className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-royal-600 shadow-soft ring-1 ring-ink-100 ring-inset">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-ink-950">{benefit.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-500">
                        {benefit.description}
                      </span>
                    </span>
                  </RevealItem>
                );
              })}
            </RevealGroup>

            <Reveal delay={0.25} className="mt-9">
              <ButtonLink
                href="/register"
                size="lg"
                trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}
              >
                Open a secure account
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
