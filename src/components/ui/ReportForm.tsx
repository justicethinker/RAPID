import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Flag, Loader2 } from 'lucide-react';
import { useSession } from '@/auth/session';
import { useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import { inputClass } from '@/pages/app/Ui';

/**
 * A report is a moderation case, not a public dislike. It asks for a short
 * reason and never hides the content automatically; staff decide.
 */
export function ReportForm({
  targetType,
  targetId,
}: {
  targetType: 'post' | 'feedback' | 'startup';
  targetId: string;
}) {
  const { status } = useSession();
  const request = useApiClient();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== 'signed_in') {
    return (
      <Link
        to="/sign-in"
        state={{ from: `${window.location.pathname}${window.location.hash}` }}
        className="text-xs font-semibold text-studio-600 underline underline-offset-2 hover:text-ink"
      >
        Sign in to report
      </Link>
    );
  }

  if (sent) {
    return (
      <p
        aria-live="polite"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700"
      >
        <CheckCircle2 size={14} aria-hidden="true" />
        Report sent for review
      </p>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = reason.trim();
    if (pending) return;
    if (message.length < 10) {
      setError('Tell us what is wrong in at least 10 characters.');
      return;
    }

    setPending(true);
    setError(null);
    try {
      await request('/api/reports', {
        method: 'POST',
        body: { targetType, targetId, reason: message },
      });
      setSent(true);
      setOpen(false);
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields?.reason) {
        setError(cause.fields.reason);
      } else if (cause instanceof ApiError && cause.status === 429) {
        setError('Too many reports. Try again later.');
      } else if (cause instanceof ApiError && cause.status === 409) {
        setError('You cannot report your own content.');
      } else {
        setError('We could not send the report. Check your connection and try again.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-studio-600 underline underline-offset-2 hover:text-danger"
      >
        <Flag size={13} aria-hidden="true" />
        Report
      </button>
      {open && (
        <form
          id={`${id}-panel`}
          onSubmit={(event) => void submit(event)}
          className="mt-3 w-full max-w-[420px] rounded-xl border border-studio-200 bg-studio-50 p-3 text-left"
        >
          <label
            htmlFor={`${id}-reason`}
            className="block text-xs font-bold uppercase tracking-[0.1em] text-studio-600"
          >
            What is wrong?
          </label>
          <textarea
            id={`${id}-reason`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={500}
            aria-invalid={error ? true : undefined}
            className={`${inputClass} resize-y text-sm`}
            placeholder="Spam, harassment, misleading claims…"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={pending || reason.trim().length < 10}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-bold text-white disabled:opacity-50"
            >
              {pending ? (
                <>
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  Sending
                </>
              ) : (
                'Send report'
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-light-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs font-semibold text-danger">
              {error}
            </p>
          )}
        </form>
      )}
    </span>
  );
}
