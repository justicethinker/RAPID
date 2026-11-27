import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthSplit } from '@/components/layout/AuthSplit';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  clerkPublishableKey,
  useSession,
  type Me,
  type SessionValue,
} from '@/auth/session';
import { TesterForm } from '@/components/forms/TesterForm';
import { StartupForm } from '@/components/forms/StartupForm';
import { SITE } from '@/content/pilot';

const ClerkSignUpPanel = lazy(() => import('@/auth/ClerkSignUpPanel'));
const DevSignUpPanel = lazy(() => import('@/auth/DevSignUpPanel'));

type SignUpRole = 'tester' | 'founder';

const ROLE_COPY = {
  tester: {
    accountTitle: 'Join the tester pool.',
    // Clerk offers Google; the email-only form does not, so the copy must not
    // promise it when Clerk is absent.
    accountIntroWithGoogle:
      'Continue with Google or your email. Next, you’ll answer a few quick questions about yourself and your interests.',
    accountIntro:
      'Create your account, then tell us a little about yourself so we can find tests that suit you.',
    detailsTitle: 'Tell us about you.',
    detailsIntro:
      'The more we know about your experience, the better we can match you to tests. Your answers go straight to your account.',
  },
  founder: {
    accountTitle: 'Create your founder account',
    accountIntroWithGoogle:
      'Continue with Google or your email address. Next you will set up the startup profile people will see.',
    accountIntro:
      'Next you will set up the startup profile people will see.',
    detailsTitle: 'Set up your startup',
    detailsIntro:
      'Add the essentials now. You can publish the profile straight away, or keep it as a draft while you refine it.',
  },
} as const;

function isRole(value: string | undefined): value is SignUpRole {
  return value === 'tester' || value === 'founder';
}

function Step({ current, detailsLabel = 'Your details' }: { current: 1 | 2; detailsLabel?: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-light-muted">
        Step {current} of 2 · {current === 1 ? 'Your account' : detailsLabel}
      </p>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {[1, 2].map((step) => (
          <span
            key={step}
            className={`h-1 flex-1 overflow-hidden rounded-full ${
              step <= current ? 'bg-brand-100' : 'bg-studio-200'
            }`}
          >
            {step <= current && (
              <span className="rule-grow block h-full w-full rounded-full bg-brand-500" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Both character steps keep the role portrait beside the form on desktop and
 * let it sit between the intro and the card on smaller screens.
 */
function StepFrame({
  role,
  current,
  title,
  intro,
  width,
  children,
}: {
  role: SignUpRole;
  current: 1 | 2;
  title: string;
  intro: string;
  width: string;
  children: ReactNode;
}) {
  return (
    <AuthSplit
      width={width}
      photo={{
        name: role === 'tester' ? 'tester' : 'founder',
        alt:
          role === 'tester'
            ? 'A participant writing notes during a research conversation'
            : 'A founder thinking over his notes in a quiet workspace',
        width: 1200,
        height: 1500,
        caption: 'Illustrative photograph',
      }}
      header={
        <>
          <Step
            current={current}
            detailsLabel={role === 'founder' ? 'Your startup' : 'Your details'}
          />
          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-ink sm:text-[34px]">
            {title}
          </h1>
          <p className="mt-3 text-light-muted">{intro}</p>
        </>
      }
    >
      {children}
    </AuthSplit>
  );
}

function AccountProblem() {
  const { error, refresh, signOut } = useSession();

  return (
    <div className="rounded-2xl border border-studio-200 bg-studio-25 p-6">
      <h2 className="text-lg font-bold text-ink">We could not open your account</h2>
      <p className="mt-2 text-sm text-light-muted">{error}</p>
      <div className="mt-5 flex flex-wrap gap-3">
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
    </div>
  );
}

function SignedInNote({
  me,
  signOut,
}: {
  me: Me;
  signOut: SessionValue['signOut'];
}) {
  return (
    <p className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-studio-200 bg-studio-25 px-4 py-3 text-sm text-light-muted">
      <span>
        Signed in as <strong className="text-ink">{me.person.email}</strong>
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="min-h-[40px] font-semibold text-brand-700 underline underline-offset-2"
      >
        Not you?
      </button>
    </p>
  );
}

export default function SignUpRole() {
  const { role: rawRole } = useParams();
  const navigate = useNavigate();
  const session = useSession();
  const { status, me, getToken, refresh, signOut } = session;
  const role: SignUpRole = isRole(rawRole) ? rawRole : 'tester';
  const valid = isRole(rawRole);
  const copy = ROLE_COPY[role];
  const accountIntro = clerkPublishableKey
    ? copy.accountIntroWithGoogle
    : copy.accountIntro;

  usePageMeta({
    title: `Create your ${role} account | ${SITE.name}`,
    description: accountIntro,
    noindex: true,
  });

  const finish = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // The dashboard retries on its own; never trap the visitor here.
    }
    navigate('/app', { replace: true });
  }, [navigate, refresh]);

  if (!valid) return <Navigate to="/sign-up" replace />;

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

  if (status === 'error') {
    return (
      <AuthLayout>
        <AccountProblem />
      </AuthLayout>
    );
  }

  if (status === 'signed_in' && me && me.roles[role]) {
    return <Navigate to="/app" replace />;
  }

  if (status === 'signed_out') {
    return (
      <AuthLayout width="max-w-[816px]">
        <StepFrame
          role={role}
          current={1}
          title={copy.accountTitle}
          intro={accountIntro}
          width="max-w-[440px]"
        >
          <div className="rise rounded-2xl border border-studio-200 bg-studio-25 p-5 shadow-elev-1 sm:p-7">
            {clerkPublishableKey ? (
              <Suspense
                fallback={
                  <p className="flex items-center justify-center gap-2 py-8 text-sm text-light-muted">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Loading account creation…
                  </p>
                }
              >
                <ClerkSignUpPanel redirectUrl={`/sign-up/${role}`} />
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
            Already have an account?{' '}
            <Link
              to="/sign-in"
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-light-muted">
            <Link
              to="/sign-up"
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              Choose a different role
            </Link>
          </p>
        </StepFrame>
      </AuthLayout>
    );
  }

  if (!me) {
    return (
      <AuthLayout>
        <p className="flex items-center justify-center gap-2 py-16 text-sm text-light-muted">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Loading your account…
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout width="max-w-[1096px]">
      <StepFrame
        role={role}
        current={2}
        title={copy.detailsTitle}
        intro={copy.detailsIntro}
        width="max-w-[720px]"
      >
        <SignedInNote me={me} signOut={signOut} />
        <div className="rise rounded-3xl border border-studio-200 bg-studio-25 p-5 sm:p-8">
          {role === 'tester' ? (
            <TesterForm
              account={{
                email: me.person.email,
                name: me.person.fullName,
                getToken,
                onSubmitted: finish,
              }}
            />
          ) : (
            <StartupForm onSaved={finish} />
          )}
        </div>
      </StepFrame>
    </AuthLayout>
  );
}
