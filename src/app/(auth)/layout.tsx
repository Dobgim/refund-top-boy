import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const ASSURANCES = [
  "We never ask for a banking password, card PIN, OTP, seed phrase or private key.",
  "Your cases and documents are readable only by your account and an authorised reviewer.",
  "You can export or close a case at any point.",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-0 aurora" />
        <div aria-hidden className="pointer-events-none absolute inset-0 star-field opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 size-[34rem] rounded-full bg-royal-600/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -bottom-32 size-[28rem] rounded-full bg-mint-500/12 blur-[120px]"
        />

        <div className="relative">
          <Logo tone="light" />
        </div>

        <div className="relative mt-auto max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-ink-200">
            <ShieldCheck aria-hidden className="size-3.5 text-mint-400" />
            Secure case portal
          </span>
          <h2 className="text-balance-tight mt-6 font-display text-[2.4rem] leading-[1.08] font-extrabold tracking-tight">
            One record. Every stage. No guesswork.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-300">
            Your account is the single place your refund case lives: the evidence you uploaded, the
            questions a reviewer asked, and the exact stage it is at right now.
          </p>

          <ul className="mt-8 space-y-3.5">
            {ASSURANCES.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-ink-200">
                <CheckCircle2 aria-hidden className="mt-0.5 size-4.5 shrink-0 text-mint-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 text-xs text-ink-500">
          RoyalRefund manages refund and dispute cases. We are not a bank and never hold your funds.
        </p>
      </aside>

      {/* form panel */}
      <main id="main" className="flex flex-col bg-white">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to site
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
