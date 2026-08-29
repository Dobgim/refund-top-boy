import type { ComponentProps, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-xl border border-ink-200 bg-white px-4 text-ink-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] " +
  "placeholder:text-ink-300 transition-colors duration-200 " +
  "hover:border-ink-300 focus:border-royal-500 focus:outline-none focus:ring-4 focus:ring-royal-500/12 " +
  "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 " +
  "aria-[invalid=true]:border-rose-400 aria-[invalid=true]:ring-rose-500/12";

export function Label({ className, children, ...props }: ComponentProps<"label">) {
  return (
    <label {...props} className={cn("text-sm font-semibold text-ink-800", className)}>
      {children}
    </label>
  );
}

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-rose-600">
      <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-rose-500">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-sm text-ink-400">
          {hint}
        </p>
      )}
      <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(CONTROL, "h-12", className)} />;
}

export function Textarea({ className, rows = 5, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} rows={rows} className={cn(CONTROL, "resize-y py-3 leading-relaxed", className)} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={cn(
        CONTROL,
        "h-12 appearance-none bg-[length:1.1rem] bg-[right_0.9rem_center] bg-no-repeat pr-11",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236577a3%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')]",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      type="checkbox"
      className={cn(
        "mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-[5px] border border-ink-300 accent-royal-600",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-600",
        className,
      )}
    />
  );
}

export function Fieldset({
  legend,
  description,
  children,
  className,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="text-lg font-bold tracking-tight text-ink-950">{legend}</legend>
      {description && <p className="mt-1 mb-5 max-w-prose text-sm text-ink-500">{description}</p>}
      <div className={cn(!description && "mt-5")}>{children}</div>
    </fieldset>
  );
}
