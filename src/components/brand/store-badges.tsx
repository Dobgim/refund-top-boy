"use client";

/**
 * Store buttons drawn with our own simplified glyphs rather than the official
 * downloadable badge artwork, which carries its own brand guidelines.
 */

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.9-1.2 1.2-2.4 1.2-2.5-.1 0-2.2-.9-2.2-3.7Z" />
      <path d="M14.3 6c.6-.7 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.6-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3Z" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden>
      <path d="M4 2.6v18.8c0 .5.5.8.9.6l10.2-6-3-3L4 2.6Z" fill="#34d3a4" />
      <path d="M4 2.6 12.1 13l3-3L4.9 2C4.5 1.8 4 2.1 4 2.6Z" fill="#7f8bf9" />
      <path d="m15.1 16 3.9-2.3c.7-.4.7-1.4 0-1.8L15.1 9.6l-3.3 3.2 3.3 3.2Z" fill="#f2c866" />
      <path d="m12.1 13 3 3 .1-.1-3.2-3.1-.1.1Z" fill="#e3ac3c" />
    </svg>
  );
}

function scrollToTop() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}

export function StoreBadge({ kind }: { kind: "apple" | "play" }) {
  const label = kind === "apple" ? "Download on the" : "Get it on";
  const store = kind === "apple" ? "App Store" : "Google Play";

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={`${label} ${store} — back to the top of the page`}
      className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-ink-200 bg-white py-3 pr-6 pl-5 text-ink-950 shadow-soft transition-colors duration-200 hover:border-royal-300 hover:bg-royal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-600"
    >
      {kind === "apple" ? <AppleGlyph /> : <PlayGlyph />}
      <span className="text-left leading-tight">
        <span className="block text-[0.68rem] text-ink-400">{label}</span>
        <span className="block font-display text-base font-extrabold tracking-tight">{store}</span>
      </span>
    </button>
  );
}
