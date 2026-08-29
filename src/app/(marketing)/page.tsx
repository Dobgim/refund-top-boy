import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { PartnersSection } from "@/components/home/partners";
import { ServicesSection } from "@/components/home/services";
import { RecoveryControlSection } from "@/components/home/recovery-control";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { MobileShowcaseSection } from "@/components/home/mobile-showcase";
import { InstantTransferSection } from "@/components/home/instant-transfer";
import { AppDownloadSection } from "@/components/home/app-download";
import { SecuritySection } from "@/components/home/security";
import { TestimonialsSection } from "@/components/home/testimonials";
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
      <PartnersSection />
      <ServicesSection />
      <RecoveryControlSection />
      <HowItWorksSection />
      <MobileShowcaseSection />
      <AppDownloadSection />
      <InstantTransferSection />
      <SecuritySection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
