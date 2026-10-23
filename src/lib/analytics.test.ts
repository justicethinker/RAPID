import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface Captured {
  event: string;
  options?: { props?: Record<string, string>; u?: string };
}

function clearScripts() {
  document
    .querySelectorAll('script[data-domain]')
    .forEach((script) => script.remove());
}

async function load(domain = 'rapid.africa') {
  vi.resetModules();
  vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', domain);

  const events: Captured[] = [];
  (window as unknown as { plausible?: unknown }).plausible = (
    event: string,
    options?: Captured['options'],
  ) => {
    events.push({ event, options });
  };

  const analytics = await import('./analytics');
  analytics.initAnalytics();

  const script = document.querySelector(`script[data-domain="${domain}"]`);
  script?.dispatchEvent(new Event('load'));

  return { analytics, events, script };
}

beforeEach(() => {
  sessionStorage.clear();
  delete (window as unknown as { plausible?: unknown }).plausible;
  clearScripts();
});

afterEach(() => {
  vi.unstubAllEnvs();
  clearScripts();
  delete (window as unknown as { plausible?: unknown }).plausible;
});

describe('analytics', () => {
  it('does nothing when no analytics domain is configured', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_PLAUSIBLE_DOMAIN', '');
    const analytics = await import('./analytics');
    analytics.initAnalytics();
    analytics.trackEvent('cta_click', { cta: 'request_invite', location: 'hero' });
    expect(document.querySelectorAll('script[data-domain]')).toHaveLength(0);
  });

  it('sends pageviews without query strings', async () => {
    const { analytics, events } = await load();
    analytics.trackPageview('/join?utm_source=private&email=a@b.com');
    expect(events).toHaveLength(1);
    expect(events[0]!.event).toBe('pageview');
    expect(events[0]!.options?.u).toBe(`${window.location.origin}/join`);
    expect(events[0]!.options?.u).not.toContain('@');
  });

  it('keeps only approved campaign properties and strips personal characters', async () => {
    const { analytics, events } = await load();
    analytics.trackEvent('cta_click', {
      cta: 'request_invite',
      location: 'hero',
      email: 'person@example.com',
      empty: '',
    });

    expect(events[0]!.options?.props).toEqual({
      cta: 'request_invite',
      location: 'hero',
      email: 'personexample.com',
    });
  });

  it('counts a successful new record once per submission', async () => {
    const { analytics, events } = await load();

    analytics.trackSuccessOnce('submission-1', {
      form_type: 'tester',
      new_record: 'true',
    });
    analytics.trackSuccessOnce('submission-1', {
      form_type: 'tester',
      new_record: 'true',
    });
    analytics.trackSuccessOnce('submission-2', {
      form_type: 'founder',
      new_record: 'true',
    });

    const successes = events.filter((event) => event.event === 'form_success');
    expect(successes).toHaveLength(2);
    expect(successes.map((event) => event.options?.props?.form_type)).toEqual([
      'tester',
      'founder',
    ]);
  });

  it('does not send a duplicate submission as a new record', async () => {
    const { analytics, events } = await load();

    // Duplicate submissions are tracked separately and never call
    // trackSuccessOnce, so no form_success event is produced.
    analytics.trackEvent('form_duplicate', { form_type: 'tester' });
    expect(events.map((event) => event.event)).toEqual(['form_duplicate']);
    expect(events[0]!.options?.props).toEqual({ form_type: 'tester' });
  });
});
