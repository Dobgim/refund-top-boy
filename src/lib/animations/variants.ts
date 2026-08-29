import type { Transition, Variants } from "framer-motion";

/** Shared easing so every motion in the product feels like one system. */
export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];
export const EASE_SOFT: Transition["ease"] = [0.4, 0, 0.2, 1];

export const VIEWPORT = { once: true, amount: 0.25 } as const;
export const VIEWPORT_EARLY = { once: true, amount: 0.1 } as const;

const base = (
  from: Record<string, number | undefined>,
  duration = 0.6,
): Variants => ({
  hidden: { opacity: 0, ...from },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { duration, ease: EASE_OUT },
  },
});

export const fadeIn = base({}, 0.7);
export const fadeUp = base({ y: 28 });
export const fadeDown = base({ y: -24 });
export const fadeLeft = base({ x: 36 });
export const fadeRight = base({ x: -36 });
export const scaleIn = base({ scale: 0.92 }, 0.55);
export const tiltIn = base({ y: 24, rotate: -2, scale: 0.96 }, 0.7);

export const staggerContainer = (stagger = 0.09, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const slideIn = (direction: "left" | "right" | "up" | "down" = "up"): Variants => {
  const offset = { left: { x: -48 }, right: { x: 48 }, up: { y: 48 }, down: { y: -48 } }[direction];
  return base(offset, 0.65);
};

/** Continuous idle float for decorative cards. */
export const floating = (distance = 12, duration = 6, delay = 0) => ({
  y: [0, -distance, 0],
  transition: { duration, delay, repeat: Infinity, ease: EASE_SOFT },
});

export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.6, ease: EASE_SOFT }, opacity: { duration: 0.2 } },
  },
};

export const cardHover = {
  rest: { y: 0 },
  hover: { y: -6, transition: { duration: 0.28, ease: EASE_OUT } },
};
