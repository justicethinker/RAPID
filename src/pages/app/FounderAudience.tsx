import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MessageSquare, MousePointerClick, Users } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { FounderAudienceResponse } from '@/lib/dashboard-types';
import {
  EmptyState,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
  Stat,
} from '@/pages/app/Ui';
import { formatDay } from '@/pages/app/status';

function dayLabel(date: string): string {
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
  }).format(value);
}

export default function FounderAudience() {
  usePageMeta({ title: 'Audience | RAPID', noindex: true });

  const [range, setRange] = useState<7 | 30 | 90>(30);
  const { data, loading, error, refresh } = useApi<FounderAudienceResponse>(
    `/api/founder/audience?range=${range}`,
  );
  const startup = data?.startup ?? null;
  const analytics = data?.analytics;

  const trackedTotal = analytics
    ? analytics.profileViews + analytics.postImpressions + analytics.postOpens
    : 0;
  const dailyMax = Math.max(
    1,
    ...(analytics?.daily ?? []).map((day) =>
      Math.max(day.profileViews, day.postImpressions, day.postOpens),
    ),
  );

  const trend = data?.followers.trend ?? [];
  const trendMax = Math.max(1, ...trend.map((point) => point.count));
  const trendTotal = trend.reduce((total, point) => total + point.count, 0);

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Founder workspace"
        title="Audience"
        description="Real people who followed your startup, joined the waitlist or left feedback. Organic interest is not the same as screened research evidence."
      >
        {startup?.visibility === 'published' && (
          <a
            href={`${window.location.origin}/startup/${startup.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream-300 bg-white px-4 text-sm font-semibold text-ink hover:border-rapid-600 hover:bg-cream-50"
          >
            View public page
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        )}
      </PageHeading>

      {loading && !data && <Loading label="Loading your audience…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && !startup && (
        <Panel>
          <EmptyState icon={<Users size={20} aria-hidden="true" />} title="Your audience starts with a startup profile">
            <p>Publish your profile and share the link. Followers, waitlist registrations and feedback will appear here.</p>
            <Link
              to="/app/founder/startup"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400"
            >
              Set up startup
            </Link>
          </EmptyState>
        </Panel>
      )}

      {data && startup && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Followers"
              value={data.followers.count}
              hint={data.followers.count === 0 ? 'No followers yet' : 'Signed-in people following you'}
            />
            <Stat
              label="Feedback"
              value={data.feedback.count}
              hint={data.feedback.count === 0 ? 'No feedback yet' : 'Visible notes from your posts'}
            />
            <Stat
              label="Waitlist"
              value={data.count}
              hint={data.count === 0 ? 'No registrations yet' : 'People who agreed to be contacted'}
            />
            <Stat
              label="Demo clicks"
              value={data.demoClicks}
              hint={data.demoClicks === 0 ? 'No product clicks yet' : 'Tracked visits to your product link'}
            />
          </div>

          <Panel
            title="Organic analytics"
            description={`First-party visits and post activity over the last ${range} days. Each visitor is counted once per item per day.`}
            action={
              <label className="text-xs font-semibold text-ink-soft">
                Period{' '}
                <select
                  value={range}
                  onChange={(event) =>
                    setRange(Number(event.target.value) as 7 | 30 | 90)
                  }
                  className="ml-1 min-h-[36px] rounded-lg border border-cream-300 bg-white px-2 text-xs font-semibold text-ink"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </label>
            }
          >
            {analytics && trackedTotal === 0 ? (
              <EmptyState
                icon={<MousePointerClick size={20} aria-hidden="true" />}
                title="No tracked visits in this period"
              >
                <p>
                  Profile views and post impressions appear here after people
                  open your published profile or see a post in Discover. These
                  are organic interactions, not screened research evidence.
                </p>
              </EmptyState>
            ) : analytics ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Profile views" value={analytics.profileViews} />
                  <Stat label="Post impressions" value={analytics.postImpressions} />
                  <Stat label="Post opens" value={analytics.postOpens} />
                  <Stat
                    label="Unique visitors"
                    value={analytics.uniqueVisitors}
                    hint="Anonymous browsers, not accounts"
                  />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_230px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-ink-soft">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rapid-600" aria-hidden="true" />
                        Profile views
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rapid-400" aria-hidden="true" />
                        Post impressions
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rapid-400" aria-hidden="true" />
                        Post opens
                      </span>
                    </div>
                    <div className="mt-3 flex h-28 items-end gap-1 overflow-x-auto pb-1" aria-hidden="true">
                      {analytics.daily.map((day) => (
                        <div
                          key={day.date}
                          className="flex min-w-[8px] flex-1 items-end justify-center gap-[2px]"
                          title={`${day.date}: ${day.profileViews} profile views, ${day.postImpressions} impressions, ${day.postOpens} opens`}
                        >
                          {[
                            ['bg-rapid-600', day.profileViews],
                            ['bg-rapid-400', day.postImpressions],
                            ['bg-rapid-400', day.postOpens],
                          ].map(([colour, count]) => (
                            <span
                              key={String(colour)}
                              className={`w-[3px] rounded-t ${colour}`}
                              style={{
                                height: `${Math.max(
                                  Number(count) === 0 ? 1 : 4,
                                  (Number(count) / dailyMax) * 100,
                                )}%`,
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-ink-soft">
                      {range} days, ending today. Hover a bar for the exact daily count.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cream-200 bg-cream-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                      Profile-view sources
                    </p>
                    {analytics.sources.length === 0 ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                        No profile-visit attribution yet.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {analytics.sources.map((source) => (
                          <li key={source.source} className="flex items-center justify-between gap-3 text-xs">
                            <span className="capitalize text-ink-soft">
                              {source.source.replaceAll('_', ' ')}
                            </span>
                            <span className="font-semibold text-ink tabular-nums">
                              {source.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </Panel>

          <Panel
            title="Follower trend"
            description="New follows over the last 14 days. People who unfollowed are not counted twice."
          >
            {trendTotal === 0 ? (
              <EmptyState icon={<Users size={20} aria-hidden="true" />} title="No new followers in this period">
                <p>
                  {startup.visibility === 'published'
                    ? 'Share your public link to start building an audience.'
                    : 'Publish your startup profile so people can follow it.'}
                </p>
              </EmptyState>
            ) : (
              <div>
                <div className="flex h-32 items-end gap-1.5" aria-hidden="true">
                  {trend.map((point) => (
                    <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                      <span
                        className="w-full rounded-t bg-sun-500"
                        style={{
                          height: `${Math.max(
                            point.count === 0 ? 2 : 8,
                            (point.count / trendMax) * 100,
                          )}%`,
                        }}
                      />
                      <span className="text-[9px] font-semibold text-ink-faint">
                        {dayLabel(point.date).split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink-soft">
                  {trendTotal} new follower{trendTotal === 1 ? '' : 's'} in the last 14 days.
                  {' '}Busiest day: {trendMax} new follower{trendMax === 1 ? '' : 's'}.
                </p>
              </div>
            )}
          </Panel>

          <Panel
            title="Recent feedback"
            description="Notes people left on your published posts. Only you and RAPID staff can read them. Hidden abuse is removed from this list."
          >
            {data.feedback.items.length === 0 ? (
              <EmptyState icon={<MessageSquare size={20} aria-hidden="true" />} title="No feedback yet">
                <p>
                  Publish a showcase post and ask one clear question. Feedback arrives from signed-in readers.
                </p>
              </EmptyState>
            ) : (
              <ul className="divide-y divide-cream-200">
                {data.feedback.items.map((item) => (
                  <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{item.authorName}</p>
                      <span className="text-xs text-ink-faint">
                        {formatDay(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                    <p className="mt-2 text-xs text-ink-faint">
                      On{' '}
                      <Link
                        to={`/startup/${startup.slug}#post-${item.post.id}`}
                        className="font-semibold text-rapid-700 underline underline-offset-2"
                      >
                        {item.post.title}
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Post engagement"
            description="Impressions and opens are organic activity. Feedback is not a measure of demand."
          >
            {data.posts.length === 0 ? (
              <EmptyState icon={<MousePointerClick size={20} aria-hidden="true" />} title="No published posts yet">
                <p>Published posts appear here with their feedback count.</p>
                <Link
                  to="/app/founder/posts"
                  className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400"
                >
                  Go to posts
                </Link>
              </EmptyState>
            ) : (
              <ul className="divide-y divide-cream-200">
                {data.posts.map((post) => (
                  <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link
                        to={`/startup/${startup.slug}#post-${post.id}`}
                        className="text-sm font-semibold text-ink hover:text-rapid-700"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 text-xs text-ink-faint">
                        {post.publishedAt
                          ? `Published ${formatDay(post.publishedAt)}`
                          : 'Published'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="neutral">{post.impressions} impressions</Pill>
                      <Pill tone="neutral">{post.opens} opens</Pill>
                      <Pill tone="neutral">{post.feedbackCount} feedback</Pill>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Waitlist registrations"
            description="Only people who agreed to be contacted about this startup are listed here. The email is visible to you, not to the public."
          >
            {data.recent.length === 0 ? (
              <EmptyState icon={<Mail size={20} aria-hidden="true" />} title="No waitlist sign-ups yet">
                {startup.visibility === 'published' ? (
                  <p>
                    Share your public link with early users. New registrations will appear here with their source.
                  </p>
                ) : (
                  <p>Publish your startup profile and share the link to start collecting sign-ups.</p>
                )}
              </EmptyState>
            ) : (
              <ul className="divide-y divide-cream-200">
                {data.recent.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{entry.name || entry.email}</p>
                      {entry.name && <p className="mt-0.5 break-all text-sm text-ink-soft">{entry.email}</p>}
                      <p className="mt-1 text-xs text-ink-faint">Joined {formatDay(entry.createdAt)}</p>
                    </div>
                    <Pill tone="neutral">{entry.source || 'Direct link'}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
