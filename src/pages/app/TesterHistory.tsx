import { Link } from 'react-router-dom';
import { History as HistoryIcon } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { buttonStyles } from '@/components/ui/buttonStyles';
import { useApi } from '@/hooks/useApi';
import { labelOutcome } from '@/lib/labels';
import type { TesterHistoryItem } from '@/lib/dashboard-types';
import { EmptyState, ErrorPanel, Loading, PageHeading, Panel, Pill } from '@/pages/app/Ui';
import { INVITATION_LABEL, formatDay, invitationTone } from '@/pages/app/status';

export default function TesterHistory() {
  const { data, loading, error, refresh } = useApi<TesterHistoryItem[]>('/api/tester/history');

  usePageMeta({ title: 'Test history | RAPID', noindex: true });

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Tester"
        title="History"
        description="Every test you completed or declined, with the outcome you recorded and the reward status."
      />

      {loading && !data && <Loading label="Loading history…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data &&
        (data.length === 0 ? (
          <Panel>
            <EmptyState
              icon={<HistoryIcon size={20} aria-hidden="true" />}
              title="Nothing here yet"
              action={<Link to="/app/tester/invitations" className={buttonStyles({ variant: 'outline', size: 'sm' })}>See your invitations</Link>}
            >
              <p>Completed and declined tests will appear here.</p>
            </EmptyState>
          </Panel>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-cream-200 bg-cream-50/60 px-5 py-3 sm:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                Your record
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint tabular-nums">
                {data.length} test{data.length === 1 ? '' : 's'}
              </p>
            </div>

            <ul className="rows divide-y divide-cream-200">
              {data.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/app/tester/invitations/${item.id}`}
                    className="group grid gap-3 px-5 py-5 transition-colors duration-300 hover:bg-cream-50 sm:grid-cols-[132px_1fr] sm:gap-5 sm:px-6"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint sm:pt-1">
                      {formatDay(item.submittedAt ?? item.invitedAt)}
                    </span>

                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-ink group-hover:text-rapid-700">
                          {item.test.title || 'RAPID test'}
                        </span>
                        <Pill tone={invitationTone(item.status)}>
                          {INVITATION_LABEL[item.status] ?? item.status}
                        </Pill>
                      </span>

                      <span className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-faint">
                        <span>
                          Outcome ·{' '}
                          {item.outcome ? labelOutcome(item.outcome) : 'No response'}
                        </span>
                        {item.rewardStatus !== 'not_applicable' && (
                          <span>
                            Reward · {item.rewardStatus === 'sent' ? 'Sent' : 'Pending'}
                          </span>
                        )}
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
