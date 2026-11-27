import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSession, type Role } from '@/auth/session';
import { Container } from '@/components/layout/Container';
import NotFound from '@/pages/NotFound';
import { supportEmailHref } from '@/lib/site';

export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-studio-50">
      <p className="flex items-center gap-3 text-light-muted">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Loading your account…
      </p>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const location = useLocation();

  if (status === 'loading') return <AuthLoading />;
  if (status === 'signed_out') {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }
  if (status === 'error') return <SessionProblem />;

  return <>{children}</>;
}

function SessionProblem() {
  const { error, refresh, signOut } = useSession();

  return (
    <main id="main" className="flex min-h-screen items-center bg-studio-50">
      <Container className="py-16">
        <div className="mx-auto max-w-[560px] rounded-2xl border border-studio-200 bg-studio-25 p-8">
          <h1 className="text-2xl font-bold text-ink">We could not load your account</h1>
          <p className="mt-3 text-light-muted">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-brand-500 px-5 font-semibold text-ink hover:bg-brand-600"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-studio-300 px-5 font-semibold text-ink hover:bg-studio-50"
            >
              Sign out
            </button>
          </div>
          <p className="mt-6 text-sm text-light-muted">
            Still stuck? Email{' '}
            <a className="font-semibold text-brand-700 underline underline-offset-2" href={supportEmailHref}>
              RAPID support
            </a>
            .
          </p>
        </div>
      </Container>
    </main>
  );
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { me } = useSession();
  if (!me?.roles[role]) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

/** Staff-only surfaces return 404 to everyone else rather than disclosing them. */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { me } = useSession();
  if (!me?.roles.staff) return <NotFound />;
  return <>{children}</>;
}
