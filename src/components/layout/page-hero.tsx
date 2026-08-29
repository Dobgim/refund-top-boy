import type { ReactNode } from "react";
import { Container } from "@/components/ui/primitives";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-30 pb-16 text-white sm:pt-34 lg:pt-38 lg:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora" />
      <div aria-hidden className="pointer-events-none absolute inset-0 star-field mask-fade-b opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/3 size-[36rem] -translate-x-1/2 rounded-full bg-royal-600/22 blur-[130px]"
      />
      <Container className="relative">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-royal-200 uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className="text-balance-tight mt-6 font-display text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
