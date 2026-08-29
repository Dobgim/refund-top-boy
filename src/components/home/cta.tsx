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
          <div className="relative overflow-hidden rounded-[2rem] border border-ink-100 bg-white px-6 py-14 text-center text-ink-900 shadow-lift sm:px-12 sm:py-18">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-royal-600/6 blur-[110px]"
            />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance-tight font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-ink-950 sm:text-4xl lg:text-[2.7rem]">
                Start the case you have been putting off
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
                Creating an account takes a minute. Submitting a case takes about ten, and you can save
                and come back to it. No banking passwords, no PINs, no recovery phrases.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink
                  href="/register"
                  size="lg"
                  trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}
                >
                  Create your account
                </ButtonLink>
                <ButtonLink
                  href="/track"
                  size="lg"
                  variant="outline"
                  leadingIcon={<Search aria-hidden className="size-4.5" />}
                >
                  Track an existing case
                </ButtonLink>
              </div>

              <div className="mx-auto mt-12 max-w-md border-t border-ink-100 pt-8">
                <p className="text-sm font-bold text-ink-950">Stay Updated</p>
                <p className="mt-1 text-sm text-ink-500">
                  Product notes and changes to the case workflow. Unsubscribe anytime.
                </p>
                <NewsletterForm className="mt-4 text-left" />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
