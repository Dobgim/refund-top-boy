import Link from "next/link";
import { FileText } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Alert, Container, Section } from "@/components/ui/primitives";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

const LEGAL_NAV = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
  { label: "Cookie Policy", href: "/legal/cookies" },
];

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={intro} />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
            <nav aria-label="Legal documents" className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-bold tracking-[0.16em] text-ink-400 uppercase">Documents</p>
              <ul className="mt-4 space-y-1">
                {LEGAL_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
                    >
                      <FileText aria-hidden className="size-4 text-ink-300" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 px-3 text-xs text-ink-400">Last updated {updated}</p>
            </nav>

            <div className="min-w-0 max-w-2xl">
              <Alert tone="info" title="Plain-language summary" className="mb-10">
                This page describes how the platform actually behaves, in ordinary language. It is a
                summary of our practice rather than legal advice.
              </Alert>

              <div className="space-y-10">
                {sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-display text-xl font-bold tracking-tight text-ink-950">
                      {section.heading}
                    </h2>
                    <div className="mt-3 space-y-3">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-relaxed text-ink-600">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets && (
                      <ul className="mt-4 space-y-2">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-royal-400" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
