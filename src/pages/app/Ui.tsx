import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { CountUp } from "@/components/motion/CountUp";

export type Tone = "positive" | "neutral" | "warning" | "negative" | "proof";

const TONES: Record<Tone, { chip: string; dot: string }> = {
  // Green: done, accepted, approved, live.
  positive: { chip: "bg-rapid-50 text-rapid-800 ring-rapid-200", dot: "bg-rapid-500" },
  // Cream: draft, closed, not started — nothing needed.
  neutral: { chip: "bg-cream-100 text-ink-soft ring-cream-200", dot: "bg-ink-faint" },
  // Amber: waiting on someone, needs attention.
  warning: { chip: "bg-warn-50 text-warn-700 ring-[#F2D39A]", dot: "bg-[#D99A00]" },
  // Red: declined, rejected, failed.
  negative: { chip: "bg-danger-50 text-danger ring-danger/20", dot: "bg-danger" },
  // Deep green: published evidence. The one inverted chip.
  proof: { chip: "bg-rapid-900 text-cream-50 ring-rapid-900", dot: "bg-sun-500" },
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const style = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none ring-1 ring-inset",
        style.chip,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
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
    <div className="dashboard-page-heading hero-stagger flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-cream-200 pb-7">
      {/* flex-1 lets a long title shrink instead of pushing the page action
          onto its own line. */}
      <div className="min-w-0 flex-1 basis-[min(100%,26rem)]">
        <p className="kicker">{eyebrow}</p>
        <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.04] tracking-[-0.03em] text-ink sm:text-[40px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-soft">
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
      className="group -ml-1 inline-flex min-h-[44px] items-center gap-2 rounded-full px-1 text-sm font-semibold text-ink-soft transition-colors hover:text-rapid-700"
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
      <dt className="text-xs font-semibold text-ink-faint">
        {label}
      </dt>
      <dd className="mt-1 text-[15px] font-semibold text-ink">{children}</dd>
    </div>
  );
}

/** Evidence quotes: serif voice on a paper card. */
export function Quote({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="relative rounded-2xl bg-cream-100 px-5 pb-4 pt-5">
      <span aria-hidden="true" className="absolute -top-3 left-4 font-serif text-5xl leading-none text-sun-500">“</span>
      <blockquote className="font-serif text-[19px] italic leading-[1.45] text-ink">
        “{children}”
      </blockquote>
      <figcaption className="mt-2.5 text-xs font-semibold text-ink-faint">
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
    <section className="dashboard-panel rise overflow-hidden rounded-[20px] border border-cream-200 bg-white shadow-elev-1">
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cream-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={hasHeader ? "px-5 py-5 sm:px-6" : "p-5 sm:p-6"}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="lift group relative overflow-hidden rounded-[20px] border border-cream-200 bg-white p-5 shadow-elev-1 hover:border-rapid-300">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink-soft">{label}</p>
        {icon && (
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-rapid-50 text-rapid-700">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[40px] font-bold leading-none tracking-[-0.04em] text-ink tabular-nums">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
      {hint && <p className="mt-2 text-xs leading-snug text-ink-faint">{hint}</p>}
      <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-[3px] origin-left scale-x-0 rounded-full bg-sun-500 transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  /** The next step, usually a button or link. */
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row">
      {icon && (
        <span className="pop-in relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rapid-50 text-rapid-700 ring-1 ring-inset ring-rapid-100">
          {icon}
          <span aria-hidden="true" className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-sun-500" />
        </span>
      )}
      <div className="min-w-0">
        {/* Panels are not always titled, so this stays at h2 to keep the
            heading order valid (h1 followed by h2). */}
        <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">{title}</h2>
        {children && (
          <div className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
            {children}
          </div>
        )}
        {action && <div className="mt-4 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}

/** Skeleton rows while data loads; the label stays readable to assistive tech. */
export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="fade-in space-y-3">
      <p className="flex items-center gap-2 text-sm text-ink-faint">
        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        {label}
      </p>
      <div aria-hidden="true" className="grid gap-3 sm:grid-cols-3">
        <div className="skeleton h-24" />
        <div className="skeleton h-24" />
        <div className="skeleton hidden h-24 sm:block" />
      </div>
      <div aria-hidden="true" className="skeleton h-40" />
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="shake flex items-start gap-3 rounded-[20px] border border-danger/25 bg-danger-50 p-5">
      <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-danger" />
      <div>
        <p className="font-semibold text-danger">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex min-h-[40px] items-center rounded-full border border-danger/30 bg-white px-4 text-sm font-semibold text-danger transition-colors hover:border-danger"
          >
            Try again
          </button>
        )}
      </div>
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
      {hint && <span className="mt-1 block text-sm font-normal text-ink-soft">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "mt-2 w-full rounded-xl border border-cream-500 bg-white px-4 py-3 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-faint/80 hover:border-ink/40 focus:border-rapid-600 focus:outline-none focus:ring-4 focus:ring-rapid-500/15";

/**
 * The greeting at the top of a role's overview: deep green, one sentence on
 * what to do next, and the one primary action.
 */
export function WelcomeBanner({
  kicker,
  title,
  children,
  action,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="on-dark hero-stagger relative isolate overflow-hidden rounded-[28px] bg-rapid-900 px-6 py-8 text-white sm:px-10 sm:py-10">
      <span aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-rapid-700/70 blur-2xl" />
      <span aria-hidden="true" className="absolute -bottom-16 right-10 -z-10 h-40 w-40 rounded-full bg-sun-500/25 blur-2xl" />
      <p className="kicker">{kicker}</p>
      <h1 className="mt-4 font-display text-[34px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[46px]">{title}</h1>
      {children && <div className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-rapid-100">{children}</div>}
      {action && <div className="mt-7 flex flex-wrap gap-3">{action}</div>}
    </section>
  );
}

/** A small "View all" style link used in panel headers. */
export function PanelLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 text-sm font-semibold text-rapid-700 transition-colors hover:bg-rapid-50"
    >
      {children}
      <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/**
 * Where a test is in its life: a compact stepper. Done steps are filled green,
 * the current step carries the accent, later steps stay quiet.
 */
export function StatusTimeline({
  stages,
  current,
  className,
}: {
  stages: Array<{ key: string; label: string }>;
  current: string;
  className?: string;
}) {
  const index = stages.findIndex((stage) => stage.key === current);
  const currentLabel = index >= 0 ? stages[index]!.label : current;
  return (
    <div className={className}>
      <p className="sr-only">
        Stage {index + 1} of {stages.length}: {currentLabel}
      </p>
      <ol aria-hidden="true" className="flex items-center gap-1">
        {stages.map((stage, position) => {
          const done = index >= 0 && position < index;
          const active = position === index;
          return (
            <li key={stage.key} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  done ? "bg-rapid-600" : active ? "bg-sun-500" : "bg-cream-200",
                )}
              />
              <span
                className={cn(
                  "hidden truncate text-[11px] font-semibold sm:block",
                  active ? "text-ink" : done ? "text-rapid-700" : "text-ink-faint",
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
