import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

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

      <div className="relative w-full max-w-xl text-center">
        <h1 className="text-balance-tight font-display text-[2.1rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink-950 sm:text-[2.6rem]">
          {firstName ? `Congratulations, ${firstName}!` : "Congratulations!"} Your RoyalRefund
          account is ready.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-500">
          Verify your identity once and you can file a claim, track it to resolution, and manage the
          money it recovers — all from one account.
        </p>

        <div className="mt-9 flex justify-center">
          <ButtonLink
            href="/dashboard"
            size="lg"
            leadingIcon={<LayoutDashboard aria-hidden className="size-4.5" />}
          >
            Go to Dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
