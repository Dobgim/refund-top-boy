import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Card, Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { Logo, LogoMark, Wordmark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Brand guidelines",
  description: "The RoyalRefund mark, colour system, typography and usage rules.",
  alternates: { canonical: "/brand" },
};

const PALETTE = [
  { name: "Ink 950", value: "#080c1c", role: "Primary surface for dark sections and the footer", className: "bg-ink-950" },
  { name: "Ink 500", value: "#465684", role: "Body copy on light surfaces", className: "bg-ink-500" },
  { name: "Royal 600", value: "#4f46e5", role: "Primary action, links, active navigation", className: "bg-royal-600" },
  { name: "Royal 50", value: "#eef2ff", role: "Tinted panels and icon wells", className: "bg-royal-50" },
  { name: "Gold 400", value: "#f2c866", role: "Accent for emphasis and highlighted figures", className: "bg-gold-400" },
  { name: "Mint 500", value: "#14b98a", role: "Success, verification, resolved states", className: "bg-mint-500" },
];

const RULES = {
  do: [
    "Keep clear space around the mark equal to the height of its plinth.",
    "Use the full lockup at 24px height or larger; below that use the mark alone.",
    "Place the light wordmark only on Ink 800 or darker.",
    "Pair Royal 600 with white text; pair Gold 400 with Ink 950 text.",
  ],
  dont: [
    "Recolour the mark outside the palette or apply a drop shadow to it.",
    "Stretch, rotate or outline the wordmark, or set it in another typeface.",
    "Place the dark wordmark on a saturated Royal or Gold field.",
    "Use gold as a large background fill; it is an accent, not a surface.",
  ],
};

export default function BrandPage() {
  return (
    <>
      <PageHero
        eyebrow="Brand"
        title="RoyalRefund brand guidelines"
        description="A classical bank facade: pediment, three columns and a gold plinth. It is the one piece of iconography read as a bank almost everywhere, which is what the mark has to say at 16px in a browser tab."
      />

      <Section>
        <Container>
          <Reveal>
            <SectionHeading align="left" title="Logo" description="Vector only. The mark is drawn in code, never rasterised." />
          </Reveal>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card className="flex flex-col items-center justify-center gap-4 p-10">
              <LogoMark className="size-20" />
              <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">App icon</p>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-4 p-10">
              <Logo href={null} />
              <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Primary lockup</p>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-4 bg-ink-950 p-10">
              <Logo href={null} tone="light" />
              <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">Reversed lockup</p>
            </Card>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Card className="flex items-center justify-center p-10">
              <Wordmark />
            </Card>
            <Card className="flex items-center justify-center bg-ink-950 p-10">
              <Wordmark tone="light" />
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <Reveal>
            <SectionHeading
              align="left"
              title="Colour"
              description="A deep navy ground, one royal indigo action colour, and two accents used sparingly."
            />
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTE.map((swatch) => (
              <Card key={swatch.name} className="overflow-hidden">
                <div className={`h-24 ${swatch.className}`} />
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-bold text-ink-950">{swatch.name}</p>
                    <p className="font-mono text-xs text-ink-400 uppercase">{swatch.value}</p>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-500">{swatch.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal>
                <SectionHeading
                  align="left"
                  title="Typography"
                  description="Plus Jakarta Sans throughout, with JetBrains Mono reserved for references and amounts."
                />
              </Reveal>
              <Card className="mt-8 divide-y divide-ink-100">
                <div className="p-6">
                  <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Display · 800</p>
                  <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-950">
                    Recover What Belongs To You
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Body · 400</p>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">
                    Submit a legitimate refund or payment dispute and follow the review from triage to
                    resolution.
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">Mono · 700</p>
                  <p className="mt-2 font-mono text-lg font-bold text-ink-950">RR-2019-0118</p>
                </div>
              </Card>
            </div>

            <div>
              <Reveal>
                <SectionHeading align="left" title="Usage" description="Four rules each way." />
              </Reveal>
              <div className="mt-8 space-y-4">
                <Card className="p-6">
                  <p className="text-sm font-bold text-mint-600">Do</p>
                  <ul className="mt-3 space-y-2">
                    {RULES.do.map((rule) => (
                      <li key={rule} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-mint-500" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-6">
                  <p className="text-sm font-bold text-rose-600">Do not</p>
                  <ul className="mt-3 space-y-2">
                    {RULES.dont.map((rule) => (
                      <li key={rule} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
