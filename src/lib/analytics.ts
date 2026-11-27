/**
 * Privacy-safe analytics.
 *
 * Plausible is only loaded when VITE_PLAUSIBLE_DOMAIN is configured. Events
 * carry field codes, route paths and approved campaign tags only — never names,
 * email addresses, phone numbers, written answers or raw tracking URLs.
 *
 * `script.manual.js` disables automatic pageviews, so this module sends every
 * pageview itself using a pathname (query strings never reach analytics).
 */

const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
const scriptSrc =
  (import.meta.env.VITE_PLAUSIBLE_SRC as string | undefined) ||
  'https://plausible.io/js/script.manual.js';

type Props = Record<string, string>;
type PlausibleOptions = { props?: Props; u?: string };
type Plausible = (event: string, options?: PlausibleOptions) => void;

const pending: { event: string; options?: PlausibleOptions }[] = [];
let initialised = false;
let ready = false;

function plausible(): Plausible | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { plausible?: Plausible }).plausible;
}

function flush(): void {
  const fn = plausible();
  if (!fn) return;
  ready = true;
  while (pending.length) {
    const next = pending.shift();
    if (!next) break;
    try {
      fn(next.event, next.options);
    } catch {
      // ignore
    }
  }
}

export function initAnalytics(): void {
  if (!domain || initialised || typeof document === 'undefined') return;
  initialised = true;

  const script = document.createElement('script');
  script.defer = true;
  script.src = scriptSrc;
  script.dataset.domain = domain;
  script.addEventListener('load', flush);
  document.head.appendChild(script);
}

function send(event: string, options?: PlausibleOptions): void {
  if (!domain) return;
  const fn = plausible();
  if (ready && fn) {
    try {
      fn(event, options);
    } catch {
      // analytics must never break a form
    }
    return;
  }
  if (pending.length < 20) pending.push({ event, options });
}

function safeProp(value: string): string {
  return value.replace(/[^\w .:/-]/g, '').slice(0, 60);
}

export function trackEvent(name: string, props?: Props): void {
  const clean: Props = {};
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value) clean[safeProp(key)] = safeProp(value);
  }
  send(name, { props: clean });
}

/** Pageviews use the pathname only — no query string, no personal data. */
export function trackPageview(pathname: string): void {
  if (typeof window === 'undefined') return;
  // Defence in depth: never forward a query string, even if a caller passes a
  // full URL by mistake.
  const bare = pathname.split(/[?#]/)[0] ?? '/';
  const path = bare.startsWith('/') ? bare : `/${bare}`;

  // Account surfaces stay out of analytics entirely.
  if (
    path === '/app' ||
    path.startsWith('/app/') ||
    path === '/staff' ||
    path.startsWith('/staff/') ||
    path.startsWith('/sign-in') ||
    path.startsWith('/sign-up')
  ) {
    return;
  }

  send('pageview', { u: `${window.location.origin}${path}` });
}

/**
 * Count a successful new record once per submission. A retry or a duplicated
 * tester application must not inflate sign-ups.
 */
export function trackSuccessOnce(
  submissionId: string,
  props: Record<string, string>,
): void {
  const key = `rapid_analytics_success_${submissionId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // If storage is unavailable, still send the event once for this page.
  }
  trackEvent('form_success', props);
}
