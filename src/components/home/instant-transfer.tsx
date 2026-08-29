"use client";

import { motion } from "framer-motion";
import { Check, Send, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Floating } from "@/components/ui/motion";
import { FlagAU, FlagUS } from "@/components/brand/flags";
import { LogoMark } from "@/components/brand/logo";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

const RECEIPT_ROWS = [
  ["Code", "NVX1256SJKL0"],
  ["Reference", "RR-2019-0118"],
  ["Date", "12 August 2019"],
  ["Time", "9:13 PM"],
];

/* ------------------------------------------------------------------- pieces */

function PartyRow({
  name,
  amount,
  flag,
  avatar,
}: {
  name: string;
  amount: string;
  flag: React.ReactNode;
  avatar: React.ReactNode;
}) {
  return (
    <div className="relative">
      <p className="font-display text-lg font-extrabold tracking-tight text-royal-700 sm:text-xl">
        {name}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-royal-50 px-3 py-3 sm:px-4">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full">
            {avatar}
          </span>
          <span className="truncate font-display text-lg font-extrabold text-royal-700 sm:text-xl">
            {amount}
          </span>
        </div>
        <span className="grid size-13 shrink-0 place-items-center rounded-full shadow-soft sm:size-14">
          {flag}
        </span>
      </div>
    </div>
  );
}

