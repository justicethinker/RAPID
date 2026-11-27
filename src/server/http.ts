export type ErrorCode =
  | 'bad_request'
  | 'validation'
  | 'unauthorized'
  | 'email_unverified'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields?: Record<string, string>;

  constructor(status: number, code: ErrorCode, fields?: Record<string, string>) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...init.headers,
    },
  });
}

export function fail(
  status: number,
  code: ErrorCode,
  fields?: Record<string, string>,
): Response {
  return json({ error: code, fields }, { status });
}

const MAX_BODY_BYTES = 64 * 1024;

export async function readJson<T>(request: Request): Promise<T> {
  const length = Number(request.headers.get('content-length') ?? '0');
  if (length > MAX_BODY_BYTES) throw new ApiError(413, 'bad_request');

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new ApiError(413, 'bad_request');
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(400, 'bad_request');
  }
}

export function methodNotAllowed(): Response {
  return fail(405, 'not_found');
}
