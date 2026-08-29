"use client";

import { Inbox, Clock, FileQuestion, PhoneOff } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";

const FAILURES = [
  {
    icon: Inbox,
    title: "The evidence is scattered",
    body: "A receipt in one inbox, a chat transcript in another, the statement line in a banking app. By the time anyone reviews it, half of it is missing.",
  },
  {
    icon: FileQuestion,
    title: "Nobody can say what stage it is at",
    body: "“We are looking into it” is not a status. Without a named stage and an owner, a case can sit untouched for weeks and look identical to one being worked on.",
  },
  {
    icon: Clock,
    title: "Deadlines pass quietly",
    body: "Most dispute windows are measured in days. A case that stalls in an inbox often expires before anyone notices it needed a reply.",
  },
  {
    icon: PhoneOff,
    title: "You chase, they forget",
    body: "Each call starts from scratch with someone new. Nothing you said last time is written down anywhere you can point to.",
  },
];

export function ProblemSection() {
  return (
    <Section tone="muted">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title="Refund disputes rarely fail on the merits"
            description="They fail on the paperwork. Four things go wrong again and again, and none of them are about whether you were owed the money."
          />
        </Reveal>

        <RevealGroup stagger={0.08} className="mt-14 grid gap-4 sm:grid-cols-2">
          {FAILURES.map((item) => (
            <RevealItem key={item.title} preset="fadeUp">
              <div className="flex h-full gap-4 rounded-card border border-ink-100 bg-white p-6 shadow-soft">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 ring-inset">
                  <item.icon aria-hidden className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold tracking-tight text-ink-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.body}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
