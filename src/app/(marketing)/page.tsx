import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ProblemSection } from "@/components/home/problem";
import { SolutionSection } from "@/components/home/solution";
import { ProofSection } from "@/components/home/proof";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { InstantTransferSection } from "@/components/home/instant-transfer";
import { AppDownloadSection } from "@/components/home/app-download";
import { SecuritySection } from "@/components/home/security";
import { FaqSection } from "@/components/home/faq";
import { CtaSection } from "@/components/home/cta";
import { FAQS } from "@/lib/data/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, application-authored structured data.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <InstantTransferSection />
      <ProofSection />
      <SecuritySection />
      <FaqSection />
      <AppDownloadSection />
      <CtaSection />
    </>
  );
}
