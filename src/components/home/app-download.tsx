"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BellRing, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { StoreBadge } from "@/components/brand/store-badges";
import { Floating } from "@/components/ui/motion";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import portrait from "@/../public/images/app-recovery-portrait.jpg";

export function AppDownloadSection() {
  const { reduced } = useMotionSafe();

  return (
    <section className="relative isolate overflow-hidden border-t border-ink-100 bg-white py-20 text-ink-900 sm:py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-[24%] size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal-500/8 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -bottom-28 size-[32rem] rounded-full bg-royal-600/5 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-transparent"
      />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* photo */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="relative mx-auto w-[min(24rem,80vw)] lg:mx-0 lg:w-full lg:max-w-[27rem]"
          >
            {/* glow disc behind the frame */}
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[3.5rem] bg-royal-600/10 blur-[80px]"
            />

            <div className="relative overflow-hidden rounded-[2.5rem] shadow-lift ring-1 ring-ink-100">
              <Image
                src={portrait}
                alt="A customer holding up their payment card while reviewing a refund case on a laptop"
                placeholder="blur"
                priority={false}
                sizes="(max-width: 1024px) 80vw, 27rem"
                className="h-full w-full object-cover"
              />
              {/* tint the photo into the section palette */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(8_12_28/0.18),transparent_45%)]"
              />
            </div>

            {/* floating chips over the photo */}
            <Floating distance={10} duration={6.5} className="absolute -top-4 -right-4 z-10 sm:-right-8">
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.45, ease: EASE_OUT }}
                className="flex items-center gap-2.5 rounded-2xl border border-ink-100 bg-white px-3.5 py-2.5 shadow-lift"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-mint-500/12 text-mint-600">
                  <ShieldCheck aria-hidden className="size-4" />
                </span>
                <span className="text-xs font-bold text-ink-950">Case secured</span>
              </motion.div>
            </Floating>

            <Floating distance={9} duration={7.5} delay={0.4} className="absolute -bottom-5 -left-3 z-10 sm:-left-8">
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6, ease: EASE_OUT }}
                className="flex max-w-[15rem] items-start gap-2.5 rounded-2xl bg-white px-3.5 py-3 text-ink-950 shadow-lift"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-royal-600 text-white">
                  <BellRing aria-hidden className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold">Status changed to Approved</span>
                  <span className="block truncate font-mono text-[0.66rem] text-ink-400">
                    RR-2019-0121
                  </span>
                </span>
              </motion.div>
            </Floating>
          </motion.div>

          {/* copy */}
          <div>
            <motion.h2
              initial={reduced ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.75, ease: EASE_OUT }}
              className="text-balance-tight font-display text-[2.3rem] leading-[1.08] font-extrabold tracking-[-0.03em] text-ink-950 sm:text-[2.9rem] lg:text-[3.3rem]"
            >
              RoyalRefund Is The Fastest
              <br className="hidden sm:block" /> Way To{" "}
              <span className="text-royal-600">
                Recover Your Money
              </span>
            </motion.h2>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.75, delay: 0.1, ease: EASE_OUT }}
              className="mt-6 max-w-xl text-base leading-relaxed text-ink-500"
            >
              Manage your cases wherever you are. Upload a receipt from your camera roll, answer a
              reviewer between meetings, and get a notification the moment your status changes.
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.75, delay: 0.18, ease: EASE_OUT }}
              className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <p className="font-display text-sm font-extrabold tracking-[0.14em] whitespace-nowrap text-ink-950 uppercase">
                Download the app
              </p>
              <div className="flex flex-wrap gap-3">
                <StoreBadge kind="apple" />
                <StoreBadge kind="play" />
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
