import { beforeEach, describe, expect, it } from 'vitest';
import { getAttribution } from './attribution';

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('getAttribution', () => {
  it('keeps approved tags and never the raw tracking URL', () => {
    window.history.replaceState(
      {},
      '',
      '/join?utm_source=LinkedIn&utm_medium=social&utm_campaign=pilot-1&email=secret%40example.com',
    );

    expect(getAttribution()).toEqual({
      source: 'LinkedIn',
      medium: 'social',
      campaign: 'pilot-1',
      landingPath: '/join',
    });
  });

  it('falls back to direct/none when tags are missing', () => {
    window.history.replaceState({}, '', '/founders');
    expect(getAttribution()).toEqual({
      source: 'direct',
      medium: 'none',
      campaign: 'none',
      landingPath: '/founders',
    });
  });

  it('is first-touch for the rest of the session', () => {
    window.history.replaceState({}, '', '/join?utm_source=friend&utm_medium=referral');
    expect(getAttribution().source).toBe('friend');

    window.history.replaceState({}, '', '/founders?utm_source=linkedin');
    expect(getAttribution()).toMatchObject({
      source: 'friend',
      medium: 'referral',
      landingPath: '/join',
    });
  });

  it('strips unapproved characters from tag values', () => {
    window.history.replaceState(
      {},
      '',
      '/?utm_source=%3Cscript%3Ealert(1)%3C%2Fscript%3E&utm_campaign=spring%20sale!',
    );
    const attribution = getAttribution();
    expect(attribution.source).not.toContain('<');
    expect(attribution.source).not.toContain('(');
    expect(attribution.campaign).not.toContain('!');
    expect(attribution.landingPath).toBe('/');
  });
});
