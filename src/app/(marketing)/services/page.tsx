import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FileText, Receipt, ShieldQuestion } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ServicesSection } from "@/components/home/services";
import { CtaSection } from "@/components/home/cta";
import { Card, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { ButtonLink } from "@/components/ui/button";
import { CLAIM_TYPE_LABELS, CLAIM_TYPES } from "@/lib/claims";

export const metadata: Metadata = {
  title: "Services",
  description:
    "What RoyalRefund handles: refund claims, transaction review, secure document submission and end-to-end case tracking.",
  alternates: { canonical: "/services" },
};

const PREPARE = [
  {
    icon: Receipt,
    title: "The statement line",
    body: "The date, amount, currency and the merchant descriptor exactly as it appears on your statement.",
  },
  {
    icon: FileText,
    title: "Proof of the agreement",
    body: "An order confirmation, invoice, contract or booking reference showing what you were meant to receive.",
  },
  {
    icon: ShieldQuestion,
    title: "What you have already tried",
    body: "Emails or chat transcripts with the merchant or bank, and any reference they gave you.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything a refund case needs, in one place"
        description="RoyalRefund is not a magic recovery service. It is the workflow that turns a scattered complaint into an evidenced case a reviewer can actually decide on."
      >
        <ButtonLink href="/register" size="lg" trailingIcon={<ArrowRight aria-hidden className="size-4.5" />}>
          Create an account
        </ButtonLink>
      </PageHero>

      <ServicesSection />

      <Section tone="muted">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Case types"
              title="The cases this platform is designed for"
              description="If your situation does not fit one of these, choose Other and describe it. A reviewer will tell you whether it can be progressed."
            />
          </Reveal>

          <RevealGroup stagger={0.06} className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
            {CLAIM_TYPES.map((type) => (
              <RevealItem key={type} preset="scaleIn">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-soft">
                  <CheckCircle2 aria-hidden className="size-4 text-mint-500" />
                  {CLAIM_TYPE_LABELS[type]}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Preparation"
              title="What to have ready before you start"
              description="Cases stall for one reason more than any other: missing evidence. Ten minutes of preparation usually saves a week of back and forth."
            />
          </Reveal>

          <RevealGroup stagger={0.1} className="mt-12 grid gap-5 md:grid-cols-3">
            {PREPARE.map((item) => (
              <RevealItem key={item.title} preset="fadeUp">
                <Card className="h-full p-6">
                  <span className="grid size-12 place-items-center rounded-2xl bg-royal-50 text-royal-600 ring-1 ring-royal-100 ring-inset">
                    <item.icon aria-hidden className="size-5.5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.body}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
