import { describe, expect, it } from 'vitest';
import { applicationStatus, toneClasses } from './application-status';

describe('applicationStatus', () => {
  it('gives every known status a label, sentence and tone', () => {
    for (const code of [
      'received',
      'under_review',
      'approved',
      'waitlisted',
      'declined',
      'withdrawn',
    ]) {
      const status = applicationStatus(code);
      expect(status.label.length).toBeGreaterThan(0);
      expect(status.sentence.length).toBeGreaterThan(20);
      expect(toneClasses(status.tone)).toContain('bg-');
    }
  });

  it('falls back to a readable label for an unknown status', () => {
    const status = applicationStatus('manual_hold');
    expect(status.label).toBe('manual hold');
    expect(status.tone).toBe('neutral');
  });

  it('does not describe an application as approved unless it is', () => {
    expect(applicationStatus('received').label).not.toBe('Approved');
    expect(applicationStatus('declined').tone).toBe('negative');
    expect(applicationStatus('approved').tone).toBe('positive');
  });
});
