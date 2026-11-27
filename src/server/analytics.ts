import { one, query } from './db';
import { ApiError, readJson } from './http';
import { clientIp, enforceRateLimit, hashKey } from './rate-limit';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_TYPES = new Set(['profile_view', 'post_impression', 'post_open']);
const SOURCES = new Set([
  'discover',
  'external',
  'direct',
  'unknown',
  'startup_page',
]);
const VISITOR_RE = /^[A-Za-z0-9_-]{8,80}$/;

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Public, first-party organic analytics. The browser sends a random key it
 * created and keeps locally; the server stores no IP address or account ID.
 * The unique index counts each visitor once per item per day, so refreshing a
 * page does not inflate a view.
 */
export async function recordAudienceEvent(request: Request) {
  const body = await readJson<{
    startupId?: unknown;
    postId?: unknown;
    eventType?: unknown;
    visitorKey?: unknown;
    source?: unknown;
  }>(request);

  const startupId = text(body.startupId, 40);
  const postId = text(body.postId, 40);
  const eventType = text(body.eventType, 30);
  const visitorKey = text(body.visitorKey, 80);
  const requestedSource = text(body.source, 20);
  const source = SOURCES.has(requestedSource) ? requestedSource : 'unknown';

  if (!UUID_RE.test(startupId)) throw new ApiError(404, 'not_found');
  if (!EVENT_TYPES.has(eventType) || !VISITOR_RE.test(visitorKey)) {
    throw new ApiError(400, 'bad_request');
  }
  if (eventType === 'profile_view' && postId) {
    throw new ApiError(400, 'bad_request');
  }
  if (eventType !== 'profile_view' && !UUID_RE.test(postId)) {
    throw new ApiError(404, 'not_found');
  }

  const startup = await one<{ id: string }>(
    `select id from startups
      where id = $1 and visibility = 'published'`,
    [startupId],
  );
  if (!startup) throw new ApiError(404, 'not_found');

  if (eventType !== 'profile_view') {
    const post = await one<{ id: string }>(
      `select p.id
         from posts p
         join startups s on s.id = p.startup_id
        where p.id = $1
          and p.startup_id = $2
          and p.status = 'published'
          and p.moderated_at is null
          and s.visibility = 'published'`,
      [postId, startupId],
    );
    if (!post) throw new ApiError(404, 'not_found');
  }

  const ip = clientIp(request);
  await enforceRateLimit(`analytics:visitor:${hashKey(visitorKey)}`, 120, 60);
  if (ip) await enforceRateLimit(`analytics:ip:${hashKey(ip)}`, 300, 60);

  await query(
    `insert into audience_events (startup_id, post_id, event_type, visitor_key, source)
     values ($1, $2, $3, $4, $5)
     on conflict do nothing`,
    [startup.id, eventType === 'profile_view' ? null : postId, eventType, visitorKey, source],
  );

  return { recorded: true };
}
