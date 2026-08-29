import type { ComponentProps, ElementType, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLAIM_STATUS_META } from "@/lib/claims";
import type { ClaimStatus } from "@/types";

/* ------------------------------------------------------------------ layout */

export function Container({
  className,
  size = "default",
  children,
}: {
  className?: string;
  size?: "default" | "wide" | "narrow";
  children: ReactNode;
}) {
  const width = {
    narrow: "max-w-3xl",
    default: "max-w-[80rem]",
    wide: "max-w-[90rem]",
  }[size];
  return <div className={cn("mx-auto w-full px-5 sm:px-7 lg:px-10", width, className)}>{children}</div>;
}

export function Section({
  className,
  id,
  tone = "light",
  children,
}: {
  className?: string;
  id?: string;
  tone?: "light" | "muted" | "dark";
  children: ReactNode;
}) {
  const tones = {
    light: "bg-white text-ink-900",
    muted: "bg-[var(--page-muted)] text-ink-900",
    dark: "bg-ink-950 text-white",
  };
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 py-20 sm:py-24 lg:py-28", tones[tone], className)}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------- eyebrow */

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase",
        tone === "dark"
          ? "border-white/15 bg-white/5 text-royal-200"
          : "border-royal-100 bg-royal-50 text-royal-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ headings */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  as?: ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Heading
        className={cn(
          "text-balance-tight font-display text-3xl leading-[1.12] font-extrabold tracking-tight sm:text-4xl lg:text-[2.7rem]",
          tone === "dark" ? "text-white" : "text-ink-950",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className={cn("max-w-2xl text-base leading-relaxed sm:text-lg", tone === "dark" ? "text-ink-200" : "text-ink-500")}>
          {description}
        </p>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- card */

export function Card({
  className,
  hoverable,
  children,
  ...props
}: ComponentProps<"div"> & { hoverable?: boolean }) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-card border border-ink-100 bg-white shadow-soft",
        hoverable && "transition-shadow duration-300 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------- badge */

const BADGE_TONES = {
  neutral: "bg-ink-100 text-ink-700 ring-ink-200",
  info: "bg-royal-50 text-royal-700 ring-royal-200",
  warn: "bg-amber-50 text-amber-800 ring-amber-200",
  good: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  done: "bg-ink-950 text-white ring-ink-950",
  gold: "bg-gold-400/15 text-gold-600 ring-gold-400/40",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: ClaimStatus; className?: string }) {
  const meta = CLAIM_STATUS_META[status];
  return (
    <Badge tone={meta.tone} className={className}>
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </Badge>
  );
}

/* -------------------------------------------------------------------- alert */

const ALERT_TONES = {
  info: { wrap: "border-royal-200 bg-royal-50 text-royal-900", Icon: Info },
  success: { wrap: "border-emerald-200 bg-emerald-50 text-emerald-900", Icon: CheckCircle2 },
  warning: { wrap: "border-amber-200 bg-amber-50 text-amber-900", Icon: AlertTriangle },
  error: { wrap: "border-rose-200 bg-rose-50 text-rose-900", Icon: XCircle },
} as const;

export function Alert({
  tone = "info",
  title,
  className,
  children,
}: {
  tone?: keyof typeof ALERT_TONES;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { wrap, Icon } = ALERT_TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm", wrap, className)}
    >
      <Icon aria-hidden className="mt-0.5 size-4.5 shrink-0" />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- state */

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <Loader2 aria-hidden className={cn("size-5 animate-spin text-royal-600", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ink-200 bg-ink-50/60 px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <div className="grid size-12 place-items-center rounded-2xl bg-white text-royal-600 shadow-soft">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-ink-950">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-lg bg-[linear-gradient(90deg,var(--color-ink-100)_25%,var(--color-ink-50)_50%,var(--color-ink-100)_75%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