/** Original abstract portrait: a solid disc carrying the account initials. */
function Portrait({ initials, tone }: { initials: string; tone: string }) {
  return (
    <span
      className={cn(
        "grid size-11 place-items-center rounded-full font-display text-sm font-extrabold text-white",
        tone,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------------ section */

export function InstantTransferSection() {
  const { reduced } = useMotionSafe();

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-20 text-white sm:py-24 lg:py-28">
      {/* aurora backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 size-[42rem] rounded-full bg-royal-700/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-0 size-[34rem] translate-x-1/3 rounded-full bg-royal-800/25 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgb(79_70_229/0.12),transparent_60%)]"
      />

      <Container className="relative">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 xl:gap-16">
          {/* ---------------------------------------------------------- left */}
          <div>
            <motion.h2
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="text-balance-tight font-display text-[2.5rem] leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[3.5rem]"
            >
              Your Money Back,
              <br />
              <span className="text-royal-300">
                Straight To You
              </span>
            </motion.h2>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
              className="mt-6 max-w-md text-base leading-relaxed text-ink-200"
            >
              When a case is approved, the recovered amount is returned to the account it left from,
              in the currency it was taken in. You see the confirmation the moment it clears.
            </motion.p>

            {/* transfer card */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
              className="relative mt-10 max-w-lg rounded-[1.75rem] bg-white p-6 shadow-[0_40px_80px_-40px_rgb(8_12_28/0.9)] sm:p-8"
            >
              <PartyRow
                name="Amara Osei sending"
                amount="$466.50"
                avatar={<Portrait initials="AO" tone="bg-royal-600" />}
                flag={<FlagUS className="size-13 sm:size-14" />}
              />

              {/* connector */}
              <div className="relative my-6 flex items-center gap-4" aria-hidden>
                <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--color-ink-200)_0_6px,transparent_6px_12px)]" />
                <motion.span
                  className="grid size-13 shrink-0 place-items-center rounded-full bg-royal-600 text-white shadow-[0_14px_30px_-12px_rgb(79_70_229/0.8)]"
                  animate={reduced ? undefined : { scale: [1, 1.07, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Send className="size-5.5 -translate-x-px" />
                </motion.span>
                <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--color-ink-200)_0_6px,transparent_6px_12px)]" />
              </div>

              <PartyRow
                name="William Adeyemi receiving"
                amount="$466.50"
                avatar={<Portrait initials="WA" tone="bg-mint-600" />}
                flag={<FlagAU className="size-13 sm:size-14" />}
              />

              {/* success toast */}
              <Floating
                distance={9}
                duration={5.5}
                className="absolute -right-4 bottom-24 z-20 hidden sm:block lg:-right-10"
              >
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.85, x: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT }}
                  className="flex w-[19rem] items-center gap-3 rounded-2xl bg-mint-600 px-4 py-3.5 text-white shadow-[0_20px_46px_-20px_rgb(13_154_114/0.8)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/25">
                    <Check className="size-4.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-snug font-semibold">
                    Your payment has been successful
                  </span>
                </motion.div>
              </Floating>
            </motion.div>

          </div>

          {/* --------------------------------------------------------- right */}
          <div className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal-600/25 blur-[110px]"
            />

            {/* payment card behind the phone */}
            <motion.div
              initial={reduced ? false : { opacity: 0, x: 60, rotate: 12 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT }}
              className="absolute top-[28%] right-0 z-0 w-[15rem] translate-x-[18%] sm:w-[17rem] lg:translate-x-[22%]"
            >
              <div className="[transform:rotate(-24deg)_skewY(6deg)]">
                <div className="relative overflow-hidden rounded-2xl bg-ink-900 p-5 shadow-[0_36px_60px_-28px_rgb(0_0_0/0.9)] ring-1 ring-white/10 ring-inset">
                  <div
                    aria-hidden
                    className="absolute -top-10 -right-6 size-28 rounded-full bg-white/8 blur-xl"
                  />
                  <div className="relative flex items-center gap-2">
                    <LogoMark className="size-7" />
                    <span className="font-display text-base font-extrabold tracking-tight text-white">
                      RoyalRefund
                    </span>
                  </div>
                  <div className="relative mt-10 flex items-end justify-between">
                    <span className="font-mono text-[0.7rem] tracking-[0.18em] text-white/45">
                      •••• 4471
                    </span>
                    <span className="font-mono text-[0.7rem] tracking-[0.14em] text-white/45">
                      EXP 12/28
                    </span>
                  </div>
                  {/* magnetic stripe edge */}
                  <div aria-hidden className="absolute inset-x-0 -bottom-0 h-2 bg-white/12" />
                </div>
                <div aria-hidden className="mx-2 h-1.5 rounded-b-lg bg-white/25" />
                <div aria-hidden className="mx-5 h-1 rounded-b-lg bg-white/15" />
              </div>
            </motion.div>

            {/* phone */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
              className="relative z-10 mx-auto w-[min(17.5rem,78vw)] rounded-[2.75rem] border-[9px] border-ink-800 bg-ink-900 shadow-[0_60px_100px_-45px_rgb(0_0_0/0.95)] ring-1 ring-white/10 sm:w-[19rem]"
            >
              <span aria-hidden className="absolute top-24 -left-[11px] h-14 w-[3px] rounded-l bg-ink-700" />
              <span aria-hidden className="absolute top-28 -right-[11px] h-20 w-[3px] rounded-r bg-ink-700" />

              <div className="overflow-hidden rounded-[2.1rem] bg-ink-900 px-4 pt-4 pb-6">
                <div
                  aria-hidden
                  className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/25"
                />
                <p className="text-center text-sm font-semibold text-ink-200">Payment Receipt</p>

                <div className="mt-4 rounded-[1.4rem] bg-ink-800/70 p-5 text-center ring-1 ring-white/8 ring-inset">
                  <p className="font-display text-lg font-extrabold text-white">Payment Success!</p>
                  <p className="mx-auto mt-2 max-w-[13rem] text-xs leading-relaxed text-ink-300">
                    Case RR-2019-0118 has been resolved and the amount returned.
                  </p>

                  <p className="mt-5 text-[0.65rem] font-semibold tracking-[0.16em] text-ink-400 uppercase">
                    Total returned
                  </p>
                  <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
                    $466.50
                  </p>

                  <dl className="mt-5 space-y-2.5 text-left">
                    {RECEIPT_ROWS.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <dt className="text-xs text-ink-400">{label}</dt>
                        <dd className="truncate font-mono text-xs font-semibold text-ink-100">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 rounded-full bg-royal-600 py-3 text-sm font-bold text-white">
                    Done
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink-400">View case</p>
                </div>
              </div>
            </motion.div>

            {/* secured chip */}
            <Floating distance={10} duration={6.5} className="absolute -top-3 left-0 z-20 lg:-left-6">
              <motion.span
                initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.6, ease: EASE_OUT }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md"
              >
                <ShieldCheck aria-hidden className="size-4 text-mint-400" />
                Secured transfer
              </motion.span>
            </Floating>
          </div>
        </div>
      </Container>
    </section>
  );
}
