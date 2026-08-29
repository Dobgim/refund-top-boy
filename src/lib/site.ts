/**
 * Resolves the canonical site URL, and guarantees the result parses as a URL.
 *
 * `new URL()` is called at module scope by the root layout's `metadataBase`, so
 * anything unparseable here takes the entire build down with "Invalid URL"
 * before Next renders a single page. A plain `??` is not enough: an env var set
 * to an empty string is defined, and a value pasted without a scheme
 * ("example.vercel.app") is defined but invalid.
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL          explicit, wins when usable
 *   2. VERCEL_PROJECT_PRODUCTION_URL the stable production domain
 *   3. VERCEL_URL                    this specific deployment
 *   4. http://localhost:3000         local development
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const raw = candidate?.trim();
    if (!raw) continue;

    // Vercel exposes bare hostnames; anything without a scheme gets https.
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    try {
      const url = new URL(withScheme);
      if (!url.hostname) continue;
      // Normalise: origin only, no trailing slash, so joins stay predictable.
      return url.origin;
    } catch {
      // Unusable value — fall through to the next candidate rather than crash.
    }
  }

  return "http://localhost:3000";
}

export const SITE = {
  name: "RoyalRefund",
  tagline: "Secure Refund & Financial Recovery Platform",
  description:
    "RoyalRefund is a secure platform for submitting refund and payment dispute cases, uploading supporting evidence and following every stage of the review from one portal.",
  url: resolveSiteUrl(),
  supportEmail: "support@royalrefund.example",
  locale: "en_US",
} as const;

/**
 * The origin to build auth redirect links from.
 *
 * In the browser this is always the real origin the user is on, which keeps
 * confirmation and password-reset links correct on production, on preview
 * deployments, and on localhost without any configuration. Only NEXT_PUBLIC_*
 * variables reach client bundles, so relying on SITE.url alone would silently
 * send production users to localhost.
 */
export function appOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return SITE.url;
}

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
