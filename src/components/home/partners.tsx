"use client";

import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { PARTNER_BANKS } from "@/components/brand/bank-logos";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";

function LogoRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16"
    >
      {PARTNER_BANKS.map(({ name, Mark }) => (
        <li
          key={name}
          className="group flex shrink-0 items-center gap-3 text-ink-300 transition-colors duration-300 hover:text-white"
        >
          <Mark className="size-7 shrink-0 text-mint-400/70 transition-colors duration-300 group-hover:text-mint-400" />
          <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PartnersSection() {
  const { reduced } = useMotionSafe();

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-16 text-white sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-mint-500/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"
      />

      <Container className="relative">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-500/25 bg-mint-500/8 px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-mint-400 uppercase">
            <Landmark aria-hidden className="size-3.5" />
            Banking network
          </span>

          <h2 className="text-balance-tight mt-6 font-display text-3xl leading-[1.1] font-extrabold tracking-tight sm:text-4xl lg:text-[2.7rem]">
            Partnered with{" "}
            <span className="text-mint-400">
              Europe&rsquo;s Leading Banks
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-ink-300">
            We work directly with major financial institutions to expedite refund claims on your
            behalf.
          </p>
        </motion.div>
      </Container>

      {/* logo marquee — full bleed, fading at both edges */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
        className="relative mt-14 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        {reduced ? (
          // No motion: a plain wrapping grid, everything visible at once.
          <Container>
            <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {PARTNER_BANKS.map(({ name, Mark }) => (
                <li key={name} className="flex items-center gap-3 text-ink-300">
                  <Mark className="size-7 shrink-0 text-mint-400/70" />
                  <span className="font-display text-lg font-bold tracking-tight">{name}</span>
                </li>
              ))}
            </ul>
          </Container>
        ) : (
          <div className="group flex w-max animate-[marquee_46s_linear_infinite] hover:[animation-play-state:paused]">
            <LogoRow />
            {/* duplicate purely for the seamless loop, hidden from assistive tech */}
            <LogoRow ariaHidden />
          </div>
        )}
      </motion.div>
    </section>
  );
}
