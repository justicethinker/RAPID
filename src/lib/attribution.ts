import type { Attribution } from '@/lib/submission-schema';

const KEY = 'rapid_attribution_v1';

function clean(value: string | null, fallback: string): string {
  if (!value) return fallback;
  return value.replace(/[^\w.-]/g, '').slice(0, 60) || fallback;
}

/**
 * First-touch attribution for the session. Landing path is a pathname only;
 * the query string is parsed for approved campaign tags and never stored raw.
 */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') {
    return { source: 'direct', medium: 'none', campaign: 'none', landingPath: '/' };
  }

  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Attribution>;
      if (parsed.source && parsed.medium && parsed.campaign && parsed.landingPath) {
        return {
          source: parsed.source,
          medium: parsed.medium,
          campaign: parsed.campaign,
          landingPath: parsed.landingPath,
        };
      }
    }
  } catch {
    // ignore malformed storage
  }

  const params = new URLSearchParams(window.location.search);
  const attribution: Attribution = {
    source: clean(params.get('utm_source') ?? params.get('ref'), 'direct'),
    medium: clean(params.get('utm_medium'), 'none'),
    campaign: clean(params.get('utm_campaign'), 'none'),
    landingPath: window.location.pathname.slice(0, 120) || '/',
  };

  try {
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // attribution still works for this page load
  }

  return attribution;
}
