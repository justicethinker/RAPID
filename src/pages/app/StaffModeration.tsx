import { useState } from 'react';
import { Flag, MessageSquare, RotateCcw, ShieldCheck } from 'lucide-react';
import { useApi, useApiClient } from '@/hooks/useApi';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { StaffModerationResponse } from '@/lib/dashboard-types';
import {
  EmptyState,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
} from '@/pages/app/Ui';
import { formatDay } from '@/pages/app/status';

export default function StaffModeration() {
  usePageMeta({ title: 'Moderation | RAPID', noindex: true });

  const { data, loading, error, refresh } =
    useApi<StaffModerationResponse>('/api/staff/moderation');
  const request = useApiClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const act = async (path: string, body: Record<string, string>) => {
    if (busy) return;
    setBusy(path);
    setActionError(null);
    try {
      await request(path, { method: 'POST', body });
      await refresh();
    } catch {
      setActionError('That action did not go through. Refresh and try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Staff"
        title="Moderation"
        description="Review reported content, hide abuse and restore items that should be public again. Every action writes an audit event."
      />

      {actionError && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger">
          {actionError}
        </div>
      )}

      {loading && !data && <Loading label="Loading moderation queue…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && (
        <>
          <Panel
            title={`Open reports (${data.reports.length})`}
            description="Reports do not hide content automatically. Hiding a post removes it from the public profile and discovery feed."
          >
            {data.reports.length === 0 ? (
              <EmptyState icon={<Flag size={20} aria-hidden="true" />} title="No open reports">
                <p>New reports from signed-in readers will appear here.</p>
              </EmptyState>
            ) : (
              <ul className="divide-y divide-cream-200">
                {data.reports.map((report) => {
                  const path = `/api/staff/moderation/reports/${report.id}`;
                  return (
                    <li key={report.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 max-w-[62ch]">
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill
                              tone={
                                report.targetType === 'post'
                                  ? 'warning'
                                  : report.targetType === 'startup'
                                    ? 'proof'
                                    : 'negative'
                              }
                            >
                              {report.targetType}
                            </Pill>
                            <span className="text-xs text-ink-faint">
                              Reported by {report.reporterName} · {formatDay(report.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-ink">
                            {report.target.title || 'Content unavailable'}
                          </p>
                          {report.target.detail && (
                            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                              {report.target.detail}
                            </p>
                          )}
                          <p className="mt-2 text-sm leading-relaxed text-ink">
                            <span className="font-semibold">Reason: </span>
                            {report.reason}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void act(path, { action: 'hide' })}
                            disabled={busy !== null}
                            className="inline-flex min-h-[40px] items-center rounded-full bg-danger px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            {busy === path
                              ? 'Working…'
                              : report.targetType === 'startup'
                                ? 'Hide profile'
                                : 'Hide content'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void act(path, { action: 'dismiss' })}
                            disabled={busy !== null}
                            className="inline-flex min-h-[40px] items-center rounded-full border border-cream-300 bg-white px-3 text-xs font-semibold text-ink transition-colors hover:bg-cream-50 disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Recent feedback"
            description="Feedback is private to the founder. Hide it if it breaks the content rules; restore it if a report was mistaken."
          >
            {data.feedback.length === 0 ? (
              <EmptyState icon={<MessageSquare size={20} aria-hidden="true" />} title="No feedback recorded">
                <p>Feedback left on published posts appears here for review.</p>
              </EmptyState>
            ) : (
              <ul className="divide-y divide-cream-200">
                {data.feedback.map((item) => {
                  const path = `/api/staff/moderation/feedback/${item.id}`;
                  return (
                    <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0 max-w-[62ch]">
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill tone={item.status === 'visible' ? 'neutral' : 'negative'}>
                            {item.status}
                          </Pill>
                          <span className="text-xs text-ink-faint">
                            {item.authorName} · {formatDay(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                          {item.body}
                        </p>
                        <p className="mt-1 text-xs text-ink-faint">On {item.post.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void act(path, {
                            action: item.status === 'visible' ? 'hide' : 'restore',
                          })
                        }
                        disabled={busy !== null}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 text-xs font-semibold text-ink transition-colors hover:bg-cream-50 disabled:opacity-50"
                      >
                        {item.status === 'visible' ? 'Hide' : 'Restore'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title={`Hidden startup profiles (${data.moderatedStartups.length})`}
            description="Hiding a reported startup unpublishes its profile and posts. Restoring publishes the profile again."
          >
            {data.moderatedStartups.length === 0 ? (
              <EmptyState icon={<ShieldCheck size={20} aria-hidden="true" />} title="No hidden startup profiles">
                <p>Startups hidden from a report will be listed here.</p>
              </EmptyState>
            ) : (
              <ul className="divide-y divide-cream-200">
                {data.moderatedStartups.map((startup) => {
                  const path = `/api/staff/moderation/startups/${startup.id}`;
                  return (
                    <li key={startup.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{startup.name}</p>
                        <p className="mt-1 text-xs text-ink-faint">
                          /{startup.slug} · hidden {formatDay(startup.moderatedAt)}
                          {startup.moderatedByName ? ` by ${startup.moderatedByName}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void act(path, { action: 'restore' })}
                        disabled={busy !== null}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 text-xs font-semibold text-ink transition-colors hover:bg-cream-50 disabled:opacity-50"
                      >
                        <RotateCcw size={13} aria-hidden="true" />
                        Restore
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title={`Hidden posts (${data.moderatedPosts.length})`}
            description="Restoring a post returns it to the founder's public profile and the discovery feed."
          >
            {data.moderatedPosts.length === 0 ? (
              <EmptyState icon={<ShieldCheck size={20} aria-hidden="true" />} title="No hidden posts">
                <p>Moderated posts will be listed here with the staff member who hid them.</p>
              </EmptyState>
            ) : (
              <ul className="divide-y divide-cream-200">
                {data.moderatedPosts.map((post) => {
                  const path = `/api/staff/moderation/posts/${post.id}`;
                  return (
                    <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{post.title}</p>
                        <p className="mt-1 text-xs text-ink-faint">
                          {post.startupName} · hidden {formatDay(post.moderatedAt)}
                          {post.moderatedByName ? ` by ${post.moderatedByName}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void act(path, { action: 'restore' })}
                        disabled={busy !== null}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 text-xs font-semibold text-ink transition-colors hover:bg-cream-50 disabled:opacity-50"
                      >
                        <RotateCcw size={13} aria-hidden="true" />
                        Restore
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
