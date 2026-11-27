import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, Clock3, Inbox, UserRound } from 'lucide-react';
import { useSession } from '@/auth/session';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useApi } from '@/hooks/useApi';
import { buttonStyles } from '@/components/ui/buttonStyles';
import type { TesterOverviewData } from '@/lib/dashboard-types';
import { applicationStatus } from '@/pages/app/application-status';
import { EmptyState, ErrorPanel, Loading, Panel, PanelLink, Pill, Stat, WelcomeBanner } from '@/pages/app/Ui';
import { INVITATION_LABEL, formatDay, invitationTone } from '@/pages/app/status';

export default function TesterOverview() {
  const { me } = useSession();
  const { data, loading, error, refresh } = useApi<TesterOverviewData>('/api/tester/overview');
  usePageMeta({ title: 'Tester account | RAPID', noindex: true });
  if (loading && !data) return <Loading label="Loading your tester account…" />;
  if (error) return <ErrorPanel message={error} onRetry={() => void refresh()} />;
  if (!data) return null;

  const status = applicationStatus(data.application.status);
  const firstName = me?.person.fullName?.trim().split(/\s+/)[0];

  return (
    <div className="space-y-6">
      <WelcomeBanner
        kicker="Your tester space"
        title={firstName ? `Hello, ${firstName}.` : 'Hello there.'}
        action={
          <Link to="/app/tester/invitations" className={buttonStyles({})}>
            View invitations
            <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
          </Link>
        }
      >
        <p>{data.nextAction}</p>
      </WelcomeBanner>

      <section aria-label="Your participation summary" className="grid gap-3 sm:grid-cols-3">
        <Stat label="Invitations" value={data.counts.invitations} hint="In your account" icon={<Inbox size={15} />} />
        <Stat label="Active" value={data.counts.active} hint="Waiting for you" icon={<Clock3 size={15} />} />
        <Stat label="Completed" value={data.counts.completed} hint="Tests completed" icon={<CheckCircle2 size={15} />} />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <Panel title="Recent invitations" action={<PanelLink to="/app/tester/invitations">View all</PanelLink>}>
            {data.recent.length === 0 ? (
              <EmptyState
                icon={<Inbox size={20} aria-hidden="true" />}
                title="No invitations yet"
                action={
                  <Link to="/app/tester/profile" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
                    Check your profile
                  </Link>
                }
              >
                <p>
                  When a test matches your experience, it’ll show up here and in your email. You’ll see the task and any
                  reward before you decide.
                </p>
              </EmptyState>
            ) : (
              <ul className="rows -my-2 divide-y divide-cream-200">
                {data.recent.map((invitation) => (
                  <li key={invitation.id}>
                    <Link
                      to={`/app/tester/invitations/${invitation.id}`}
                      className="group -mx-2 flex min-h-[72px] items-center justify-between gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-cream-50"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink group-hover:text-rapid-700">
                          {invitation.test.title || 'RAPID test'}
                        </span>
                        <span className="block text-sm text-ink-soft">
                          {invitation.test.rewardNote ?? 'Reward shared in the terms'}
                        </span>
                        <span className="mt-1 block text-xs text-ink-faint">Invited {formatDay(invitation.invitedAt)}</span>
                      </span>
                      <Pill tone={invitationTone(invitation.status)}>
                        {INVITATION_LABEL[invitation.status] ?? invitation.status}
                      </Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Link to="/app/tester/history" className="text-arrow">
            See your test history <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-4">
          <Panel title="Your application" action={<Pill tone={status.tone}>{status.label}</Pill>}>
            <p className="text-sm leading-relaxed text-ink-soft">{status.sentence}</p>
            <dl className="mt-5 space-y-3 border-t border-cream-200 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Applied</dt>
                <dd className="font-semibold text-ink">{formatDay(data.application.appliedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-faint">Location</dt>
                <dd className="font-semibold text-ink">{data.application.city ?? 'Not added'}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Reference</dt>
                <dd className="mt-1 break-all font-mono text-xs text-ink">{data.application.reference}</dd>
              </div>
            </dl>
          </Panel>
          <Link
            to="/app/tester/profile"
            className="lift group flex gap-4 rounded-[20px] bg-sun-100 p-5 text-ink ring-1 ring-sun-200"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sun-500 text-ink">
              <UserRound size={19} aria-hidden="true" />
            </span>
            <span>
              <strong className="block font-display text-[18px] font-bold tracking-[-0.015em]">Keep it current.</strong>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                An up-to-date profile helps us match you to the right tests.
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rapid-800">
                View profile <ArrowUpRight size={14} aria-hidden="true" />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
