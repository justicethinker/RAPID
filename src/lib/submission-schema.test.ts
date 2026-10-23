import { describe, expect, it } from 'vitest';
import {
  buildFounderSubmission,
  buildTesterSubmission,
  emptyFounderValues,
  emptyTesterValues,
  founderSchema,
  normalisePhone,
  testerSchema,
  type FounderFormValues,
  type TesterFormValues,
} from './submission-schema';

function validTester(overrides: Partial<TesterFormValues> = {}): TesterFormValues {
  return {
    ...emptyTesterValues(),
    fullName: 'Adaeze Okafor',
    email: 'Adaeze@Example.com',
    emailConfirm: 'adaeze@example.COM',
    country: 'NG',
    cityState: 'Lagos',
    ageRange: '25_29',
    ageConfirmed: true,
    mainSituation: 'employed',
    industry: 'technology',
    interests: ['education', 'technology'],
    frustration:
      'I spent forty minutes waiting for a bus after class and could not find a reliable timetable anywhere.',
    whatsapp: '+234 801 234 5678',
    whatsappReminders: true,
    hearAbout: 'friend',
    privacyAck: true,
    ...overrides,
  };
}

function validFounder(overrides: Partial<FounderFormValues> = {}): FounderFormValues {
  return {
    ...emptyFounderValues(),
    fullName: 'Tunde Bello',
    whatsapp: '+2348012345678',
    email: 'tunde@example.com',
    testDescription: 'I want to learn whether students would pre-order lunch before a campus rush.',
    audience: 'students',
    privacyAck: true,
    ...overrides,
  };
}

function testerIssues(values: TesterFormValues) {
  const result = testerSchema.safeParse(values);
  return result.success ? [] : result.error.issues;
}

function founderIssues(values: FounderFormValues) {
  const result = founderSchema.safeParse(values);
  return result.success ? [] : result.error.issues;
}

describe('testerSchema', () => {
  it('accepts a complete application and ignores email case', () => {
    expect(testerSchema.safeParse(validTester()).success).toBe(true);
  });

  it('accepts accents and common name punctuation, but not digits', () => {
    expect(
      testerSchema.safeParse(validTester({ fullName: "Chinwe Àdébáyọ̀-O'Neill." })).success,
    ).toBe(true);
    expect(testerIssues(validTester({ fullName: 'Adaeze 2' })).some((i) => i.path[0] === 'fullName')).toBe(true);
  });

  it('requires matching email addresses', () => {
    const issues = testerIssues(validTester({ emailConfirm: 'other@example.com' }));
    expect(issues.some((i) => i.path[0] === 'emailConfirm')).toBe(true);
  });

  it('rejects an invalid email and an over-long email', () => {
    expect(testerIssues(validTester({ email: 'not-an-email', emailConfirm: 'not-an-email' })).some((i) => i.path[0] === 'email')).toBe(true);
    const long = `${'a'.repeat(250)}@example.com`;
    expect(testerIssues(validTester({ email: long, emailConfirm: long })).some((i) => i.path[0] === 'email')).toBe(true);
  });

  it('requires the separate 18+ confirmation', () => {
    expect(testerIssues(validTester({ ageConfirmed: false })).some((i) => i.path[0] === 'ageConfirmed')).toBe(true);
  });

  it('requires 1–3 unique interests and rejects unknown codes', () => {
    expect(testerIssues(validTester({ interests: [] })).some((i) => i.path[0] === 'interests')).toBe(true);
    expect(
      testerIssues(validTester({ interests: ['education', 'food', 'housing', 'shopping'] })).some(
        (i) => i.path[0] === 'interests',
      ),
    ).toBe(true);
    expect(
      testerIssues(validTester({ interests: ['education', 'education'] })).some(
        (i) => i.path[0] === 'interests',
      ),
    ).toBe(true);
    expect(
      testerIssues(validTester({ interests: ['not-a-code'] })).some(
        (i) => i.path[0] === 'interests',
      ),
    ).toBe(true);
  });

  it('makes school required for undergraduate or recent-graduate situations', () => {
    expect(
      testerIssues(
        validTester({ mainSituation: 'recent_graduate', industry: '', school: '' }),
      ).some((i) => i.path[0] === 'school'),
    ).toBe(true);
    expect(
      testerSchema.safeParse(
        validTester({ mainSituation: 'recent_graduate', industry: '', school: 'University of Lagos' }),
      ).success,
    ).toBe(true);
    expect(
      testerSchema.safeParse(
        validTester({ mainSituation: 'employed', otherActivities: ['early_undergraduate'], school: 'UNILAG' }),
      ).success,
    ).toBe(true);
  });

  it('makes industry required for employed or self-employed situations', () => {
    expect(testerIssues(validTester({ industry: '' })).some((i) => i.path[0] === 'industry')).toBe(true);
    expect(
      testerSchema.safeParse(
        validTester({ mainSituation: 'other', otherActivities: ['entrepreneur'], industry: 'retail' }),
      ).success,
    ).toBe(true);
    expect(
      testerIssues(validTester({ industry: 'other', industryOther: '' })).some(
        (i) => i.path[0] === 'industryOther',
      ),
    ).toBe(true);
  });

  it('does not let other activities repeat the main situation', () => {
    expect(
      testerIssues(validTester({ otherActivities: ['employed'] })).some(
        (i) => i.path[0] === 'otherActivities',
      ),
    ).toBe(true);
  });

  it('enforces the 50–800 character frustration answer', () => {
    expect(testerIssues(validTester({ frustration: 'Too short.' })).some((i) => i.path[0] === 'frustration')).toBe(true);
    expect(
      testerSchema.safeParse(validTester({ frustration: 'a'.repeat(801) })).success,
    ).toBe(false);
    expect(
      testerSchema.safeParse(validTester({ frustration: ` ${'a'.repeat(60)} ` })).success,
    ).toBe(true);
  });

  it('accepts a blank optional phone but validates a supplied one', () => {
    expect(testerSchema.safeParse(validTester({ whatsapp: '', whatsappReminders: false })).success).toBe(true);
    expect(testerIssues(validTester({ whatsapp: '08012345678' })).some((i) => i.path[0] === 'whatsapp')).toBe(true);
    expect(
      testerIssues(validTester({ whatsapp: '', whatsappReminders: true })).some(
        (i) => i.path[0] === 'whatsapp',
      ),
    ).toBe(true);
  });

  it('requires the privacy acknowledgement', () => {
    expect(testerIssues(validTester({ privacyAck: false })).some((i) => i.path[0] === 'privacyAck')).toBe(true);
  });
});

