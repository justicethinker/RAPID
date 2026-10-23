import type { SubmissionEnvelope } from '@/lib/submission-schema';

/**
 * Production endpoint: the RAPID Apps Script web app
 * (`integrations/google-apps-script`). Set VITE_SUBMISSIONS_ENDPOINT after
 * deployment. Until it is set, submissions fail honestly — the UI never shows
 * a confirmation for an unsaved record.
 *
 * The `.invalid` placeholder is reserved and lets local/E2E tests intercept the
 * request without touching a real sheet.
 */
const endpoint =
  (import.meta.env.VITE_SUBMISSIONS_ENDPOINT as string | undefined)?.trim() ||
  'https://example.invalid/rapid-submissions';

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

interface ScriptResponse {
  ok?: boolean;
  success?: boolean;
  result?: string;
  id?: string;
  duplicate?: boolean;
  error?: string;
  fields?: Record<string, string>;
  message?: string;
}

/**
 * Warm the Apps Script container while the visitor reads the form. Best effort;
 * an error here is ignored.
 */
export function warmSubmissions(): void {
  if (!endpoint) return;
  try {
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ warmup: '1' }),
    }).catch(() => undefined);
  } catch {
    // warming is best-effort
  }
}

function mapServerError(value: string | undefined): SubmitFailureCode {
  switch (value) {
    case 'validation':
    case 'rate_limited':
      return value;
    default:
      return 'server';
  }
}

export async function submitEnvelope(envelope: SubmissionEnvelope): Promise<SubmitResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Form-encoded so the request stays a CORS "simple request"; Apps Script
    // answers those directly instead of failing a preflight OPTIONS call.
    const body = new URLSearchParams({ payload: JSON.stringify(envelope) });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, code: 'server' };
    }

    const text = await response.text();
    let json: ScriptResponse | null = null;
    try {
      json = JSON.parse(text) as ScriptResponse;
    } catch {
      // Not JSON: treat any 2xx as a successful save.
    }

    if (!json) return { ok: true, duplicate: false };

    if (json.ok === false || json.success === false || json.result === 'error') {
      const code = mapServerError(json.error);
      return {
        ok: false,
        code,
        fields: json.fields,
        message: json.message,
      };
    }

    return {
      ok: true,
      id: json.id,
      duplicate: json.duplicate === true || json.result === 'duplicate',
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
