import { lazy, Suspense } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthSplit } from '@/components/layout/AuthSplit';
import { STAFF_PHOTO } from '@/components/layout/authPhotos';
import { usePageMeta } from '@/hooks/usePageMeta';
import { clerkPublishableKey, useSession } from '@/auth/session';
import { SITE } from '@/content/pilot';

const ClerkSignUpPanel = lazy(() => import('@/auth/ClerkSignUpPanel'));
const DevSignUpPanel = lazy(() => import('@/auth/DevSignUpPanel'));

/**
 * Account creation for invited staff. Creating an account here is the same as
 * anywhere else; the staff role only arrives because an invite (or the
 * allowlist) already names this address, which is why this page stays out of
 * the public sign-up picker.
 */
export default function AdminSignUp() {
  const { status, me } = useSession();

  usePageMeta({
    title: `Admin account | ${SITE.name}`,
    description: 'Create the account that an existing RAPID admin invited.',
    noindex: true,
  });

  if (status === 'loading') {
    return (
      <AuthLayout>
        <p className="flex items-center justify-center gap-2 py-16 text-sm text-light-muted">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Loading your account…
        </p>
      </AuthLayout>
    );
  }

  // A staff account belongs in the dashboard, not on a sign-up page.
  if (status === 'signed_in' && me?.roles.staff) {
    return <Navigate to="/staff" replace />;
  }

  if (status === 'signed_in') {
    return (
      <AuthLayout width="max-w-[896px]">
        <AuthSplit
          width="max-w-[520px]"
          photo={STAFF_PHOTO}
          header={
            <>
              <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-ink">
                This address is not invited yet
              </h1>
              <p className="mt-3 text-light-muted">
                {me ? (
                  <>
                    You are signed in as{' '}
                    <strong className="text-ink">{me.person.email}</strong>. Staff
                    access attaches to the exact address an admin invited.
                  </>
                ) : (
                  'Staff access attaches to the exact address an admin invited.'
                )}
              </p>
            </>
          }
        >
          <p className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="inline-flex min-h-[48px] items-center rounded-full bg-brand-500 px-6 text-sm font-bold text-ink hover:bg-brand-700 hover:text-white"
            >
              Check admin access
            </Link>
            <Link
              to="/sign-up"
              className="inline-flex min-h-[48px] items-center rounded-full border border-studio-300 px-6 text-sm font-bold text-ink hover:border-brand-600 hover:bg-studio-50"
            >
              Join as a tester or founder
            </Link>
          </p>
        </AuthSplit>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout width="max-w-[816px]">
      <AuthSplit
        width="max-w-[440px]"
        photo={STAFF_PHOTO}
        header={
          <>
            <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-ink sm:text-[34px]">
              Create your admin account
            </h1>
            <p className="mt-3 text-light-muted">
              Use the exact email address an admin invited. Access is attached when
              the account signs in — there is nothing else to accept.
            </p>
          </>
        }
      >
        <div className="pop-in rounded-2xl border border-studio-200 bg-studio-25 p-5 shadow-elev-1 sm:p-7">
          {clerkPublishableKey ? (
            <Suspense
              fallback={
                <p className="flex items-center justify-center gap-2 py-8 text-sm text-light-muted">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Loading account creation…
                </p>
              }
            >
              <ClerkSignUpPanel redirectUrl="/admin" />
            </Suspense>
          ) : (
            <Suspense
              fallback={
                <p className="flex items-center justify-center gap-2 py-8 text-sm text-light-muted">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Loading…
                </p>
              }
            >
              <DevSignUpPanel />
            </Suspense>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-light-muted">
          Already have the account?{' '}
          <Link
            to="/admin/sign-in"
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-light-muted">
          <Link
            to="/admin"
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            Back to admin access
          </Link>
        </p>
      </AuthSplit>
    </AuthLayout>
  );
}
