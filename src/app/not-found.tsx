import Link from "next/link";
import { Compass, Radar, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const SUGGESTIONS = [
  { label: "Track a case", href: "/track", icon: Radar },
  { label: "How it works", href: "/how-it-works", icon: Compass },
  { label: "Help center", href: "/faq", icon: Search },
];

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-950 px-6 py-20 text-white">
      <div aria-hidden className="pointer-events-none fixed inset-0 aurora" />
      <div aria-hidden className="pointer-events-none fixed inset-0 star-field opacity-60" />
      <div className="relative w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo tone="light" />
        </div>
        <p className="mt-12 font-display text-[5rem] leading-none font-extrabold tracking-tight text-white/12 sm:text-[7rem]">
          404
        </p>
        <h1 className="-mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          That page does not exist
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-300">
          The link may be out of date, or the case reference may belong to an account you are not signed
          in to. These are the places people usually want.
        </p>

        <ul className="mt-9 grid gap-3 sm:grid-cols-3">
          {SUGGESTIONS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 text-sm font-semibold text-ink-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <item.icon aria-hidden className="size-5 text-royal-300" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-ink-950 transition-colors hover:bg-gold-300"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
