import type { WaitlistFormData } from './schema';

// Waitlist signups are collected in Google Sheets via a Google Apps Script
// web app. The endpoint accepts form-encoded POSTs of { name, email, source }.
const DEFAULT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyxL0VvqLQm1zZL9yB2Vpq0GuiYOUOXaorP27TN1BQDw_Ss1jrs27dyFYM8TCXWdzLF/exec';

const endpoint =
  (import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined) || DEFAULT_ENDPOINT;

/**
 * Kick a throwaway request at the endpoint when the dialog opens so the
 * Apps Script container is already warm by the time the real submit lands.
 * Google's cold start is the single biggest chunk of submit latency, and
 * the user needs a few seconds to type their name and email anyway.
 * The script answers "name and email are required" — we ignore the reply.
 */
export function warmWaitlist(): void {
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

export interface SubmitResult {
  ok: boolean;
  duplicate?: boolean;
  error?: string;
}

interface ScriptResponse {
  result?: string;
  success?: boolean;
  duplicate?: boolean;
  error?: string;
  message?: string;
}

export async function submitWaitlist(data: WaitlistFormData): Promise<SubmitResult> {
  if (!endpoint) {
    return { ok: false, error: 'The waitlist endpoint is not configured.' };
  }

  try {
    // Form-encoded so the request stays a CORS "simple request": Apps Script
    // answers those directly, instead of failing a preflight OPTIONS call.
    const body = new URLSearchParams({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      source: getSource() ?? '',
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `The waitlist service responded with ${res.status}. Please try again.`,
      };
    }

    // Apps Script replies with JSON when coded to; tolerate plain text/HTML
    // too: any 2xx without an explicit failure counts as a successful join.
    const text = await res.text();
    try {
      const json = JSON.parse(text) as ScriptResponse;
      if (json.duplicate || json.result === 'duplicate') {
        return { ok: true, duplicate: true };
      }
      if (json.success === false || json.result === 'error') {
        return { ok: false, error: json.error || json.message || '' };
      }
    } catch {
      // Not JSON — treat the 2xx as success.
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error.' };
  }
}

function getSource(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) return ref.trim().slice(0, 40);
    const host = window.location.hostname;
    return host ? host.slice(0, 40) : null;
  } catch {
    return null;
  }
}
