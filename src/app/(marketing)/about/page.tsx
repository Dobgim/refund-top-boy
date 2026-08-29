import type { Metadata } from "next";
import { Compass, Eye, HeartHandshake, Scale } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { SecuritySection } from "@/components/home/security";
import { CtaSection } from "@/components/home/cta";
import { Card, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem, Counter } from "@/components/ui/motion";
import { STATS } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why RoyalRefund exists, the principles behind the case workflow, and a plain account of what the platform does and does not do.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    icon: Eye,
    title: "Say where the case actually is",
    body: "A status is only useful if it means something specific. Every state in this platform has a definition and an exit condition, and both are published.",
  },
  {
    icon: Scale,
    title: "Ask for less",
    body: "A refund case needs a transaction, a story and evidence. It does not need a banking password or a card PIN, so no field on this platform accepts one.",
  },
  {
    icon: HeartHandshake,
    title: "One shared record",
    body: "You and the reviewer read from the same case history. Nothing decisive happens in an inbox neither of you can search later.",
  },
  {
    icon: Compass,
    title: "Honest about limits",
    body: "We manage the case, not the money. RoyalRefund is not a bank and never holds your funds; what we control is that your case arrives complete, evidenced and legible.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built around the part of a refund that usually goes wrong"
        description="Most refund disputes do not fail on the merits. They fail because the evidence is scattered, the status is unknowable and nobody can say who is holding it. That is the problem this platform is shaped around."
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal preset="fadeRight">
              <SectionHeading
                align="left"
                eyebrow="Why it exists"
                title="A case is a record, not a conversation"
                description="An email thread is a terrible container for a dispute. It has no status, no structure, and no way to prove what was sent when."
              />
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600">
                <p>
                  RoyalRefund models a refund case the way an operations team would want it: a single
                  row with an owner, a stage, a timestamped history, a document set and a message
                  thread attached to it. Every change writes an entry. Nothing moves silently.
                </p>
                <p>
                  The result is unglamorous and deliberately so. There is no scoring engine promising
                  odds of success and no dashboard implying progress that has not happened. What the
                  platform offers is a case that is complete when it reaches a reviewer, and legible to
                  you at every point after that.
                </p>
                <p>
                  The platform covers that workflow end to end: registration, submission, evidence
                  upload, review, status change, resolution and public tracking, with the access
                  controls each of those steps requires.
                </p>
              </div>
            </Reveal>

            <Reveal preset="fadeLeft">
              <div className="grid gap-4 sm:grid-cols-2">
                {STATS.map((stat) => (
                  <Card key={stat.label} className="p-5">
                    <p className="font-display text-3xl font-extrabold tracking-tight text-ink-950">
                      <Counter
                        value={stat.value}
                        decimals={"decimals" in stat ? stat.decimals : 0}
                        prefix={"prefix" in stat ? stat.prefix : ""}
                        suffix={stat.suffix}
                      />
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink-700">{stat.label}</p>
                    <p className="mt-1 text-xs text-ink-400">{stat.hint}</p>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Principles"
              title="Four rules the product is held to"
              description="They are the reason certain conveniences are missing and certain frictions are deliberate."
            />
          </Reveal>

          <RevealGroup stagger={0.1} className="mt-12 grid gap-5 md:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <RevealItem key={principle.title} preset="fadeUp">
                <Card className="h-full p-6">
                  <span className="grid size-12 place-items-center rounded-2xl bg-ink-950 text-gold-300">
                    <principle.icon aria-hidden className="size-5.5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink-950">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{principle.body}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <SecuritySection />
      <CtaSection />
    </>
  );
}
