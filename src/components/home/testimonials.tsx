"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { TESTIMONIALS } from "@/lib/data/content";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { EASE_OUT } from "@/lib/animations/variants";
import { initialsOf, cn } from "@/lib/utils";

const AUTOPLAY_MS = 5200;

const ACCENTS = {
  royal: "from-royal-500 to-royal-800",
  mint: "from-mint-400 to-mint-600",
  gold: "from-gold-400 to-gold-600",
} as const;

function Avatar({ name, accent }: { name: string; accent: keyof typeof ACCENTS }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-sm font-extrabold text-white shadow-soft",
        ACCENTS[accent],
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={cn(
            "size-3.5",
            star <= value ? "fill-gold-400 text-gold-400" : "fill-ink-100 text-ink-200",
          )}
        />
      ))}
    </span>
  );
}

function usePerView() {
  const [perView, setPerView] = useState(1);
  useLayoutEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      setPerView(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return perView;
}

export function TestimonialsSection() {
  const { reduced } = useMotionSafe();
  const perView = usePerView();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [rawIndex, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const maxIndex = Math.max(0, TESTIMONIALS.length - perView);

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const measure = () => setSlideWidth(element.clientWidth / perView);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [perView]);

  // Clamp during render so a viewport change can never leave the track
  // scrolled past the last slide.
  const index = Math.min(rawIndex, maxIndex);

  const go = useCallback(
    (next: number) => {
      setIndex(((next % (maxIndex + 1)) + maxIndex + 1) % (maxIndex + 1));
    },
    [maxIndex],
  );

  useEffect(() => {
    if (paused || reduced || maxIndex === 0) return;
    const timer = window.setInterval(() => setIndex((current) => (current >= maxIndex ? 0 : current + 1)), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, maxIndex]);

  return (
    <Section tone="light">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <SectionHeading
              align="left"
              eyebrow="Feedback"
              title="What a good recovery experience sounds like"
              description="A few words from people whose cases have closed."
            />
          </Reveal>

          <Reveal preset="fadeLeft" className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={maxIndex === 0}
              aria-label="Previous testimonials"
              className="grid size-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:border-royal-300 hover:bg-royal-50 hover:text-royal-700 disabled:opacity-40"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={maxIndex === 0}
              aria-label="Next testimonials"
              className="grid size-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:border-royal-300 hover:bg-royal-50 hover:text-royal-700 disabled:opacity-40"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </Reveal>
        </div>

        <div
          className="mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div ref={viewportRef} className="overflow-hidden">
            <motion.ul
              className="flex touch-pan-y"
              drag={maxIndex === 0 ? false : "x"}
              dragElastic={0.12}
              dragMomentum={false}
              dragConstraints={{ left: -maxIndex * slideWidth, right: 0 }}
              animate={{ x: -index * slideWidth }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT }}
              onDragEnd={(_event, info) => {
                const threshold = Math.max(60, slideWidth * 0.22);
                if (info.offset.x < -threshold) go(index + 1);
                else if (info.offset.x > threshold) go(index - 1);
              }}
              aria-live="polite"
            >
              {TESTIMONIALS.map((item) => (
                <li
                  key={item.name}
                  className="w-full shrink-0 px-2.5 first:pl-0 last:pr-0 sm:w-1/2 lg:w-1/3"
                  style={{ width: slideWidth ? `${slideWidth}px` : undefined }}
                >
                  <figure className="flex h-full flex-col rounded-card border border-ink-100 bg-white p-6 shadow-soft">
                    <Quote aria-hidden className="size-7 text-royal-200" />
                    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-5">
                      <Avatar name={item.name} accent={item.accent as keyof typeof ACCENTS} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-ink-950">{item.name}</span>
                        <span className="block truncate text-xs text-ink-400">{item.role}</span>
                      </span>
                      <Rating value={item.rating} />
                    </figcaption>
                  </figure>
                </li>
              ))}
            </motion.ul>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, dot) => (
              <button
                key={dot}
                type="button"
                onClick={() => go(dot)}
                aria-label={`Go to slide ${dot + 1}`}
                aria-current={dot === index ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  dot === index ? "w-7 bg-royal-600" : "w-2 bg-ink-200 hover:bg-ink-300",
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
