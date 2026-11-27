import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Inbox, UserRound } from 'lucide-react';
import { SignalMark } from '@/components/ui/SignalMark';
import { useSession } from '@/auth/session';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useApi } from '@/hooks/useApi';
import type { TesterOverviewData } from '@/lib/dashboard-types';
import { applicationStatus } from '@/pages/app/application-status';
import { EmptyState, ErrorPanel, Loading, Panel, Pill } from '@/pages/app/Ui';
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
  return <div className="tester-dashboard">
    <div className="dashboard-welcome"><div><p className="dashboard-kicker">YOUR TESTER SPACE <span><SignalMark /></span></p><h1>{firstName ? `Hello, ${firstName}.` : 'Hello there.'}</h1><p>{data.nextAction}</p><Link to="/app/tester/invitations" className="dashboard-primary">View invitations <ArrowRight size={17}/></Link></div><div className="dashboard-welcome-art" aria-hidden="true"><span>YOUR<br/>PERSPECTIVE</span><strong>matters<span>.</span></strong><div><SignalMark /></div></div></div>
    <div className="dashboard-stats" aria-label="Your participation summary"><div><span>INVITATIONS</span><strong>{data.counts.invitations}</strong><small>In your account</small></div><div><span>ACTIVE</span><strong>{data.counts.active}</strong><small>Waiting for you</small></div><div><span>COMPLETED</span><strong>{data.counts.completed}</strong><small>Tests completed</small></div></div>
    <div className="dashboard-content"><div className="dashboard-main"><Panel title="Recent invitations" action={<Link to="/app/tester/invitations" className="dashboard-panel-link">View all <ArrowUpRight size={14}/></Link>}>
      {data.recent.length === 0 ? <EmptyState icon={<Inbox size={20} aria-hidden="true"/>} title="No invitations yet"><p>When a test matches your experience, it’ll show up here and in your email. You’ll see the task and reward before you decide.</p></EmptyState> : <ul className="rows divide-y divide-studio-200">{data.recent.map(invitation => <li key={invitation.id}><Link to={`/app/tester/invitations/${invitation.id}`} className="flex min-h-[72px] items-center justify-between gap-4 py-4 hover:text-brand-700"><span className="min-w-0"><span className="block font-semibold text-ink">{invitation.test.title || 'RAPID test'}</span><span className="block text-sm text-light-muted">{invitation.test.rewardNote ?? 'Reward shared in the terms'}</span><span className="mt-1 block text-xs text-studio-600">Invited {formatDay(invitation.invitedAt)}</span></span><Pill tone={invitationTone(invitation.status)}>{INVITATION_LABEL[invitation.status] ?? invitation.status}</Pill></Link></li>)}</ul>}
    </Panel><Link to="/app/tester/history" className="dashboard-history-link">See your test history <ArrowUpRight size={16}/></Link></div>
    <div className="dashboard-side"><Panel title="Your application" action={<Pill tone={status.tone}>{status.label}</Pill>}><p className="text-sm leading-relaxed text-light-muted">{status.sentence}</p><dl className="mt-5 space-y-3 border-t border-studio-200 pt-4 text-sm"><div><dt className="text-light-muted">Applied</dt><dd className="mt-1 font-semibold text-ink">{formatDay(data.application.appliedAt)}</dd></div><div><dt className="text-light-muted">Location</dt><dd className="mt-1 font-semibold text-ink">{data.application.city ?? 'Not added'}</dd></div><div><dt className="text-light-muted">Reference</dt><dd className="mt-1 break-all font-mono text-xs text-ink">{data.application.reference}</dd></div></dl></Panel><Link to="/app/tester/profile" className="dashboard-profile-card"><UserRound size={23}/><span><strong>Keep it current.</strong><small>An up-to-date profile helps us match you to the right tests.</small><b>View profile <ArrowUpRight size={14}/></b></span></Link></div></div>
  </div>;
}
