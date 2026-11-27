import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Loader2,
  MessageSquare,
  Search,
  Users,
  RefreshCw,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';
import { PostImpressionMarker } from '@/components/ui/PostImpressionMarker';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ApiError, api } from '@/lib/api';
import { trackAudienceEvent } from '@/lib/audience-analytics';
import type { DiscoveryFeedResponse, FeedItem } from '@/lib/dashboard-types';
import { STARTUP_CATEGORIES, startupCategoryLabel } from '@/lib/startup-options';
import { inputClass } from '@/pages/app/Ui';

function formatPublished(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function excerpt(body: string): string {
  const clean = body.trim();
  return clean.length > 280 ? `${clean.slice(0, 280).trimEnd()}…` : clean;
}

function feedQuery(q: string, category: string, type: string, cursor?: string): string {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (type) params.set('type', type);
  if (cursor) params.set('cursor', cursor);
  const value = params.toString();
  return `/api/discover/feed${value ? `?${value}` : ''}`;
}

export default function Discover() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const type = params.get('type') ?? '';

  return <DiscoverFeed key={params.toString()} q={q} category={category} type={type} params={params} setParams={setParams} />;
}

function DiscoverFeed({ q, category, type, params, setParams }: {
  q: string; category: string; type: string;
  params: URLSearchParams; setParams: ReturnType<typeof useSearchParams>[1];
}) {
  const [search, setSearch] = useState(q);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: 'Discover startups building in public | RAPID',
    description:
      'Browse recent posts from startups in Nigeria. Read what founders are building, follow their progress and share honest feedback.',
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    api<DiscoveryFeedResponse>(feedQuery(q, category, type), {
      signal: controller.signal,
    })
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setNextCursor(response.nextCursor);
      })
      .catch((cause: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        setError(
          cause instanceof ApiError && cause.status === 400
            ? 'Those filters are not valid. Reset them and try again.'
            : 'We could not load the feed. Check your connection and try again.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [q, category, type]);

  const updateFilters = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateFilters({ q: search.trim() });
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await api<DiscoveryFeedResponse>(
        feedQuery(q, category, type, nextCursor),
      );
      setItems((current) => [...current, ...response.items]);
      setNextCursor(response.nextCursor);
    } catch {
      setError('We could not load more posts. Try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = Boolean(q || category || type);

  const trackPostOpen = (post: FeedItem) => {
    if (post.isOwner) return;
    trackAudienceEvent({
      startupId: post.startup.id,
      postId: post.id,
      eventType: 'post_open',
      source: 'discover',
    });
  };

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-cream-100">
        <div
          aria-hidden="true"
          className="paper-grid pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-55"
        />
        <Container className="relative py-12 sm:py-16 lg:py-20">
          <p className="kicker">Discover</p>
          <h1 className="t-display mt-5 max-w-[860px] text-ink">
            See what founders are <span className="t-serif text-rapid-700">building right now.</span>
          </h1>
          <p className="lead mt-5 max-w-[58ch]">
            Read public updates from startups, follow the ones you care about and
            tell founders what you think. No account needed to browse.
          </p>

          <form
            onSubmit={onSubmit}
            role="search"
            className="mt-8 rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-[0_12px_35px_#1d4a2b12] sm:p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="discover-search"
                  className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft"
                >
                  Search posts
                </label>
                <div className="relative mt-1.5">
                  <Search
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
                  />
                  <input
                    id="discover-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    maxLength={80}
                    placeholder="Try “payments”, “delivery” or a startup name"
                    className={`${inputClass} mt-0 pl-10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
                <div>
                  <label
                    htmlFor="discover-category"
                    className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft"
                  >
                    Category
                  </label>
                  <select
                    id="discover-category"
                    value={category}
                    onChange={(event) =>
                      updateFilters({ category: event.target.value })
                    }
                    className={`${inputClass} mt-1.5 min-w-[150px] py-2.5`}
                  >
                    <option value="">All categories</option>
                    {STARTUP_CATEGORIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="discover-type"
                    className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft"
                  >
                    Post type
                  </label>
                  <select
                    id="discover-type"
                    value={type}
                    onChange={(event) =>
                      updateFilters({ type: event.target.value })
                    }
                    className={`${inputClass} mt-1.5 min-w-[150px] py-2.5`}
                  >
                    <option value="">All posts</option>
                    <option value="showcase">Showcase</option>
                    <option value="validation">Validation</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink transition-colors hover:bg-sun-400"
              >
                Search
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>

            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setParams(new URLSearchParams(), { replace: true });
                }}
                className="mt-3 text-xs font-semibold text-ink-soft underline underline-offset-2 hover:text-ink"
              >
                Clear filters
              </button>
            )}
          </form>
        </Container>
      </section>

      <section className="bg-cream-50 py-10 sm:py-14">
        <Container>
          {loading && (
            <p role="status" className="flex items-center gap-2 text-ink-soft">
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              Loading posts…
            </p>
          )}

          {!loading && error && (
            <div role="alert" className="flex max-w-[640px] gap-4 rounded-[24px] bg-white p-6 shadow-elev-1 ring-1 ring-cream-200 sm:p-8">
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun-100 text-sun-700">
                <RefreshCw size={20} />
              </span>
              <div>
                <p className="font-display text-[20px] font-bold tracking-[-0.015em] text-ink">The feed is taking a breather.</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-rapid-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-rapid-800"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="rounded-[24px] bg-white p-8 shadow-elev-1 ring-1 ring-cream-200">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.03em] text-ink">
                {filtered ? 'No posts match those filters.' : 'No public posts yet.'}
              </h2>
              <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-ink-soft">
                {filtered
                  ? 'Try a different search, category or post type.'
                  : 'When founders publish an update it will appear here. Check back soon.'}
              </p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-6">
              {items.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-2xl border border-cream-200 bg-white"
                >
                  <PostImpressionMarker
                    startupId={post.startup.id}
                    postId={post.id}
                    source="discover"
                    disabled={post.isOwner}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200/80 px-5 py-4 sm:px-6">
                    <Link
                      to={`/startup/${post.startup.slug}?ref=discover`}
                      className="group flex min-w-0 items-center gap-3"
                    >
                      {post.startup.logoUrl ? (
                        <img
                          src={post.startup.logoUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-xl border border-cream-200 object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rapid-50 text-sm font-extrabold text-rapid-700"
                        >
                          {post.startup.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-ink group-hover:text-rapid-700">
                          {post.startup.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                          {startupCategoryLabel(post.startup.category)}
                        </span>
                      </span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-rapid-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-rapid-700">
                        {post.kind === 'validation' ? 'Validation' : 'Showcase'}
                      </span>
                      <span className="text-xs text-ink-faint">
                        {formatPublished(post.publishedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="min-w-0 px-5 py-5 sm:px-6 sm:py-6">
                      <h2 className="font-display text-[24px] font-bold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[28px]">
                        <Link
                          to={`/startup/${post.startup.slug}?ref=discover#post-${post.id}`}
                          onClick={() => trackPostOpen(post)}
                          className="hover:text-rapid-700"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-ink-soft">
                        {excerpt(post.body)}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-soft">
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquare size={14} aria-hidden="true" />
                          {post.feedbackCount} feedback
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} aria-hidden="true" />
                          {post.startup.followers} followers
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Link
                          to={`/startup/${post.startup.slug}?ref=discover#post-${post.id}`}
                          onClick={() => trackPostOpen(post)}
                          className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-sun-500 px-4 text-sm font-semibold text-ink transition-colors hover:bg-sun-400"
                        >
                          Read and respond
                          <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                        <CopyLinkButton
                          url={`${window.location.origin}/startup/${post.startup.slug}?ref=discover#post-${post.id}`}
                          label="Share post"
                        />
                      </div>
                    </div>

                    {post.images[0] && (
                      <div className="border-t border-cream-200 md:border-l md:border-t-0">
                        <img
                          src={post.images[0].url}
                          alt={
                            post.images[0].altText ??
                            `Image for ${post.title}`
                          }
                          loading="lazy"
                          className="h-48 w-full object-cover md:h-full"
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {nextCursor && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                    className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-cream-300 bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-rapid-600 hover:bg-cream-50 disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                        Loading
                      </>
                    ) : (
                      'Load more posts'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
    </PageShell>
  );
}
