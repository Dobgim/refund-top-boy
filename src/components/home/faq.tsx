"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { FAQS } from "@/lib/data/content";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_SOFT } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

export function FaqAccordion({
  items = FAQS,
  className,
}: {
  items?: ReadonlyArray<{ question: string; answer: string }>;
  className?: string;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);
  const { reduced } = useMotionSafe();

  return (
    <div className={cn("divide-y divide-ink-100 overflow-hidden rounded-card border border-ink-100 bg-white shadow-soft", className)}>
      {items.map((item, index) => {
        const expanded = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex w-full items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-ink-50/70 sm:px-6"
              >
                <span className="flex-1 font-semibold text-ink-950">{item.question}</span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: expanded ? 45 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.28, ease: EASE_SOFT }}
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg transition-colors",
                    expanded ? "bg-royal-600 text-white" : "bg-ink-100 text-ink-500",
                  )}
                >
                  <Plus className="size-4" />
                </motion.span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduced ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? { height: "auto", opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.34, ease: EASE_SOFT }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500 sm:px-6 sm:pr-16">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function FaqSection() {
  return (
    <Section id="faq" tone="muted">
      <Container size="narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Questions"
            title="Answers before you start"
            description="The things people ask most often about submitting and following a case."
          />
        </Reveal>

        <Reveal preset="fadeUp" delay={0.1} className="mt-12">
          <FaqAccordion />
        </Reveal>

        <Reveal delay={0.2} className="mt-8">
          <p className="text-center text-sm text-ink-500">
            Something not covered here?{" "}
            <Link href="/contact" className="font-semibold text-royal-600 hover:text-royal-800">
              Ask us directly
            </Link>
            .
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
