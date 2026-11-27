import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Mail,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';
import { FeedbackForm } from '@/components/ui/FeedbackForm';
import { LinkedTestButton } from '@/components/ui/LinkedTestButton';
import { PostImpressionMarker } from '@/components/ui/PostImpressionMarker';
import { ReportForm } from '@/components/ui/ReportForm';
import { useSession } from '@/auth/session';
import { useApiClient } from '@/hooks/useApi';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ApiError, api } from '@/lib/api';
import {
  currentAudienceSource,
  trackAudienceEvent,
} from '@/lib/audience-analytics';
import { cn } from '@/lib/cn';
import type { PublicStartupResponse } from '@/lib/dashboard-types';
import { startupCategoryLabel, startupStageLabel } from '@/lib/startup-options';
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

export default function PublicStartup() {
  const { slug } = useParams();
  return <StartupProfile key={slug} slug={slug} />;
}

function StartupProfile({ slug }: { slug: string | undefined }) {
  const { status } = useSession();
  const request = useApiClient();
  const [data, setData] = useState<PublicStartupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [joined, setJoined] = useState<'new' | 'already' | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const following = data?.startup.following ?? false;
  const followers = data?.startup.followers ?? 0;
  const [followPending, setFollowPending] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);

  const startup = data?.startup ?? null;
  const publicStartupId = startup?.id;
  const publicStartupOwner = startup?.isOwner;

  useEffect(() => {
    if (!publicStartupId || publicStartupOwner) return;
    trackAudienceEvent({
      startupId: publicStartupId,
      eventType: 'profile_view',
      source: currentAudienceSource(),
    });
  }, [publicStartupId, publicStartupOwner]);

  // A copied post link includes an anchor. The posts arrive after the first
  // paint, so the browser's built-in hash scroll can run before the article
  // exists. Move to it once the public profile has rendered.
  useEffect(() => {
    if (!startup || !window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }, [startup]);

  usePageMeta({
    title: startup ? `${startup.name} | RAPID` : 'Startup profile | RAPID',
    description: startup?.description ?? 'A startup building in public with RAPID.',
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    request<PublicStartupResponse>(`/api/startups/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (cancelled) return;
        setLoadError(null);
        setNotFound(false);
        setData(response);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        if (cause instanceof ApiError && cause.status === 404) {
          setNotFound(true);
        } else {
          setLoadError('We could not load this startup. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [request, slug]);

  const toggleFollow = async () => {
    if (!startup || followPending) return;
    setFollowPending(true);
    setFollowError(null);
    try {
      const result = await request<{ following: boolean; followers: number }>(
        `/api/startups/${startup.id}/follow`,
        { method: following ? 'DELETE' : 'POST' },
      );
      setData(current => current && ({ ...current, startup: { ...current.startup, ...result } }));
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setFollowError('Your session expired. Sign in again to follow this startup.');
      } else if (cause instanceof ApiError && cause.status === 409) {
        setFollowError('You cannot follow your own startup.');
      } else {
        setFollowError(
          'We could not update your follow. Check your connection and try again.',
        );
      }
    } finally {
      setFollowPending(false);
    }
  };

  const trackDemoClick = () => {
    if (!startup) return;
    const source =
      new URLSearchParams(window.location.search).get('ref')?.slice(0, 60) ||
      'startup_page';
    // Recording the click must never delay or block the product link.
    void request(`/api/startups/${startup.id}/demo-click`, {
      method: 'POST',
      body: { source },
    }).catch(() => undefined);
  };

  const joinWaitlist = async (event: FormEvent) => {
    event.preventDefault();
    if (pending || !slug) return;

    const nextFields: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextFields.email = 'Enter a valid email address.';
    }
    if (!consent) {
      nextFields.consent = 'Please agree to be contacted about this startup.';
    }
    if (Object.keys(nextFields).length) {
      setFields(nextFields);
      setWaitlistError(null);
      return;
    }

    const source =
      new URLSearchParams(window.location.search).get('utm_source')?.slice(0, 60) ||
      new URLSearchParams(window.location.search).get('ref')?.slice(0, 60) ||
      'startup_page';

    setPending(true);
    setFields({});
    setWaitlistError(null);
    try {
      const result = await api<{ ok: boolean; alreadyJoined: boolean }>(
        `/api/startups/${encodeURIComponent(slug)}/waitlist`,
        {
          method: 'POST',
          body: {
            email: email.trim(),
            name: name.trim() || null,
            consent: true,
            source,
          },
        },
      );
      setJoined(result.alreadyJoined ? 'already' : 'new');
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) {
        setFields(cause.fields);
        setWaitlistError('Check the highlighted fields and try again.');
      } else if (cause instanceof ApiError && cause.status === 429) {
        setWaitlistError('Too many attempts. Please try again in a few minutes.');
      } else {
        setWaitlistError('We could not add you to the waitlist. Check your connection and try again.');
      }
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Container className="py-24">
          <p role="status" className="flex items-center gap-2 text-ink-soft">
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            Loading startup…
          </p>
        </Container>
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell>
        <Container className="py-24">
          <div role="alert" className="max-w-[560px] rounded-2xl border border-danger/30 bg-danger-50 p-6 text-danger">
            <p className="font-semibold">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full border border-danger/30 bg-white px-4 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        </Container>
      </PageShell>
    );
  }

  if (notFound || !startup) {
    return (
      <PageShell>
        <Container className="py-20 sm:py-28">
          <p className="kicker">Startup profile</p>
          <h1 className="t-section mt-3 max-w-[700px] text-ink">This startup is not public.</h1>
          <p className="lead mt-4 max-w-[55ch]">
            The link may be out of date, or the founder has not published their profile yet.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400"
          >
            Back to RAPID
          </Link>
        </Container>
      </PageShell>
    );
  }

  const publicUrl = window.location.href;
  const category = startupCategoryLabel(startup.category);
  const stage = startupStageLabel(startup.stage);

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-cream-100">
        <div
          aria-hidden="true"
          className="paper-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-55"
        />
        <Container className="relative py-12 sm:py-20 lg:py-24">
          {startup.coverUrl && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 shadow-[0_12px_35px_#1d4a2b12] sm:mb-10">
              <img
                src={startup.coverUrl}
                alt={`${startup.name} cover image`}
                className="h-40 w-full object-cover sm:h-56"
              />
            </div>
          )}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-16">
            <div className="hero-stagger min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow-pill">Startup profile</span>
                <span className="rounded-full border border-cream-300 bg-cream-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  {category}
                </span>
                {stage && (
                  <span className="rounded-full border border-cream-300 bg-cream-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {stage}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {startup.logoUrl && (
                  <img
                    src={startup.logoUrl}
                    alt={`${startup.name} logo`}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-cream-300 bg-cream-50 object-cover shadow-sm sm:h-20 sm:w-20"
                  />
                )}
                <h1 className="t-section max-w-[700px] text-ink">{startup.name}</h1>
              </div>
              <p className="lead mt-5 max-w-[58ch] whitespace-pre-line">{startup.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {startup.websiteUrl && (
                  <a
                    href={startup.websiteUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={trackDemoClick}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink transition-colors hover:bg-sun-400"
                  >
                    Visit product
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                )}

                {!startup.isOwner && status === 'signed_in' && (
                  <button
                    type="button"
                    onClick={() => void toggleFollow()}
                    disabled={followPending}
                    aria-pressed={following}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-rapid-300 bg-cream-50 px-5 text-sm font-semibold text-rapid-900 transition-colors hover:border-rapid-700 hover:bg-white disabled:opacity-60"
                  >
                    {following ? (
                      <UserCheck size={16} aria-hidden="true" />
                    ) : (
                      <UserPlus size={16} aria-hidden="true" />
                    )}
                    {followPending
                      ? 'Saving…'
                      : following
                        ? 'Following'
                        : 'Follow'}
                  </button>
                )}

                {!startup.isOwner && status === 'signed_out' && (
                  <Link
                    to="/sign-in"
                    state={{
                      from: `${window.location.pathname}${window.location.search}`,
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-rapid-300 bg-cream-50 px-5 text-sm font-semibold text-rapid-900 transition-colors hover:border-rapid-700 hover:bg-white"
                  >
                    <UserPlus size={16} aria-hidden="true" />
                    Follow
                  </Link>
                )}

                {startup.isOwner && (
                  <Link
                    to="/app/founder/startup"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-rapid-300 bg-cream-50 px-5 text-sm font-semibold text-rapid-900 transition-colors hover:border-rapid-700 hover:bg-white"
                  >
                    Manage startup
                  </Link>
                )}

                <CopyLinkButton url={publicUrl} label="Share this page" />

                {!startup.isOwner && (
                  <ReportForm targetType="startup" targetId={startup.id} />
                )}
              </div>

              {followError && (
                <p role="alert" className="mt-3 text-xs font-semibold text-danger">
                  {followError}
                </p>
              )}

              <p className="mt-4 text-xs font-semibold text-ink-faint">
                {followers} follower{followers === 1 ? '' : 's'} ·{' '}
                {startup.posts.length} published post
                {startup.posts.length === 1 ? '' : 's'}
              </p>

              <p className="mt-6 max-w-[54ch] border-t border-cream-200 pt-5 text-[13px] leading-relaxed text-ink-faint">
                This startup is sharing what it is building in public. Join the waitlist to hear about what
                comes next.
              </p>
            </div>

            <aside
              id="join-waitlist"
              className="h-fit scroll-mt-24 rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-[0_12px_35px_#1d4a2b12] sm:p-6"
            >
              {joined ? (
                <div aria-live="polite">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rapid-50">
                    <CheckCircle2 size={23} className="text-rapid-700" aria-hidden="true" />
                  </span>
                  <h2 className="font-display mt-4 text-[24px] font-bold tracking-[-0.03em] text-ink">
                    {joined === 'already' ? 'You’re already on the list.' : 'You’re on the list.'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {joined === 'already'
                      ? 'This email is already registered for updates from this startup.'
                      : `We’ll use your email to share updates from ${startup.name}. No spam.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setJoined(null);
                      setEmail('');
                      setName('');
                      setConsent(false);
                    }}
                    className="mt-5 min-h-[44px] text-sm font-semibold text-rapid-700 underline underline-offset-2"
                  >
                    Add another email
                  </button>
                </div>
              ) : (
                <>
                  <p className="kicker">Early interest</p>
                  <h2 className="font-display mt-2 text-[26px] font-bold leading-[1.05] tracking-[-0.04em] text-ink">
                    Join the waitlist.
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Get updates about the product and what the team is learning.
                  </p>

                  <form onSubmit={(event) => void joinWaitlist(event)} noValidate className="mt-5 space-y-3">
                    {waitlistError && (
                      <p role="alert" className="rounded-lg border border-danger/30 bg-danger-50 px-3 py-2 text-xs font-semibold text-danger">
                        {waitlistError}
                      </p>
                    )}

                    <div>
                      <label htmlFor="waitlist-name" className="block text-xs font-semibold text-ink">
                        Name <span className="font-normal text-ink-faint">(optional)</span>
                      </label>
                      <input
                        id="waitlist-name"
                        name="name"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={80}
                        className={`${inputClass} py-2.5 text-sm`}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="waitlist-email" className="block text-xs font-semibold text-ink">
                        Email
                      </label>
                      <input
                        id="waitlist-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={`${inputClass} py-2.5 text-sm`}
                        aria-invalid={fields.email ? true : undefined}
                        aria-describedby={fields.email ? 'waitlist-email-error' : undefined}
                        placeholder="you@example.com"
                      />
                      {fields.email && (
                        <p id="waitlist-email-error" role="alert" className="mt-1.5 text-xs font-semibold text-danger">
                          {fields.email}
                        </p>
                      )}
                    </div>

                    <label className="flex cursor-pointer items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-rapid-700"
                        aria-invalid={fields.consent ? true : undefined}
                      />
                      <span className="text-[11px] leading-relaxed text-ink-soft">
                        I agree to be contacted about this startup. See the{' '}
                        <Link to="/privacy" className="font-semibold text-rapid-700 underline underline-offset-2">
                          privacy notice
                        </Link>
                        .
                      </span>
                    </label>
                    {fields.consent && (
                      <p role="alert" className="text-xs font-semibold text-danger">
                        {fields.consent}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={pending}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-sun-500 px-4 text-sm font-bold text-ink transition-colors hover:bg-sun-400 disabled:opacity-60"
                    >
                      {pending ? (
                        <>
                          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                          Joining
                        </>
                      ) : (
                        <>
                          <Mail size={15} aria-hidden="true" />
                          Join waitlist
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-cream-50 py-14 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-cream-200 pb-5">
            <div>
              <p className="kicker">From the founder</p>
              <h2 className="font-display mt-2 text-[28px] font-bold tracking-[-0.04em] text-ink sm:text-[34px]">
                Building in public.
              </h2>
            </div>
            <p className="max-w-[34ch] text-sm leading-relaxed text-ink-soft">
              Published updates from {startup.name}. New posts appear here as the team shares them.
            </p>
          </div>

          {startup.posts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-cream-200 bg-white p-6">
              <p className="text-sm leading-relaxed text-ink-soft">
                No posts have been published yet. Join the waitlist to hear when the next update is ready.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {startup.posts.map((post) => (
                <article
                  key={post.id}
                  id={`post-${post.id}`}
                  className="scroll-mt-24 rounded-2xl border border-cream-200 bg-white p-6 sm:p-8"
                >
                  <PostImpressionMarker
                    startupId={startup.id}
                    postId={post.id}
                    source="startup_page"
                    disabled={startup.isOwner}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-rapid-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-rapid-700">
                      {post.kind === 'validation' ? 'Validation' : 'Showcase'}
                    </span>
                    <span className="text-xs text-ink-faint">{formatPublished(post.publishedAt)}</span>
                  </div>
                  <h2 className="font-display mt-4 text-[24px] font-bold leading-[1.1] tracking-[-0.035em] text-ink">
                    {post.title}
                  </h2>
                  {post.images.length > 0 && (
                    <div
                      className={
                        post.images.length === 1
                          ? 'mt-4'
                          : 'mt-4 grid grid-cols-2 gap-2'
                      }
                    >
                      {post.images.map((image, index) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt={image.altText ?? `Image ${index + 1} for ${post.title}`}
                          loading="lazy"
                          className={cn(
                            'w-full rounded-xl border border-cream-200 object-cover',
                            post.images.length === 1
                              ? 'max-h-[420px]'
                              : index === 0 && post.images.length >= 3
                                ? 'col-span-2 aspect-[16/9]'
                                : 'aspect-[16/9]',
                          )}
                        />
                      ))}
                    </div>
                  )}
                  <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.75] text-ink-soft">
                    {post.body}
                  </p>

                  {post.linkedTest && (
                    <div className="mt-5 rounded-xl border border-cream-300 bg-cream-50 p-4 sm:p-5">
                      <p className="kicker">Linked test</p>
                      <h3 className="font-display mt-1.5 text-[18px] font-bold tracking-[-0.02em] text-ink">
                        {post.linkedTest.title || 'Validation test'}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-faint">
                        RAPID runs this test with invited participants. An
                        invitation checks that you match the audience before you
                        take part.
                      </p>
                      {post.eligibility && (
                        <p className="mt-3 text-sm leading-relaxed text-ink-faint">
                          <span className="font-semibold text-ink">Who it is for: </span>
                          {post.eligibility}
                        </p>
                      )}
                      {post.closesAt && (
                        <p className="mt-2 text-xs font-semibold text-ink-faint">
                          Participation closes {formatPublished(post.closesAt)}
                        </p>
                      )}
                      <div className="mt-4">
                        {startup.isOwner ? (
                          <Link
                            to={`/app/founder/tests/${post.linkedTest.id}`}
                            className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-rapid-300 bg-white px-4 text-sm font-semibold text-rapid-900 transition-colors hover:border-rapid-700"
                          >
                            Manage this test
                            <ArrowUpRight size={15} aria-hidden="true" />
                          </Link>
                        ) : (
                          <LinkedTestButton postId={post.id} />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 border-t border-cream-200 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CopyLinkButton
                        url={`${publicUrl.split('#')[0]}#post-${post.id}`}
                        label="Copy post link"
                      />
                      <ReportForm targetType="post" targetId={post.id} />
                    </div>
                    {!startup.isOwner && (
                      <div className="mt-5 rounded-xl border border-cream-200 bg-cream-50 p-4">
                        <FeedbackForm postId={post.id} />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </PageShell>
  );
}
