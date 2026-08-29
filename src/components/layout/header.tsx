"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { AuthNavButtons } from "@/components/layout/auth-nav";
import { PRIMARY_NAV } from "@/lib/site";
import { EASE_OUT } from "@/lib/animations/variants";
import { useMotionSafe } from "@/lib/animations/use-reduced-motion";
import { cn } from "@/lib/utils";

/** Routes whose hero is dark, so the bar can start transparent over it. */
const TRANSPARENT_ROUTES = new Set(["/"]);

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { reduced } = useMotionSafe();
  const { scrollY } = useScroll();

  const overHero = TRANSPARENT_ROUTES.has(pathname) && !scrolled && !open;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <motion.header
        initial={reduced ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          overHero
            ? "border-b border-transparent bg-transparent"
            : "border-b border-ink-100/90 bg-white/85 shadow-[0_1px_0_rgb(8_12_28/0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/70",
        )}
      >
        <div className="mx-auto flex h-17 w-full max-w-[80rem] items-center gap-4 px-5 sm:px-7 lg:h-19 lg:px-10">
          <Logo tone={overHero ? "light" : "dark"} />

          <nav aria-label="Primary" className="ml-6 hidden flex-1 lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200",
                        overHero
                          ? "text-white/75 hover:bg-white/10 hover:text-white"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-950",
                        active && (overHero ? "text-white" : "text-royal-700"),
                      )}
                    >
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className={cn(
                            "absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full",
                            overHero ? "bg-gold-300" : "bg-royal-600",
                          )}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <ButtonLink
              href="/track"
              variant="ghost"
              size="md"
              leadingIcon={<Search aria-hidden className="size-4" />}
              className={overHero ? "text-white/85 hover:bg-white/10 hover:text-white" : undefined}
            >
              Track
            </ButtonLink>
            <span aria-hidden className={cn("mx-1 h-5 w-px", overHero ? "bg-white/20" : "bg-ink-200")} />
            <AuthNavButtons tone={overHero ? "light" : "dark"} />
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "ml-auto grid size-11 place-items-center rounded-xl border transition-colors lg:hidden",
              overHero
                ? "border-white/20 bg-white/10 text-white"
                : "border-ink-200 bg-white text-ink-800 hover:bg-ink-50",
            )}
          >
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink-950/45 backdrop-blur-sm"
            />
            <motion.nav
              aria-label="Mobile"
              initial={reduced ? false : { y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: -16, opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE_OUT }}
              className="absolute inset-x-0 top-17 max-h-[calc(100dvh-4.25rem)] overflow-y-auto rounded-b-3xl border-b border-ink-100 bg-white p-5 shadow-lift"
            >
              <ul className="flex flex-col">
                {PRIMARY_NAV.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={reduced ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.045, duration: 0.3, ease: EASE_OUT }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center justify-between border-b border-ink-100 py-3.5 text-base font-semibold text-ink-800 last:border-0"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-2">
                <ButtonLink href="/track" variant="outline" size="lg" fullWidth onClick={() => setOpen(false)}>
                  Track a case
                </ButtonLink>
                <AuthNavButtons stacked onNavigate={() => setOpen(false)} />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
