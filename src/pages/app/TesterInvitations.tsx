import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useApi } from '@/hooks/useApi';
import type { InvitationSummary } from '@/lib/dashboard-types';
import { EmptyState, ErrorPanel, Loading, PageHeading, Panel, Pill } from '@/pages/app/Ui';
import { INVITATION_LABEL, formatDay, invitationTone } from '@/pages/app/status';

export default function TesterInvitations() {
  const { data, loading, error, refresh } = useApi<InvitationSummary[]>('/api/tester/invitations');

  usePageMeta({ title: 'Invitations | RAPID', noindex: true });

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Tester"
        title="Invitations"
        description="Read the task and terms before you accept. Nothing is shared with a founder until you submit a response."
      />

      {loading && !data && <Loading label="Loading invitations…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data &&
        (data.length === 0 ? (
          <Panel>
            <EmptyState icon={<Inbox size={20} aria-hidden="true" />} title="No invitations yet">
              <p>
                Invitations show up here when the team matches you to a test. We’ll also email you, so you don’t have to keep checking.
              </p>
            </EmptyState>
          </Panel>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-cream-200 bg-cream-50/60 px-5 py-3 sm:px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                Open and answered
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint tabular-nums">
                {data.length} total
              </p>
            </div>

            <ul className="rows divide-y divide-cream-200">
              {data.map((invitation, index) => (
                <li key={invitation.id}>
                  <Link
                    to={`/app/tester/invitations/${invitation.id}`}
                    className="group grid grid-cols-[28px_1fr] gap-3 px-5 py-5 transition-colors duration-300 hover:bg-cream-50 sm:grid-cols-[40px_1fr] sm:gap-4 sm:px-6"
                  >
                    <span
                      aria-hidden="true"
                      className="pt-0.5 text-[10px] font-bold tracking-[0.14em] text-ink-faint tabular-nums"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="min-w-0">
                      <span className="flex flex-wrap items-start justify-between gap-3">
                        <span className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-ink group-hover:text-rapid-700">
                          {invitation.test.title || 'RAPID test'}
                        </span>
                        <Pill tone={invitationTone(invitation.status)}>
                          {INVITATION_LABEL[invitation.status] ?? invitation.status}
                        </Pill>
                      </span>

                      <span className="mt-1.5 block max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                        {invitation.test.question}
                      </span>

                      <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                        <span>Invited {formatDay(invitation.invitedAt)}</span>
                        <span aria-hidden="true" className="h-3 w-px bg-cream-300" />
                        <span>
                          {invitation.test.rewardNote ?? 'Reward shared in the terms'}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
