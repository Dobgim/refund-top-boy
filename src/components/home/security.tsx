"use client";

import { motion } from "framer-motion";
import { DatabaseZap, FileLock2, KeyRound, ShieldCheck, UserCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { SECURITY_FEATURES } from "@/lib/data/content";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";

const ICONS: Record<string, LucideIcon> = { KeyRound, DatabaseZap, FileLock2, UserCog };

function ShieldGraphic() {
  const { reduced } = useMotionSafe();
  return (
    <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative grid size-64 place-items-center sm:size-80">
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute rounded-full border border-white/10"
            style={{ width: `${100 - ring * 22}%`, height: `${100 - ring * 22}%` }}
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: ring * 0.15, ease: EASE_OUT }}
          />
        ))}
        <motion.span
          className="absolute size-[56%] rounded-full bg-royal-500/12 blur-2xl"
          animate={reduced ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <ShieldCheck className="relative size-16 text-white/15 sm:size-20" />
      </div>
    </div>
  );
}

export function SecuritySection() {
  return (
    <Section tone="dark" className="overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora" />
      <div aria-hidden className="pointer-events-none absolute inset-0 star-field opacity-55" />
      <ShieldGraphic />

      <Container className="relative">
        <Reveal>
          <SectionHeading
            tone="dark"
            eyebrow="Security"
            title="Built With Security At Every Step"
            description="These are the controls the platform actually implements, described in the terms an engineer would use. Nothing here claims a certification we cannot evidence."
          />
        </Reveal>

        <RevealGroup stagger={0.1} className="mt-14 grid gap-4 sm:grid-cols-2">
          {SECURITY_FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon] ?? KeyRound;
            return (
              <RevealItem
                key={feature.title}
                preset="fadeUp"
                className="group rounded-card border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-white/8 text-mint-400 ring-1 ring-white/10 ring-inset transition-transform duration-300 group-hover:scale-110">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{feature.description}</p>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.15} className="mt-8">
          <p className="mx-auto max-w-3xl rounded-2xl border border-gold-400/25 bg-gold-400/8 px-5 py-4 text-center text-sm text-gold-300">
            RoyalRefund will never ask for a banking password, a card PIN, a one-time code, a seed
            phrase or a private key. If any page ever appears to, close it and report it.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
