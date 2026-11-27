// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DEV_AUTH_SECRET = 'unit-test-secret';

let signDevSession: typeof import('./auth').signDevSession;
let readDevSession: typeof import('./auth').readDevSession;

beforeAll(async () => {
  ({ signDevSession, readDevSession } = await import('./auth'));
});

describe('local development session', () => {
  it('round-trips a person id', () => {
    const value = signDevSession('person-123');
    expect(readDevSession(value)).toBe('person-123');
  });

  it('rejects a tampered id', () => {
    const value = signDevSession('person-123');
    const tampered = value.replace('person-123', 'person-124');
    expect(readDevSession(tampered)).toBeNull();
  });

  it('rejects a missing or malformed cookie', () => {
    expect(readDevSession(undefined)).toBeNull();
    expect(readDevSession('')).toBeNull();
    expect(readDevSession('no-signature')).toBeNull();
  });
});
