"use client";

import { motion, useInView, useMotionValue, useSpring, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import {
  VIEWPORT,
  fadeIn,
  fadeLeft,
  fadeRight,
  fadeUp,
  scaleIn,
  staggerContainer,
  tiltIn,
} from "@/lib/animations/variants";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { cn } from "@/lib/utils";

const PRESETS: Record<string, Variants> = {
  fadeIn,
  fadeUp,
  fadeLeft,
  fadeRight,
  scaleIn,
  tiltIn,
};

export type RevealPreset = keyof typeof PRESETS;

/**
 * Scroll-triggered entrance. Collapses to a plain element when the visitor has
 * asked for reduced motion.
 */
export function Reveal({
  preset = "fadeUp",
  delay = 0,
  className,
  as = "div",
  amount,
  children,
}: {
  preset?: RevealPreset;
  delay?: number;
  className?: string;
  as?: ElementType;
  amount?: number;
  children: ReactNode;
}) {
  const { reduced } = useMotionSafe();
  const Component = motion[as as "div"] ?? motion.div;

  if (reduced) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      variants={PRESETS[preset]}
      initial="hidden"
      whileInView="visible"
      viewport={amount ? { once: true, amount } : VIEWPORT}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

/** Parent that staggers direct `RevealItem` children into view. */
export function RevealGroup({
  stagger = 0.09,
  delay = 0,
  className,
  as = "div",
  amount = 0.2,
  children,
}: {
  stagger?: number;
  delay?: number;
  className?: string;
  as?: ElementType;
  amount?: number;
  children: ReactNode;
}) {
  const { reduced } = useMotionSafe();
  const Component = motion[as as "div"] ?? motion.div;

  if (reduced) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  preset = "fadeUp",
  className,
  as = "div",
  children,
}: {
  preset?: RevealPreset;
  className?: string;
  as?: ElementType;
  children: ReactNode;
}) {
  const { reduced } = useMotionSafe();
  const Component = motion[as as "div"] ?? motion.div;

  if (reduced) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component className={className} variants={PRESETS[preset]}>
      {children}
    </Component>
  );
}

/** Decorative idle float. Static for reduced-motion visitors. */
export function Floating({
  distance = 12,
  duration = 6,
  delay = 0,
  className,
  children,
}: {
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const { reduced } = useMotionSafe();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Counts from zero to `value` the first time it scrolls into view. */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const { reduced } = useMotionSafe();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 18, mass: 0.9 });
  const [animated, setAnimated] = useState(0);
  const display = reduced ? value : animated;

  useEffect(() => {
    if (!reduced && inView) motionValue.set(value);
  }, [inView, motionValue, reduced, value]);

  useEffect(() => {
    if (reduced) return;
    return spring.on("change", (latest) => setAnimated(latest));
  }, [reduced, spring]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      <span className="tabular-nums">
        {prefix}
        {formatted}
      </span>
      {suffix}
    </span>
  );
}

/** Thin progress bar that fills when it enters the viewport. */
export function ProgressBar({
  value,
  className,
  barClassName,
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const { reduced } = useMotionSafe();
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}
    >
      <motion.div
        className={cn("h-full rounded-full bg-royal-600", barClassName)}
        initial={reduced ? false : { width: 0 }}
        whileInView={{ width: `${clamped}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={reduced ? { width: `${clamped}%` } : undefined}
      />
    </div>
  );
}
