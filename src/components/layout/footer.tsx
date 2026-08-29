import Link from "next/link";
import { Lock } from "lucide-react";
import { IconCode, IconNetwork, IconPlay, IconPost } from "@/components/brand/social-icons";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/primitives";
import { NewsletterForm } from "@/components/home/newsletter";
import { FOOTER_NAV, SITE } from "@/lib/site";

const SOCIALS = [
  { label: "RoyalRefund updates feed", href: "https://example.com/royalrefund", Icon: IconPost },
  { label: "RoyalRefund professional network page", href: "https://example.com/royalrefund", Icon: IconNetwork },
  { label: "RoyalRefund source repository", href: "https://example.com/royalrefund", Icon: IconCode },
  { label: "RoyalRefund product walkthroughs", href: "https://example.com/royalrefund", Icon: IconPlay },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-200">
      <div aria-hidden className="pointer-events-none absolute inset-0 aurora opacity-70" />
      <div aria-hidden className="pointer-events-none absolute inset-0 star-field opacity-45" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-royal-600/20 blur-[120px]"
      />

      <Container className="relative">
        <div className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:py-20">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-5 text-sm leading-relaxed text-ink-300">
              A secure platform for submitting refund and payment dispute cases, organising the
              evidence behind them and following every stage of the review in one place.
            </p>

            <div className="mt-7">
              <p className="text-sm font-semibold text-white">Stay updated</p>
              <p className="mt-1 text-sm text-ink-400">
                Occasional product notes. No case details are ever sent by email.
              </p>
              <NewsletterForm className="mt-4" tone="dark" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_NAV.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="text-xs font-bold tracking-[0.16em] text-white uppercase">
                  {column.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.heading}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="text-sm text-ink-400">
              &copy; 2019 {SITE.name}. All rights reserved.
            </p>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-300 ring-1 ring-white/10 ring-inset">
              <Lock aria-hidden className="size-3.5 text-mint-400" />
              We never ask for banking passwords, card PINs, OTPs or recovery phrases.
            </p>
          </div>

          <ul className="flex items-center gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  className="grid size-10 place-items-center rounded-xl bg-white/5 text-ink-300 ring-1 ring-white/10 ring-inset transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon aria-hidden className="size-4.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="pb-10 text-xs leading-relaxed text-ink-500">
          RoyalRefund manages refund and dispute cases. We are not a bank or a payment institution, we
          do not hold customer funds at any point, and submitting a case does not guarantee an outcome.
          Recovered amounts are returned by the paying party to the account they came from.
        </p>
      </Container>
    </footer>
  );
}
