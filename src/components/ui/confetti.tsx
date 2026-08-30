"use client";

import { useMotionSafe } from "@/lib/animations/use-reduced-motion";

const COLOURS = [
  "#4f46e5", "#6366f1", "#a3b2fd", "#14b98a", "#34d3a4",
  "#f2c866", "#e3ac3c", "#f472b6", "#38bdf8", "#fb923c",
];

/**
 * Deterministic pseudo-random in [0, 1), seeded by the piece index.
 *
 * Math.random would have been simpler but wrong twice over: it is impure during
 * render, and it would produce a different field on the server than on the
 * client, tripping a hydration mismatch. A hash of the index scatters the
 * pieces just as convincingly and gives the same answer everywhere.
 */
function spread(index: number, salt: number): number {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const PIECES = Array.from({ length: 90 }, (_, index) => ({
  id: index,
  left: spread(index, 1) * 100,
  delay: spread(index, 2) * 4,
  duration: 4.5 + spread(index, 3) * 4,
  size: 6 + spread(index, 4) * 8,
  colour: COLOURS[index % COLOURS.length],
  rotate: spread(index, 5) * 360,
  round: spread(index, 6) > 0.75,
  drift: spread(index, 7) * 60 - 30,
}));

/**
 * Falling confetti. Plain absolutely-positioned elements driven by one CSS
 * keyframe: no canvas, no animation library, nothing to clean up. Renders
 * nothing at all for visitors who have asked for reduced motion.
 */
export function Confetti() {
  const { reduced } = useMotionSafe();
  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {PIECES.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-0 animate-[confetti-fall_linear_infinite]"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size * (piece.round ? 1 : 1.6)}px`,
            backgroundColor: piece.colour,
            borderRadius: piece.round ? "9999px" : "2px",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ["--confetti-rotate" as string]: `${piece.rotate}deg`,
            ["--confetti-drift" as string]: `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
