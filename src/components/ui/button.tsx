import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out " +
  "disabled:pointer-events-none disabled:opacity-55 active:translate-y-px " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-600";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-royal-600 text-white shadow-[0_10px_30px_-12px_rgb(79_70_229/0.8)] hover:bg-royal-700 hover:shadow-[0_16px_38px_-14px_rgb(79_70_229/0.9)]",
  secondary:
    "bg-ink-950 text-white hover:bg-ink-800 shadow-[0_10px_30px_-14px_rgb(8_12_28/0.9)]",
  outline:
    "border border-ink-200 bg-white text-ink-900 hover:border-royal-300 hover:bg-royal-50 hover:text-royal-700",
  ghost: "text-ink-700 hover:bg-ink-50 hover:text-ink-950",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  gold: "bg-gold-400 text-ink-950 hover:bg-gold-300 shadow-[0_10px_30px_-14px_rgb(227_172_60/0.9)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: ButtonBaseProps & { className?: string }) {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

export function Button({
  variant,
  size,
  fullWidth,
  loading,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonBaseProps & ComponentProps<"button">) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
    >
      {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: ButtonBaseProps & ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={buttonClasses({ variant, size, fullWidth, className })}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
