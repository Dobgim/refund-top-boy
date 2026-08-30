import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { FaqAccordion } from "@/components/home/faq";
import { CtaSection } from "@/components/home/cta";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { FAQS } from "@/lib/data/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help center",
  description:
    "Answers about submitting a refund case, tracking its progress, document security and review timings.",
  alternates: { canonical: "/faq" },
};

const SECURITY_FAQS = [
  {
    question: "Will RoyalRefund ever ask for my banking password or card PIN?",
    answer:
      "No. Not by email, not on a call, and not on any page of this site. The platform has no use for those credentials and no field that accepts them. If you ever see such a request claiming to be from us, do not enter anything and report it.",
  },
  {
    question: "Who can see the documents I upload?",
    answer:
      "Your own account and an authorised reviewer. Files go into a private storage bucket partitioned by user id, and every read is checked against a storage policy. Nothing is served from a public URL.",
  },
  {
    question: "Can I delete my account and my case data?",
    answer:
      "Yes. Contact support from the address on your account and the profile, its cases, documents and messages are removed. Anonymised counts may remain in aggregate statistics.",
  },
  {
    question: "Where does a recovered amount go?",
    answer:
      "Into your RoyalRefund account. Every approved case credits your balance directly, with the amount, the route it took and the rate used all shown on the case. From there you can transfer it, pay a bill with it, save it, or withdraw it to your own bank, mobile money or wallet.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...FAQS, ...SECURITY_FAQS].map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="Help center"
        title="Questions, answered plainly"
        description={`Everything people usually want to know before submitting a case. If yours is not here, ${SITE.supportEmail} reaches a human.`}
      />

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading
              align="left"
              title="Using the platform"
              description="Submitting, tracking and closing a case."
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <FaqAccordion />
          </Reveal>

          <Reveal className="mt-16">
            <SectionHeading
              align="left"
              title="Security and privacy"
              description="What we ask for, what we store, and what we will never do."
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <FaqAccordion items={SECURITY_FAQS} />
          </Reveal>
        </Container>
      </Section>

      <CtaSection />
    </>
  );
}
