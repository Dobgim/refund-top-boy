"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Returns motion props that collapse to a static state when the visitor has
 * asked for reduced motion.
 */
export function useMotionSafe() {
  const reduced = useReducedMotion() ?? false;
  return {
    reduced,
    /** Spread onto a motion element to disable a decorative loop. */
    loop<T extends object>(animation: T): T | undefined {
      return reduced ? undefined : animation;
    },
  };
}
