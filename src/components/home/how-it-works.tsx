"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  ClipboardList,
  ScanSearch,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { STEPS } from "@/lib/data/content";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  UserPlus,
  ClipboardList,
  UploadCloud,
  ScanSearch,
  Activity,
  BadgeCheck,
};

export function HowItWorksSection({
  tone = "light",
  withHeading = true,
}: {
  tone?: "light" | "muted";
  withHeading?: boolean;
}) {
  const { reduced } = useMotionSafe();
  const trackRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 75%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.6 });
  const scaleY = useTransform(progress, (value) => (reduced ? 1 : value));

  return (
    <Section id="how-it-works" tone={tone}>
      <Container>
        {withHeading && (
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Six steps from first submission to resolution"
              description="Each stage has a clear owner and a clear exit condition, so a case never sits in an unnamed queue."
            />
          </Reveal>
        )}

        <ol ref={trackRef} className="relative mt-16 space-y-10 lg:space-y-0">
          {/* rail */}
          <div
            aria-hidden
            className="absolute top-2 bottom-2 left-6 w-px bg-ink-200 lg:left-1/2 lg:-translate-x-1/2"
          >
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="h-full w-px bg-royal-600"
            />
          </div>

          {STEPS.map((step, index) => {
            const Icon = ICONS[step.icon] ?? UserPlus;
            const flip = index % 2 === 1;

            return (
              <li
                key={step.number}
                className={cn(
                  "relative pl-16 lg:grid lg:grid-cols-2 lg:gap-14 lg:pl-0",
                  index > 0 && "lg:-mt-6",
                )}
              >
                {/* node */}
                <motion.span
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="absolute top-1 left-0 z-10 grid size-12 place-items-center rounded-2xl bg-white text-royal-600 shadow-soft ring-1 ring-ink-100 lg:left-1/2 lg:-translate-x-1/2"
                >
                  <Icon aria-hidden className="size-5" />
                </motion.span>

                <motion.div
                  initial={reduced ? false : { opacity: 0, x: flip ? 28 : -28, y: 14 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                  className={cn(
                    "rounded-card border border-ink-100 bg-white p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift",
                    flip ? "lg:col-start-2 lg:ml-10" : "lg:col-start-1 lg:mr-10",
                    "lg:mb-14",
                  )}
                >
                  <span className="font-mono text-xs font-bold tracking-[0.2em] text-royal-500">
                    {step.number}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-ink-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
