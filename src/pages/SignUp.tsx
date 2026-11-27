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
    accent: 'text-rapid-100',
    iconClass: 'bg-sun-500 text-ink',
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
        <p className="kicker">Get started</p>
        <h1 className="t-section mt-4 text-ink">
          Create your <span className="t-serif text-rapid-700">RAPID account</span>
        </h1>
        <p className="lead mt-4 max-w-[56ch]">
          Testers create an account to manage their invitations. Founders create an account to publish a startup profile and collect interest.
        </p>

        {status === 'signed_in' && me && (
          <p className="mt-5 max-w-[56ch] rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm text-ink-soft">
            You’re signed in as <strong className="text-ink">{me.person.email}</strong>. Pick
            what you want to do next.
          </p>
        )}

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
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
                className={
                  path.role === 'founder'
                    ? 'lift group flex flex-col rounded-[24px] bg-rapid-900 p-7 text-white shadow-elev-2 sm:p-8'
                    : 'lift group flex flex-col rounded-[24px] bg-white p-7 text-ink shadow-elev-2 ring-1 ring-cream-200 sm:p-8'
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${path.iconClass}`}
                  >
                    <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span className={`text-sm font-semibold ${path.accent}`}>
                    {path.role === 'tester' ? 'For testers' : 'For founders'}
                  </span>
                </div>

                <h2 className="mt-10 font-display text-[28px] font-bold leading-[1.06] tracking-[-0.03em]">
                  {path.title}
                </h2>
                <p className={`mt-3 flex-1 text-[15px] leading-relaxed ${path.role === 'founder' ? 'text-rapid-100' : 'text-ink-soft'}`}>
                  {path.body}
                </p>

                <span className="mt-8 inline-flex h-12 items-center justify-center gap-2 self-start rounded-full bg-sun-500 px-6 text-[15px] font-semibold text-ink transition-colors group-hover:bg-sun-400">
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

        <p className="mt-6 text-sm text-ink-faint">Free to join · Adults 18+ · Joining does not guarantee a place.</p>
        <p className="mt-6 text-[15px] text-ink-soft">
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
