import { Loader2 } from 'lucide-react';

/**
 * A soft veil over the page while a submission is in flight. It is visual
 * feedback only — the form remains mounted underneath and the button keeps
 * its own busy state for assistive technology.
 */
export function SubmitOverlay({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;

  return (
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-studio-100/70 p-5 backdrop-blur-[3px]"
      role="status"
      aria-live="polite"
    >
      <div className="pop-in flex flex-col items-center rounded-3xl border border-studio-200 bg-studio-25 px-8 py-7 text-center shadow-elev-3">
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
          <span
            aria-hidden="true"
            className="pulse-dot absolute inset-0 rounded-full bg-brand-500/25 text-brand-500"
          />
          <Loader2
            size={22}
            className="relative animate-spin text-brand-700"
            aria-hidden="true"
          />
        </span>
        <p className="mt-4 font-bold text-ink">{message}</p>
        <p className="mt-1 text-sm text-light-muted">
          Hold on — we are saving your answers.
        </p>
      </div>
    </div>
  );
}
