"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2, Lock, ShieldCheck, User } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import { cn } from "@/lib/utils";

const CYCLE = 4.4;

function Party({
  role,
  name,
  meta,
  icon: Icon,
  accent,
}: {
  role: string;
  name: string;
  meta: string;
  icon: typeof User;
  accent: "royal" | "mint";
}) {
  return (
    <div className="w-full max-w-[15rem] rounded-card border border-ink-100 bg-white p-5 text-center shadow-soft md:text-left">
      <div className="flex flex-col items-center gap-3 md:flex-row">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset",
            accent === "royal"
              ? "bg-royal-50 text-royal-600 ring-royal-100"
              : "bg-mint-500/10 text-mint-600 ring-mint-500/20",
          )}
        >
          <Icon aria-hidden className="size-5.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-bold tracking-[0.16em] text-ink-400 uppercase">{role}</p>
          <p className="mt-0.5 truncate font-bold text-ink-950">{name}</p>
        </div>
      </div>
      <p className="mt-3 truncate font-mono text-xs text-ink-400">{meta}</p>
    </div>
  );
}

function Connector({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const { reduced } = useMotionSafe();
  const horizontal = orientation === "horizontal";

  const packetTransition = {
    duration: CYCLE * 0.55,
    repeat: Infinity,
    repeatDelay: CYCLE * 0.45,
    ease: EASE_OUT,
  };

  return (
    <div
      aria-hidden
      className={cn("relative", horizontal ? "h-24 flex-1" : "h-28 w-full")}
    >
      {/* rail */}
      <div
        className={cn(
          "absolute rounded-full bg-[repeating-linear-gradient(90deg,var(--color-ink-200)_0_6px,transparent_6px_12px)]",
          horizontal
            ? "top-1/2 right-0 left-0 h-0.5 -translate-y-1/2"
            : "top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-[repeating-linear-gradient(180deg,var(--color-ink-200)_0_6px,transparent_6px_12px)]",
        )}
      />

      {/* travelling fill */}
      {!reduced && (
        <motion.div
          className={cn(
            "absolute rounded-full bg-royal-600",
            horizontal
              ? "top-1/2 left-0 h-0.5 -translate-y-1/2"
              : "top-0 left-1/2 w-0.5 -translate-x-1/2 bg-royal-600",
          )}
          initial={horizontal ? { width: "0%" } : { height: "0%" }}
          animate={horizontal ? { width: ["0%", "100%"] } : { height: ["0%", "100%"] }}
          transition={packetTransition}
        />
      )}

      {/* packet */}
      <motion.div
        className={cn(
          "absolute grid size-9 place-items-center rounded-xl bg-royal-600 text-white shadow-glow",
          horizontal ? "top-1/2 -translate-y-1/2 -translate-x-1/2" : "left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        initial={
          reduced
            ? { left: horizontal ? "50%" : undefined, top: horizontal ? undefined : "50%", opacity: 1 }
            : horizontal
              ? { left: "0%", opacity: 0, scale: 0.6 }
              : { top: "0%", opacity: 0, scale: 0.6 }
        }
        animate={
          reduced
            ? undefined
            : horizontal
              ? { left: ["0%", "100%"], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }
              : { top: ["0%", "100%"], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }
        }
        transition={packetTransition}
      >
        <Lock className="size-4" />
      </motion.div>

      {/* label */}
      <div
        className={cn(
          "absolute flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 py-1 text-[0.68rem] font-bold whitespace-nowrap text-ink-600 shadow-soft",
          horizontal
            ? "top-1/2 left-1/2 -translate-x-1/2 translate-y-6"
            : "top-1/2 left-1/2 -translate-x-1/2 translate-y-8",
        )}
      >
        <ShieldCheck className="size-3.5 text-mint-500" />
        Encrypted in transit
      </div>
    </div>
  );
}

export function TransferFlowSection() {
  const { reduced } = useMotionSafe();

  return (
    <Section tone="muted">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Resolution"
            title="What a settled case looks like"
            description="The final hop. Once a case is approved, the recovered amount moves from the reviewing party back to the account it came from, and the outcome is recorded against the case."
          />
        </Reveal>

        <Reveal preset="scaleIn" delay={0.1} className="mt-14">
          <div className="relative overflow-hidden rounded-card border border-ink-100 bg-white p-6 shadow-soft sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-royal-500/8 blur-3xl"
            />

            {/* amount */}
            <div className="relative flex flex-col items-center gap-2 text-center">
              <p className="text-[0.68rem] font-bold tracking-[0.16em] text-ink-400 uppercase">
                Recovered amount
              </p>
              <p className="font-display text-4xl font-extrabold tracking-tight text-ink-950 sm:text-5xl">
                $486.50
              </p>
            </div>

            {/* flow */}
            <div className="relative mt-10 flex flex-col items-center gap-0 md:flex-row md:justify-between md:gap-6">
              <Party
                role="Sender"
                name="Reviewing party"
                meta="Case settlement account"
                icon={Building2}
                accent="royal"
              />

              <div className="hidden w-full flex-1 md:block">
                <Connector orientation="horizontal" />
              </div>
              <div className="block w-full md:hidden">
                <Connector orientation="vertical" />
              </div>

              <Party
                role="Receiver"
                name="Amara Osei"
                meta="RR-2019-0118"
                icon={User}
                accent="mint"
              />
            </div>

            {/* success */}
            <div className="relative mt-10 flex justify-center">
              <motion.div
                initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                animate={
                  reduced
                    ? undefined
                    : {
                        opacity: [0, 0, 1, 1, 0],
                        scale: [0.9, 0.9, 1, 1, 0.96],
                      }
                }
                transition={{
                  duration: CYCLE,
                  times: [0, 0.5, 0.62, 0.9, 1],
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="inline-flex items-center gap-2.5 rounded-full bg-mint-500/10 py-2.5 pr-5 pl-2.5 ring-1 ring-mint-500/25 ring-inset"
              >
                <span className="grid size-8 place-items-center rounded-full bg-mint-500 text-white">
                  <CheckCircle2 aria-hidden className="size-4.5" />
                </span>
                <span className="text-sm font-bold text-mint-600">
                  Resolution recorded &mdash; case closed
                </span>
              </motion.div>
            </div>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-ink-100 pt-6 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1.5">
                <ArrowRight aria-hidden className="size-3.5" />
                Average settlement window: 14 days
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock aria-hidden className="size-3.5" />
                No payment credentials are ever handled
              </span>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
