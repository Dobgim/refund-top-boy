"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock3, PlayCircle, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { Counter } from "@/components/ui/motion";
import { HeroCards } from "@/components/home/hero-cards";
import { HERO_STATS } from "@/lib/data/content";
import { staggerContainer, fadeUp, EASE_OUT } from "@/lib/animations/variants";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";

const PROOF = [
  { Icon: ShieldCheck, label: "No passwords or PINs requested" },
  { Icon: Clock3, label: "Status visible at every stage" },
  { Icon: Users, label: "One portal for you and your reviewer" },
];

export function Hero() {
  const { reduced } = useMotionSafe();

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 pt-30 pb-20 text-white sm:pt-34 lg:pt-38 lg:pb-24">
      {/* backdrop: layered aurora + drifting dust, no wireframe grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora" />
      <div aria-hidden className="pointer-events-none absolute inset-0 star-field mask-fade-b opacity-70" />
      <motion.div
        aria-hidden
        animate={reduced ? undefined : { opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/4 left-1/2 size-[44rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-royal-600/28 blur-[150px]"
      />
      <motion.div
        aria-hidden
        animate={reduced ? undefined : { opacity: [0.35, 0.7, 0.35], scale: [1.06, 1, 1.06] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 -left-40 size-[36rem] rounded-full bg-fuchsia-600/18 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_bottom,transparent,rgb(8_12_28/0.85)_60%,var(--color-ink-950))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgb(163_178_253/0.35),transparent)]"
      />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_auto] lg:gap-8 xl:gap-12">
          {/* ------------------------------------------------------- headline */}
          <motion.div
            variants={staggerContainer(0.1)}
            initial={reduced ? false : "hidden"}
            animate="visible"
            className="max-w-xl"
          >
            <motion.h1
              variants={fadeUp}
              className="text-balance-tight font-display text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.03em] sm:text-[3.4rem] lg:text-[3.9rem]"
            >
              Recover What
              <br className="hidden sm:block" />{" "}
              <span className="bg-[linear-gradient(100deg,#a3b2fd,#c084fc_45%,#f7d98a)] bg-clip-text text-transparent">
                Belongs To You
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-base leading-relaxed text-ink-200"
            >
              Submit a refund or payment dispute, attach the evidence that supports it, and follow the
              review from triage to resolution in a secure portal built for one thing: knowing exactly
              where your case stands.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/register"
                size="lg"
                trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}
              >
                Get Started
              </ButtonLink>
              <ButtonLink
                href="/how-it-works"
                size="lg"
                variant="ghost"
                leadingIcon={<PlayCircle aria-hidden className="size-4.5" />}
                className="border border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"
              >
                How It Works
              </ButtonLink>
            </motion.div>

            <motion.ul variants={fadeUp} className="mt-10 space-y-3">
              {PROOF.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-ink-300">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/8 text-mint-400 ring-1 ring-white/10 ring-inset">
                    <Icon aria-hidden className="size-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* ---------------------------------------------------------- cards */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
            className="relative px-2 sm:px-10 lg:px-0"
          >
            <HeroCards />
          </motion.div>

          {/* ---------------------------------------------------------- stats */}
          <motion.ul
            variants={staggerContainer(0.14, 0.5)}
            initial={reduced ? false : "hidden"}
            animate="visible"
            className="grid grid-cols-3 gap-6 lg:w-52 lg:grid-cols-1 lg:gap-10"
          >
            {HERO_STATS.map((stat) => (
              <motion.li key={stat.label} variants={fadeUp} className="text-center lg:text-left">
                <p className="font-display text-[2rem] leading-none font-extrabold tracking-tight sm:text-[2.6rem]">
                  <Counter
                    value={stat.value}
                    decimals={"decimals" in stat ? stat.decimals : 0}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-2 text-xs leading-snug text-ink-300 sm:text-sm">{stat.label}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
