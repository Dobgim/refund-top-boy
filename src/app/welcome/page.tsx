import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LayoutDashboard, MailCheck } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

type Search = Promise<{ pending?: string }>;

/**
 * Shown the moment an account is created.
 *
 * Two ways to arrive, because it depends on a Supabase setting we do not
 * control from here:
 *   - confirmation off: sign-up returns a live session, so the account is ready
 *   - confirmation on:  there is no session yet, and the visitor arrives with
 *     ?pending=1 straight from the form, then again via the emailed link
 *
 * Previously this page required a session, so with confirmation switched on
 * nobody ever saw it — they were sent to /login instead.
 */
export default async function WelcomePage({ searchParams }: { searchParams: Search }) {
  const { pending } = await searchParams;
  const profile = await getCurrentProfile();

  const awaitingConfirmation = !profile && pending === "1";

  // No session and no sign-up just completed: nothing to celebrate.
  if (isSupabaseConfigured && !profile && !awaitingConfirmation) redirect("/login");

  const firstName = (profile?.full_name ?? "").trim().split(/\s+/)[0];

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-white px-6 py-16">
      <Confetti />

      <div className="absolute top-6 left-6 sm:top-8 sm:left-10">
        <Logo />
      </div>

      <div className="relative w-full max-w-xl text-center">
        {awaitingConfirmation && (
          <span className="mx-auto mb-7 grid size-14 place-items-center rounded-2xl bg-mint-500/10 text-mint-600">
            <MailCheck aria-hidden className="size-7" />
          </span>
        )}

        <h1 className="text-balance-tight font-display text-[2.1rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink-950 sm:text-[2.6rem]">
          {firstName ? `Congratulations, ${firstName}!` : "Congratulations!"}{" "}
          {awaitingConfirmation
            ? "Your RoyalRefund account has been created."
            : "Your RoyalRefund account is ready."}
        </h1>

        {awaitingConfirmation ? (
          <>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-500">
              One last step: we have emailed a confirmation link to the address you just registered.
              Open it and your account is live — then you can file a claim, track it to resolution
              and manage the money it recovers.
            </p>

            <p className="mx-auto mt-6 max-w-md rounded-2xl border border-ink-100 bg-ink-50 px-4 py-3 text-sm text-ink-500">
              Nothing in your inbox after a few minutes? Check the spam folder, then sign in to have
              the link sent again.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/login" size="lg">
                Go to sign in
              </ButtonLink>
              <ButtonLink href="/" size="lg" variant="outline">
                Back to the site
              </ButtonLink>
            </div>
          </>
        ) : (
          <>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-500">
              Verify your identity once and you can file a claim, track it to resolution, and manage
              the money it recovers — all from one account.
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
          </>
        )}
      </div>
    </main>
  );
}
