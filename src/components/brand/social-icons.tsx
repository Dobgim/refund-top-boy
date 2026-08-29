import type { SVGProps } from "react";

/**
 * lucide-react dropped brand glyphs, so the footer ships its own minimal set.
 * These are simple geometric marks, not reproductions of any company logo.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconPost(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4h4l5 7 5-7h2l-6 8.4L21 20h-4l-5.2-7.3L6.4 20H4l6.6-9.2z" />
    </svg>
  );
}

export function IconNetwork(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M8 10.5V16M8 7.6v.1M12 16v-3.2a2 2 0 0 1 4 0V16" />
    </svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 17-5-5 5-5M15 7l5 5-5 5M13.5 4.5l-3 15" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.8 4.6 2.7-4.6 2.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}