describe('founderSchema', () => {
  it('accepts a complete founder request with no email', () => {
    expect(founderSchema.safeParse(validFounder({ email: '' })).success).toBe(true);
  });

  it('requires a valid WhatsApp number', () => {
    expect(founderIssues(validFounder({ whatsapp: '08012345678' })).some((i) => i.path[0] === 'whatsapp')).toBe(true);
    expect(founderSchema.safeParse(validFounder({ whatsapp: '+44 7700 900123' })).success).toBe(true);
  });

  it('validates an optional email when supplied', () => {
    expect(founderIssues(validFounder({ email: 'nope' })).some((i) => i.path[0] === 'email')).toBe(true);
  });

  it('requires 20–500 characters and the privacy acknowledgement', () => {
    expect(founderIssues(validFounder({ testDescription: 'Short.' })).some((i) => i.path[0] === 'testDescription')).toBe(true);
    expect(founderIssues(validFounder({ privacyAck: false })).some((i) => i.path[0] === 'privacyAck')).toBe(true);
  });

  it('requires a description for mixed or unknown audiences only', () => {
    expect(
      founderIssues(validFounder({ audience: 'more_than_one', audienceDescription: '' })).some(
        (i) => i.path[0] === 'audienceDescription',
      ),
    ).toBe(true);
    expect(
      founderIssues(validFounder({ audience: 'someone_else', audienceDescription: 'New' })).some(
        (i) => i.path[0] === 'audienceDescription',
      ),
    ).toBe(true);
    expect(founderSchema.safeParse(validFounder({ audience: 'recent_graduates' })).success).toBe(true);
  });
});

describe('normalisePhone', () => {
  it('converts common pasted formats to E.164-style strings', () => {
    expect(normalisePhone('+234 801 234 5678')).toBe('+2348012345678');
    expect(normalisePhone('2348012345678')).toBe('+2348012345678');
    expect(normalisePhone('')).toBe('');
  });
});

describe('submission payloads', () => {
  const meta = {
    submissionId: '00000000-0000-4000-8000-000000000000',
    acknowledgedAt: '2026-10-20T10:00:00.000Z',
    source: { source: 'linkedin', medium: 'social', campaign: 'pilot', landingPath: '/join' },
  };

  it('stores codes and labels, normalises contact data, and never stores confirm email', () => {
    const payload = buildTesterSubmission(
      validTester({ whatsapp: '+234 801 234 5678', industry: 'technology', industryOther: 'ignored' }),
      meta,
    );

    expect(payload.formType).toBe('tester');
    expect(payload.answers.email).toBe('adaeze@example.com');
    expect(payload.emailConfirm).toBe('adaeze@example.com');
    expect(payload.answers).not.toHaveProperty('emailConfirm');
    expect(payload.answers.whatsapp).toBe('+2348012345678');
    expect(payload.answers.industryOther).toBe('');
    expect(payload.labels.primarySegment).toBe('Working adult');
    expect(payload.labels.interests).toEqual(['Education', 'Technology']);
    expect(payload.labels.country).toBe('Nigeria');
    expect(payload.source).toEqual(meta.source);
  });

  it('removes other-interest text when Other is not selected', () => {
    const payload = buildTesterSubmission(
      validTester({ interests: ['education'], interestsOther: 'private note' }),
      meta,
    );
    expect(payload.answers.interestsOther).toBe('');
  });

  it('builds a founder payload and drops audience detail when not needed', () => {
    const payload = buildFounderSubmission(
      validFounder({
        email: '',
        audience: 'students',
        audienceDescription: 'ignored',
      }),
      meta,
    );
    expect(payload.formType).toBe('founder');
    expect(payload.answers.email).toBe('');
    expect(payload.answers.audienceDescription).toBe('');
    expect(payload.labels.audience).toBe('Students');
    expect(payload.answers).not.toHaveProperty('emailConfirm');
  });
});
