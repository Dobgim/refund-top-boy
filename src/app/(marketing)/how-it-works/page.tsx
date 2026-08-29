import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { TransferFlowSection } from "@/components/home/transfer-flow";
import { CtaSection } from "@/components/home/cta";
import { Card, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { ButtonLink } from "@/components/ui/button";
import { CLAIM_STATUSES, CLAIM_STATUS_META } from "@/lib/claims";
import { StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The six stages of a RoyalRefund case, what each status means, and what happens between submission and resolution.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From a disputed line on a statement to a decision you can read"
        description="Every case follows the same path. You always know which stage you are at, who is holding it, and what needs to happen next."
      >
        <ButtonLink href="/register" size="lg" trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}>
          Start a claim
        </ButtonLink>
      </PageHero>

      <HowItWorksSection withHeading={false} />

      <Section tone="muted">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Statuses"
              title="What each status actually means"
              description="No vague progress bars. Six named states, each with a clear condition for leaving it."
            />
          </Reveal>

          <RevealGroup stagger={0.08} className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {CLAIM_STATUSES.map((status) => (
              <RevealItem key={status} preset="fadeUp">
                <Card className="h-full p-5">
                  <StatusBadge status={status} />
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    {CLAIM_STATUS_META[status].description}
                  </p>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <TransferFlowSection />
      <CtaSection />
    </>
  );
}
