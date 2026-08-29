"use client";

import { useId } from "react";

/**
 * Simplified circular flag icons drawn as vectors. National flag designs are
 * not copyrightable; these are our own simplified renditions rather than
 * anyone else's artwork.
 */

function Ring() {
  return (
    <circle cx="32" cy="32" r="31" fill="none" stroke="rgb(255 255 255 / 0.85)" strokeWidth="2" />
  );
}

export function FlagUS({ className, title = "United States" }: { className?: string; title?: string }) {
  const id = useId();
  const stripes = Array.from({ length: 13 });

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="64" height="64" fill="#ffffff" />
        {stripes.map((_, index) =>
          index % 2 === 0 ? (
            <rect key={index} y={(index * 64) / 13} width="64" height={64 / 13} fill="#b22234" />
          ) : null,
        )}
        <rect width="30" height={(64 / 13) * 7} fill="#3c3b6e" />
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={4 + col * 5.6 + (row % 2 === 1 ? 2.8 : 0)}
              cy={5 + row * 7.6}
              r="1.5"
              fill="#ffffff"
            />
          )),
        )}
      </g>
      <Ring />
    </svg>
  );
}

export function FlagAU({ className, title = "Australia" }: { className?: string; title?: string }) {
  const id = useId();

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <clipPath id={`${id}-jack`}>
          <rect width="32" height="20" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="64" height="64" fill="#00247d" />

        {/* union canton */}
        <g clipPath={`url(#${id}-jack)`}>
          <path d="M0 0 32 20M32 0 0 20" stroke="#ffffff" strokeWidth="4" />
          <path d="M0 0 32 20M32 0 0 20" stroke="#cf142b" strokeWidth="1.8" />
          <path d="M16 0v20M0 10h32" stroke="#ffffff" strokeWidth="6.5" />
          <path d="M16 0v20M0 10h32" stroke="#cf142b" strokeWidth="3.6" />
        </g>

        {/* commonwealth star */}
        <Star cx={16} cy={44} r={7} />

        {/* southern cross */}
        <Star cx={47} cy={14} r={4} />
        <Star cx={55} cy={31} r={4.5} />
        <Star cx={45} cy={45} r={4} />
        <Star cx={38} cy={30} r={3} />
        <Star cx={51} cy={53} r={2.4} />
      </g>
      <Ring />
    </svg>
  );
}

function Star({ cx: x, cy: y, r }: { cx: number; cy: number; r: number }) {
  const points: string[] = [];
  for (let i = 0; i < 14; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.42;
    const angle = (Math.PI / 7) * i - Math.PI / 2;
    points.push(`${(x + radius * Math.cos(angle)).toFixed(2)},${(y + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return <polygon points={points.join(" ")} fill="#ffffff" />;
}
