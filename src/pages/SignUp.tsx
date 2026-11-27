import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Compass, Users } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Stagger } from '@/components/motion/Reveal';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSession } from '@/auth/session';
import { SITE } from '@/content/pilot';
import { trackEvent } from '@/lib/analytics';

const PATHS = [
  {
    role: 'founder',
    index: '01',
    icon: Compass,
    accent: 'text-rapid-700',
    iconClass: 'bg-rapid-50 text-rapid-700',
    title: 'I’m building something',
    body: 'Create a public startup profile, share what you are building and collect early interest.',
    cta: 'Create a founder account',
  },
  {
    role: 'tester',
    index: '02',
    icon: Users,
    accent: 'text-rapid-700',
    iconClass: 'bg-rapid-50 text-rapid-700',
    title: 'I want to test products',
    body: 'Join the tester pool, get invitations that match your experience and choose which ones to accept.',
    cta: 'Become a tester',
  },
] as const;

export default function SignUp() {
  const { status, me } = useSession();

  usePageMeta({
    title: `Create your account | ${SITE.name}`,
    description: 'Create a tester account, or a founder account to share your startup and collect early interest.',
  });

  // Someone who already has a working account belongs in their dashboard. An
  // account with no profile yet is exactly who this page is for.
  if (
    status === 'signed_in' &&
    me &&
    (me.roles.tester || me.roles.founder || me.roles.staff)
  ) {
    return <Navigate to="/app" replace />;
  }

  return (
    <AuthLayout width="max-w-[880px]">
      <div className="mx-auto max-w-[780px]">
        <p className="t-eyebrow text-rapid-700">Get started</p>
        <h1 className="t-section mt-3 text-ink">Create your RAPID account</h1>
        <p className="lead mt-4 max-w-[56ch]">
          Testers create an account to manage their invitations. Founders create an account to publish a startup profile and collect interest.
        </p>

        {status === 'signed_in' && me && (
          <p className="mt-5 max-w-[56ch] rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-soft">
            You’re signed in as <strong className="text-ink">{me.person.email}</strong>. Pick
            what you want to do next.
          </p>
        )}

        <Stagger className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-10">
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.role}
                to={path.role === 'founder' ? '/sign-up/founder' : '/sign-up/tester'}
                onClick={() =>
                  trackEvent('cta_click', {
                    cta: `sign_up_${path.role}`,
                    location: 'sign_up_picker',
                  })
                }
                className="group flex flex-col border-t border-ink pt-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className={`t-eyebrow ${path.accent}`}>
                    {path.index} · {path.role === 'tester' ? 'Testers' : 'Founders'}
                  </span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${path.iconClass}`}
                  >
                    <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                </div>

                <h2 className="font-display mt-5 text-[24px] font-bold leading-[1.08] tracking-[-0.035em] text-ink">
                  {path.title}
                </h2>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-soft">
                  {path.body}
                </p>

                <span className="rule-link mt-6">
                  {path.cta}
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </Stagger>

        <p className="mt-10 border-t border-cream-200 pt-5 text-[13px] text-ink-soft">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="font-semibold text-rapid-700 underline underline-offset-2 hover:text-ink"
          >
            Sign in
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}
