import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";

export type Tone = "positive" | "neutral" | "warning" | "negative" | "proof";

const TONES: Record<Tone, string> = {
  positive: "bg-brand-50 text-brand-700",
  neutral: "bg-studio-100 text-ink",
  warning: "bg-warn-50 text-warn-900",
  negative: "bg-red-50 text-danger",
  // Oxblood is the evidence accent: published findings, not actions.
  proof: "bg-oxblood-50 text-oxblood-600",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="dashboard-page-heading hero-stagger flex flex-wrap items-end justify-between gap-4">
      {/* flex-1 lets a long title shrink instead of pushing the page action
          onto its own line. */}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">
          <span aria-hidden="true" className="h-px w-6 bg-brand-700/50" />
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[30px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[36px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-light-muted">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group -ml-0.5 inline-flex min-h-[44px] items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-studio-600 transition-colors hover:text-ink"
    >
      <ArrowLeft
        size={15}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-translate-x-0.5"
      />
      {children}
    </Link>
  );
}

/**
 * A labelled value, used inside a <dl>. The uppercase label and hairline
 * rhythm come from the public site's evidence blocks.
 */
export function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-studio-600">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}

/** Oxblood marks evidence — quotes and published findings, never actions. */
export function Quote({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="border-l-2 border-oxblood-500 pl-5">
      <blockquote className="text-[15px] leading-[1.7] text-ink">
        “{children}”
      </blockquote>
      <figcaption className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-oxblood-600">
        {label}
      </figcaption>
    </figure>
  );
}

export function Panel({
  title,
  description,
  children,
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const hasHeader = Boolean(title || description || action);

  return (
    <Reveal
      as="section"
      className="dashboard-panel lift overflow-hidden rounded-2xl border border-studio-200 bg-studio-25 hover:border-brand-600"
    >
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-studio-200/80 px-5 py-5 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-light-muted">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={hasHeader ? "px-5 py-5 sm:px-6" : "p-5 sm:p-6"}>{children}</div>
    </Reveal>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="lift relative overflow-hidden rounded-2xl border border-studio-200 bg-studio-25 py-5 pl-6 pr-5 hover:border-brand-600">
      <span
        aria-hidden="true"
        className="absolute inset-y-5 left-0 w-[2px] rounded-full bg-brand-500/80"
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-studio-600">{label}</p>        <p className="mt-2.5 text-[32px] font-extrabold leading-none tracking-[-0.04em] text-ink tabular-nums">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
      {hint && <p className="mt-2 text-xs leading-snug text-light-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      {icon && (
        <span className="pop-in flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-studio-200 bg-studio-50 text-brand-700">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        {/* Panels are not always titled, so this stays at h2 to keep the
            heading order valid (h1 followed by h2). */}
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
        {children && (
          <div className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-light-muted">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <p role="status" className="fade-in flex items-center gap-2 text-light-muted">
      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      {label}
    </p>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="shake rounded-2xl border border-red-200 bg-red-50 p-5">
      <p className="font-semibold text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-xl border border-red-200 bg-studio-25 px-4 text-sm font-semibold text-danger"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
      {children}
      {hint && <span className="mt-1 block text-sm font-normal text-light-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "mt-2 w-full rounded-xl border border-studio-300 bg-studio-25 px-4 py-3 text-base text-ink placeholder:text-light-muted/70 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/25";
