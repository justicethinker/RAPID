import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useSession } from '@/auth/session';
import { useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';

interface OpenLinkedTestResponse {
  invitationId: string;
  invitationStatus: string;
  test: {
    id: string;
    title: string;
    question: string;
    terms: string;
    method: string | null;
    rewardNote: string | null;
    status: string;
    closesAt: string | null;
  };
}

export function LinkedTestButton({ postId }: { postId: string }) {
  const { status } = useSession();
  const request = useApiClient();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [needsTester, setNeedsTester] = useState(false);

  if (status === 'loading') return null;

  if (status === 'signed_out') {
    return (
      <div>
        <Link
          to="/sign-in"
          state={{ from: `${window.location.pathname}${window.location.hash}` }}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-bold text-ink transition-colors hover:bg-brand-600"
        >
          Sign in to take part
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <p className="mt-2 text-xs leading-relaxed text-light-muted">
          Participation is limited to approved testers with an invitation for
          this test.
        </p>
      </div>
    );
  }

  const open = async () => {
    setPending(true);
    setMessage(null);
    setNeedsTester(false);
    try {
      const result = await request<OpenLinkedTestResponse>(
        `/api/posts/${postId}/test`,
      );
      navigate(`/app/tester/invitations/${result.invitationId}`);
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields?.test) {
        setMessage(cause.fields.test);
        setNeedsTester(
          cause.status === 403 &&
            cause.fields.test.startsWith('Only approved'),
        );
      } else if (cause instanceof ApiError && cause.status === 401) {
        setMessage('Your session expired. Sign in again to take part.');
      } else if (cause instanceof ApiError && cause.status === 404) {
        setMessage('This test is no longer available.');
      } else {
        setMessage(
          'We could not open this test. Check your connection and try again.',
        );
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void open()}
        disabled={pending}
        className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-bold text-ink transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <ArrowUpRight size={15} aria-hidden="true" />
        )}
        {pending ? 'Opening…' : 'Take part in this test'}
      </button>
      {message && (
        <p
          role="alert"
          className="mt-2 max-w-[58ch] text-sm font-semibold text-danger"
        >
          {message}{' '}
          {needsTester && (
            <Link
              to="/join"
              className="underline underline-offset-2 hover:text-ink"
            >
              Join the tester pool
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
