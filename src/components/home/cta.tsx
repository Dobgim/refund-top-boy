import { ArrowRight, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { NewsletterForm } from "@/components/home/newsletter";

export function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-20 sm:py-24">
      <Container>
        <Reveal preset="scaleIn">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-14 text-center text-white sm:px-12 sm:py-18">
            <div aria-hidden className="pointer-events-none absolute inset-0 aurora" />
            <div aria-hidden className="pointer-events-none absolute inset-0 star-field opacity-55" />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-royal-600/30 blur-[110px]"
            />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance-tight font-display text-3xl leading-[1.12] font-extrabold tracking-tight sm:text-4xl lg:text-[2.7rem]">
                Start the case you have been putting off
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-200 sm:text-lg">
                Creating an account takes a minute. Submitting a case takes about ten, and you can save
                and come back to it. No banking passwords, no PINs, no recovery phrases.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink
                  href="/register"
                  size="lg"
                  variant="gold"
                  trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}
                >
                  Create your account
                </ButtonLink>
                <ButtonLink
                  href="/track"
                  size="lg"
                  variant="ghost"
                  leadingIcon={<Search aria-hidden className="size-4.5" />}
                  className="border border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"
                >
                  Track an existing case
                </ButtonLink>
              </div>

              <div className="mx-auto mt-12 max-w-md border-t border-white/10 pt-8">
                <p className="text-sm font-bold text-white">Stay Updated</p>
                <p className="mt-1 text-sm text-ink-300">
                  Product notes and changes to the case workflow. Unsubscribe anytime.
                </p>
                <NewsletterForm className="mt-4 text-left" tone="dark" />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
