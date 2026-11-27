import { createHash } from 'node:crypto';
import { one } from './db';
import { ApiError } from './http';

export function hashKey(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 40);
}

/**
 * Counts a hit in a fixed window. Durable across serverless instances because
 * the count lives in Postgres rather than process memory.
 */
export async function enforceRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const row = await one<{ hits: number }>(
    `insert into rate_limits (bucket, window_start, hits)
     values (
       $1,
       to_timestamp(floor(extract(epoch from now()) / $2) * $2),
       1
     )
     on conflict (bucket, window_start)
     do update set hits = rate_limits.hits + 1
     returning hits`,
    [bucket, windowSeconds],
  );

  if (!row) throw new ApiError(500, 'server');
  if (row.hits > limit) throw new ApiError(429, 'rate_limited');
}

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || null;
  return request.headers.get('x-real-ip')?.trim() || null;
}

export async function enforceApplicationLimits(
  request: Request,
  contact: string,
): Promise<void> {
  await enforceRateLimit(`application:contact:${hashKey(contact.toLowerCase())}`, 5, 600);

  const ip = clientIp(request);
  if (ip) {
    await enforceRateLimit(`application:ip:${hashKey(ip)}`, 15, 600);
  }
}
