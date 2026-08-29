export const SITE = {
  name: "RoyalRefund",
  tagline: "Secure Refund & Financial Recovery Platform",
  description:
    "RoyalRefund is a secure platform for submitting refund and payment dispute cases, uploading supporting evidence and following every stage of the review from one portal.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supportEmail: "support@royalrefund.example",
  locale: "en_US",
} as const;

export const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_NAV = [
  {
    heading: "Platform",
    links: [
      { label: "Home", href: "/" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Services", href: "/services" },
      { label: "Case Tracking", href: "/track" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Refund Policy", href: "/legal/refund-policy" },
      { label: "Cookie Policy", href: "/legal/cookies" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/faq" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
] as const;
