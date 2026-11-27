import type { SubmissionEnvelope } from '@/lib/submission-schema';

const TIMEOUT_MS = 25_000;

export type SubmitFailureCode =
  | 'validation'
  | 'rate_limited'
  | 'network'
  | 'timeout'
  | 'server'
  | 'not_configured';

export type SubmitResult =
  | { ok: true; id?: string; duplicate: boolean }
  | {
      ok: false;
      code: SubmitFailureCode;
      fields?: Record<string, string>;
      message?: string;
    };

interface ApiResponse {
  reference?: string;
  duplicate?: boolean;
  error?: string;
  fields?: Record<string, string>;
}

function mapError(value: string | undefined): SubmitFailureCode {
  switch (value) {
    case 'validation':
    case 'rate_limited':
      return value;
    default:
      return 'server';
  }
}

/** Warm the API while the visitor reads the form. Best effort. */
export function warmSubmissions(): void {
  try {
    void fetch('/api/health', { cache: 'no-store' }).catch(() => undefined);
  } catch {
    // warming is best-effort
  }
}

export async function submitEnvelope(
  envelope: SubmissionEnvelope,
  options: { token?: string | null } = {},
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.token) headers.authorization = `Bearer ${options.token}`;

    const response = await fetch(`/api/applications/${envelope.formType}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });

    let json: ApiResponse | null = null;
    try {
      json = (await response.json()) as ApiResponse;
    } catch {
      json = null;
    }

    if (!response.ok) {
      return {
        ok: false,
        code: mapError(json?.error),
        fields: json?.fields,
      };
    }

    return {
      ok: true,
      id: json?.reference,
      duplicate: json?.duplicate === true,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, code: 'timeout' };
    }
    return { ok: false, code: 'network' };
  } finally {
    clearTimeout(timeout);
  }
}
