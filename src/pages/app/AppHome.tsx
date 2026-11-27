import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Users, Compass, Rocket } from 'lucide-react';
import { useSession, type Role } from '@/auth/session';
import { usePageMeta } from '@/hooks/usePageMeta';
import { applicationStatus } from '@/pages/app/application-status';
import { Stagger } from '@/components/motion/Reveal';
import { useSpotlight } from '@/components/motion/spotlight';

export default function AppHome() {
  const { me } = useSession();

  usePageMeta({ title: 'Your account | RAPID', noindex: true });

  if (!me) return null;

  const roles = (['tester', 'founder', 'staff'] as Role[]).filter((role) => me.roles[role]);

  if (roles.length === 0) {
    return (
      <div className="mx-auto max-w-[620px]">
        <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
          This account has no profile yet
        </h1>
        <p className="mt-3 text-light-muted">
          You’re signed in as {me.person.email}. Finish your tester application, or tell us what you want to test.
        </p>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/sign-up/tester"
            className="lift card-sheen group rounded-2xl border border-studio-200 bg-studio-25 p-6 transition-colors hover:border-brand-600"
          >
            <Users size={22} className="text-brand-700" aria-hidden="true" />
            <span className="mt-4 block text-lg font-bold text-ink">Join as a tester</span>
            <span className="mt-1 block text-sm text-light-muted">
              A three-minute application. Then take part in short research tasks.
            </span>
          </Link>
          <Link
            to="/sign-up/founder"
            className="rounded-2xl border border-studio-200 bg-studio-25 p-6 transition-colors hover:border-brand-600"
          >
            <Compass size={22} className="text-brand-700" aria-hidden="true" />
            <span className="mt-4 block text-lg font-bold text-ink">Create a founder account</span>
            <span className="mt-1 block text-sm text-light-muted">
              Set up a public startup profile and collect early interest.
            </span>
          </Link>
        </Stagger>
      </div>
    );
  }

  if (roles.length === 1) {
    const role = roles[0];
    return <Navigate to={role === 'staff' ? '/staff' : `/app/${role}`} replace />;
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
        Where do you want to go?
      </h1>
      <p className="mt-3 text-light-muted">
        This account is set up for more than one role. Each view shows different work.
      </p>

      <Stagger className="mt-8 grid gap-4">
        {me.roles.tester && me.tester && (
          <RoleCard
            to="/app/tester"
            icon={<Users size={22} aria-hidden="true" />}
            title="Tester"
            description={`Application ${applicationStatus(me.tester.applicationStatus).label.toLowerCase()} · ${me.tester.invitations} invitation${me.tester.invitations === 1 ? '' : 's'}`}
          />
        )}
        {me.roles.founder && (
          <RoleCard
            to="/app/founder"
            icon={<Rocket size={22} aria-hidden="true" />}
            title="Founder"
            description="Your startup, posts, waitlist and validation requests."
          />
        )}
        {me.roles.staff && (
          <RoleCard
            to="/staff"
            icon={<ShieldCheck size={22} aria-hidden="true" />}
            title="Staff"
            description="Review applications and run the pilot."
          />
        )}
      </Stagger>
    </div>
  );
}

function RoleCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  const onPointerMove = useSpotlight();

  return (
    <Link
      to={to}
      onPointerMove={onPointerMove}
      className="lift spotlight group flex items-center justify-between gap-4 rounded-2xl border border-studio-200 bg-studio-25 p-6 transition-colors hover:border-brand-600"
    >
      <span className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
          {icon}
        </span>
        <span>
          <span className="block text-lg font-bold text-ink">{title}</span>
          <span className="block text-sm text-light-muted">{description}</span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-light-muted transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
