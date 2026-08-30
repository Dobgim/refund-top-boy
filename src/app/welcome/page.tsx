import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, FileCheck2, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

const NEXT_STEPS = [
  {
    icon: FileCheck2,
    title: "Verify your identity",
    body: "One document, checked once. It confirms the person filing a case is the person the money belongs to.",
  },
  {
    icon: ShieldCheck,
    title: "Submit your first case",
    body: "The guided form captures everything a reviewer needs, so nothing comes back for a second pass.",
  },
];

export default async function WelcomePage() {
  const profile = await getCurrentProfile();
  if (isSupabaseConfigured && !profile) redirect("/login");

  const firstName = (profile?.full_name ?? "").trim().split(/\s+/)[0];

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-white px-6 py-16">
      <Confetti />

      <div className="absolute top-6 left-6 sm:top-8 sm:left-10">
        <Logo />
      </div>

      <div className="relative w-full max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-mint-500/10 px-3.5 py-1.5 text-xs font-bold tracking-[0.14em] text-mint-700 uppercase ring-1 ring-mint-500/25 ring-inset">
          <ShieldCheck aria-hidden className="size-3.5" />
          Account created
        </span>

        <h1 className="text-balance-tight mt-7 font-display text-[2.4rem] leading-[1.08] font-extrabold tracking-[-0.03em] text-ink-950 sm:text-5xl lg:text-[3.4rem]">
          {firstName ? `Welcome, ${firstName}.` : "Welcome."}
          <br className="hidden sm:block" /> Your case portal is ready.
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink-500 sm:text-lg">
          Everything about a refund case now lives in one place: the evidence you upload, the
          questions a reviewer asks, and the exact stage it is at.
        </p>

        <ul className="mx-auto mt-10 grid gap-4 text-left sm:grid-cols-2">
          {NEXT_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-card border border-ink-100 bg-white p-5 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal-600 ring-1 ring-royal-100 ring-inset">
                  <step.icon aria-hidden className="size-4.5" />
                </span>
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-ink-300">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-3.5 font-bold text-ink-950">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="/dashboard/verification"
            size="lg"
            trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}
          >
            Verify my identity
          </ButtonLink>
          <ButtonLink
            href="/dashboard"
            size="lg"
            variant="outline"
            leadingIcon={<LayoutDashboard aria-hidden className="size-4.5" />}
          >
            Go to Dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
