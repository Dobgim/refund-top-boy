"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, FileSearch, Radar, ReceiptText, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { SERVICES } from "@/lib/data/content";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";

const ICONS: Record<string, LucideIcon> = { ShieldCheck, ReceiptText, FileSearch, Radar };

export function ServicesSection() {
  const { reduced } = useMotionSafe();

  return (
    <Section id="services" tone="light">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What you get"
            title="Four building blocks of a clean recovery case"
            description="Everything the platform does supports one outcome: a complete, well-evidenced case that a reviewer can act on without chasing you for the basics."
          />
        </Reveal>

        <RevealGroup stagger={0.09} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon] ?? ShieldCheck;
            return (
              <RevealItem key={service.title} preset="fadeUp" className="h-full">
                <motion.article
                  initial="rest"
                  whileHover={reduced ? undefined : "hover"}
                  whileFocus={reduced ? undefined : "hover"}
                  animate="rest"
                  variants={{ rest: { y: 0 }, hover: { y: -8 } }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-card border border-ink-100 bg-white p-6 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-royal-200 hover:shadow-lift"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgb(99_102_241/0.07),transparent_55%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                  />

                  <motion.span
                    variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.08 } }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="relative grid size-12 place-items-center rounded-2xl bg-royal-50 text-royal-600 ring-1 ring-royal-100 ring-inset"
                  >
                    <Icon aria-hidden className="size-5.5" />
                  </motion.span>

                  <h3 className="relative mt-5 font-display text-lg font-bold tracking-tight text-ink-950">
                    {service.title}
                  </h3>
                  <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-ink-500">
                    {service.description}
                  </p>

                  <Link
                    href={service.href}
                    className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-royal-600 transition-colors hover:text-royal-800"
                  >
                    {service.action}
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </motion.article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
