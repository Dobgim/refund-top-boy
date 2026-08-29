import type { SVGProps } from "react";

/**
 * Original wordmarks for illustrative partner institutions.
 *
 * These are invented names with marks drawn from scratch. Nothing here
 * reproduces the branding of, or claims a relationship with, any real bank.
 */

type MarkProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  "aria-hidden": true,
  className: "size-7 shrink-0",
};

function MarkNordvale(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 24V8l10 9 10-9v16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MarkMeridian(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 6c4 4 4 16 0 20M16 6c-4 4-4 16 0 20M6.5 13h19M6.5 19h19" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MarkLumiere(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16 5l3.2 7.8L27 16l-7.8 3.2L16 27l-3.2-7.8L5 16l7.8-3.2z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
    </svg>
  );
}

function MarkSterling(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="6" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 20h8M13 20v-6a3 3 0 0 1 6 0M11 16h7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function MarkAdriatic(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 21c3.5 0 3.5-3 7-3s3.5 3 7 3 3.5-3 7-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 14c3.5 0 3.5-3 7-3s3.5 3 7 3 3.5-3 7-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

function MarkHanseatic(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13 16 6l12 7" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M8 15v8M14 15v8M18 15v8M24 15v8M5 26h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MarkIberia(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 9.5v13M11 13.5h10M11 18.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MarkAlpen(props: MarkProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 25 12 9l5 9 3-5 8 12z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

export interface PartnerBank {
  name: string;
  Mark: (props: MarkProps) => React.JSX.Element;
}

export const PARTNER_BANKS: PartnerBank[] = [
  { name: "Nordvale Bank", Mark: MarkNordvale },
  { name: "Meridian Trust", Mark: MarkMeridian },
  { name: "Banque Lumière", Mark: MarkLumiere },
  { name: "Sterling & Vale", Mark: MarkSterling },
  { name: "Adriatic Union", Mark: MarkAdriatic },
  { name: "Hanseatic Kredit", Mark: MarkHanseatic },
  { name: "Iberia Mutual", Mark: MarkIberia },
  { name: "Alpenbank", Mark: MarkAlpen },
];
