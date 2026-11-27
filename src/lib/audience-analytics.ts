const VISITOR_KEY = 'rapid_audience_visitor_v1';
const VISITOR_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

/**
 * A random, browser-local key used only to avoid counting the same visitor
 * more than once per item per day. It is not linked to an account, email or
 * IP address and does not leave this site.
 */
export function getVisitorKey(): string {
  if (typeof window === 'undefined') return 'server-side';

  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && VISITOR_PATTERN.test(existing)) return existing;

    const created =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    if (VISITOR_PATTERN.test(created)) {
      window.localStorage.setItem(VISITOR_KEY, created);
      return created;
    }
  } catch {
    // Storage can be blocked. A per-load key is still anonymous; it simply
    // cannot deduplicate across reloads.
  }

  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export type AudienceEventType = 'profile_view' | 'post_impression' | 'post_open';
export type AudienceSource =
  | 'discover'
  | 'external'
  | 'direct'
  | 'unknown'
  | 'startup_page';

/**
 * Record an organic interaction. Analytics must never block reading or opening
 * a post, so this is deliberately fire-and-forget and ignores failures.
 */
export function trackAudienceEvent(input: {
  startupId: string;
  eventType: AudienceEventType;
  source: AudienceSource;
  postId?: string | null;
}): void {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify({
    startupId: input.startupId,
    postId: input.postId ?? undefined,
    eventType: input.eventType,
    visitorKey: getVisitorKey(),
    source: input.source,
  });

  try {
    void fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // The page still works when analytics is unavailable.
  }
}

/**
 * Map the current landing URL to a small allow-listed attribution label. Raw
 * query values and referrer URLs are never sent to the server.
 */
export function currentAudienceSource(): AudienceSource {
  if (typeof window === 'undefined') return 'unknown';

  const params = new URLSearchParams(window.location.search);
  const tag = (params.get('ref') ?? params.get('utm_source') ?? '').toLowerCase();
  if (tag === 'discover') return 'discover';
  if (tag) return 'external';

  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.origin !== window.location.origin) return 'external';
    } catch {
      return 'unknown';
    }
  }

  return 'direct';
}
