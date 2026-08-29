import type { Metadata } from "next";
import Link from "next/link";
import { Clock, LifeBuoy, Mail, Radar, ShieldAlert } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/forms/contact-form";
import { Card, Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the RoyalRefund support team with a question about a case or the platform.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    icon: Mail,
    title: "Support inbox",
    body: SITE.supportEmail,
    href: `mailto:${SITE.supportEmail}`,
  },
  {
    icon: Radar,
    title: "Check a case first",
    body: "Most questions are answered by the case tracker.",
    href: "/track",
  },
  {
    icon: LifeBuoy,
    title: "Help center",
    body: "Submitting, tracking, documents and timings.",
    href: "/faq",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a person about your case"
        description="Include your claim reference if you have one — it saves a round trip and lets us look at the exact case you mean."
      />

      <Section tone="muted">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-14">
            <div className="space-y-5">
              <Reveal preset="fadeRight">
                <div className="space-y-3">
                  {CHANNELS.map((channel) => (
                    <Link
                      key={channel.title}
                      href={channel.href}
                      className="flex items-start gap-4 rounded-card border border-ink-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal-600 ring-1 ring-royal-100 ring-inset">
                        <channel.icon aria-hidden className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-ink-950">{channel.title}</span>
                        <span className="mt-0.5 block text-sm break-words text-ink-500">
                          {channel.body}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </Reveal>

              <Reveal preset="fadeUp" delay={0.1}>
                <Card className="p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    <ShieldAlert aria-hidden className="size-5" />
                  </span>
                  <p className="mt-4 font-bold text-ink-950">Suspect a scam?</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    RoyalRefund never requests a banking password, card PIN, one-time code, seed phrase
                    or private key. Anyone who does is not us. Report it and do not respond.
                  </p>
                </Card>
              </Reveal>

              <Reveal preset="fadeUp" delay={0.15}>
                <Card className="flex items-start gap-3 p-5">
                  <Clock aria-hidden className="mt-0.5 size-4.5 shrink-0 text-ink-300" />
                  <p className="text-sm leading-relaxed text-ink-500">
                    We aim to send a first reply within two working days. Case-specific
                    questions are answered on the case itself, so the history stays in one place.
                  </p>
                </Card>
              </Reveal>
            </div>

            <Reveal preset="fadeLeft">
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
