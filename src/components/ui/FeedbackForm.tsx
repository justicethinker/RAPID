import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, MessageSquare, Send } from 'lucide-react';
import { useSession } from '@/auth/session';
import { useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import { inputClass } from '@/pages/app/Ui';

/**
 * Feedback is an authenticated action: it is persisted against a person so the
 * founder can moderate it, but it is never shown publicly.
 */
export function FeedbackForm({ postId }: { postId: string }) {
  const { status } = useSession();
  const request = useApiClient();
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'loading') return null;

  if (status === 'signed_out') {
    return (
      <p className="text-sm leading-relaxed text-ink-soft">
        <Link
          to="/sign-in"
          state={{ from: `${window.location.pathname}${window.location.hash}` }}
          className="font-semibold text-rapid-700 underline underline-offset-2"
        >
          Sign in
        </Link>{' '}
        to leave feedback for this founder.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="text-sm text-ink-soft">
        We could not confirm your account, so feedback is unavailable right now.
      </p>
    );
  }

  if (sent) {
    return (
      <div aria-live="polite" className="flex items-start gap-3">
        <CheckCircle2
          size={20}
          className="mt-0.5 shrink-0 text-rapid-700"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-ink">
            Feedback sent to the founder.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            It will appear in their audience page. It is not shown publicly.
          </p>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setBody('');
            }}
            className="mt-2 text-xs font-semibold text-rapid-700 underline underline-offset-2"
          >
            Send more feedback
          </button>
        </div>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = body.trim();
    if (pending) return;
    if (message.length < 10) {
      setError('Write at least 10 characters so the founder can use it.');
      return;
    }

    setPending(true);
    setError(null);
    try {
      await request(`/api/posts/${postId}/feedback`, {
        method: 'POST',
        body: { body: message },
      });
      setSent(true);
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields?.body) {
        setError(cause.fields.body);
      } else if (cause instanceof ApiError && cause.status === 429) {
        setError('Too many feedback attempts. Try again in a few minutes.');
      } else if (cause instanceof ApiError && cause.status === 401) {
        setError('Your session expired. Sign in again to send feedback.');
      } else {
        setError('We could not send your feedback. Check your connection and try again.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <label
        htmlFor={`feedback-${postId}`}
        className="flex items-center gap-2 text-sm font-semibold text-ink"
      >
        <MessageSquare size={15} aria-hidden="true" />
        Share feedback with the founder
      </label>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        What is clear, confusing or missing? Your feedback is private to the
        founder.
      </p>
      <textarea
        id={`feedback-${postId}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={1000}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `feedback-error-${postId}` : undefined}
        className={`${inputClass} resize-y text-sm`}
        placeholder="Tell them what you think…"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-ink-faint">
          {body.trim().length}/1000 · at least 10
        </span>
        <button
          type="submit"
          disabled={pending || body.trim().length < 10}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-sun-500 px-4 text-xs font-semibold text-ink transition-colors hover:bg-sun-400 disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              <Send size={14} aria-hidden="true" />
              Send feedback
            </>
          )}
        </button>
      </div>
      {error && (
        <p
          id={`feedback-error-${postId}`}
          role="alert"
          className="mt-2 text-xs font-semibold text-danger"
        >
          {error}
        </p>
      )}
    </form>
  );
}
