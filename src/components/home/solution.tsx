"use client";

import { motion } from "framer-motion";
import { BellRing, Eye, FileSearch, FileUp, Radar, ReceiptText, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { SERVICES, BENEFITS } from "@/lib/data/content";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";

const SERVICE_ICONS: Record<string, LucideIcon> = { ShieldCheck, ReceiptText, FileSearch, Radar };
const BENEFIT_ICONS: Record<string, LucideIcon> = { FileUp, BellRing, Eye };

/**
 * The answer to the Problem section. Deliberately carries no call to action of
 * its own: the page has one, at the end. Cards state what the platform does
 * rather than repeating "create an account" four more times.
 */
export function SolutionSection() {
  const { reduced } = useMotionSafe();

  return (
    <Section id="solution" tone="light">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The solution"
            title="One case file, and everyone reads from it"
            description="RoyalRefund turns a scattered complaint into a single record with an owner, a stage and a timestamped history — the thing a reviewer can actually decide on."
          />
        </Reveal>

        <RevealGroup stagger={0.08} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.icon] ?? ShieldCheck;
            return (
              <RevealItem key={service.title} preset="fadeUp" className="h-full">
                <motion.article
                  initial="rest"
                  whileHover={reduced ? undefined : "hover"}
                  animate="rest"
                  variants={{ rest: { y: 0 }, hover: { y: -6 } }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex h-full flex-col rounded-card border border-ink-100 bg-white p-6 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-royal-200 hover:shadow-lift"
                >
                  <motion.span
                    variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.08 } }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="grid size-12 place-items-center rounded-2xl bg-royal-50 text-royal-600 ring-1 ring-royal-100 ring-inset"
                  >
                    <Icon aria-hidden className="size-5.5" />
                  </motion.span>

                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink-950">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-500">
                    {service.description}
                  </p>
                </motion.article>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* the three guarantees that used to be their own section */}
        <RevealGroup
          stagger={0.1}
          delay={0.1}
          as="ul"
          className="mt-6 grid gap-4 rounded-card border border-ink-100 bg-white p-6 shadow-soft sm:grid-cols-3 sm:p-8"
        >
          {BENEFITS.map((benefit) => {
            const Icon = BENEFIT_ICONS[benefit.icon] ?? FileUp;
            return (
              <RevealItem key={benefit.title} as="li" preset="fadeUp" className="flex gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-royal-600 shadow-soft ring-1 ring-ink-100 ring-inset">
                  <Icon aria-hidden className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink-950">{benefit.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-500">
                    {benefit.description}
                  </span>
                </span>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
