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
    <div className="grid min-h-dvh place-items-center bg-white px-6 py-20 text-ink-900">
      <div className="relative w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-12 font-display text-[5rem] leading-none font-extrabold tracking-tight text-ink-100 sm:text-[7rem]">
          404
        </p>
        <h1 className="-mt-6 font-display text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
          That page does not exist
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          The link may be out of date, or the case reference may belong to an account you are not signed
          in to. These are the places people usually want.
        </p>

        <ul className="mt-9 grid gap-3 sm:grid-cols-3">
          {SUGGESTIONS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white px-4 py-5 text-sm font-semibold text-ink-700 shadow-soft transition-colors hover:border-royal-200 hover:bg-royal-50 hover:text-royal-700"
              >
                <item.icon aria-hidden className="size-5 text-royal-600" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-royal-600 px-6 text-sm font-bold text-white transition-colors hover:bg-royal-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
