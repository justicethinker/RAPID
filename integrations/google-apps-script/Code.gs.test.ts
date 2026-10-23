import { beforeEach, describe, expect, it } from 'vitest';
import {
  createHarness,
  founderEnvelope,
  post,
  testerEnvelope,
  type Harness,
} from './code-harness';

let harness: Harness;

beforeEach(() => {
  harness = createHarness();
});

function testerRows() {
  return harness.spreadsheet.getSheetByName('Testers')?.records() ?? [];
}

function founderRows() {
  return harness.spreadsheet.getSheetByName('Founders')?.records() ?? [];
}

describe('doGet', () => {
  it('reports the service without exposing records', () => {
    const body = JSON.parse(harness.api.doGet().getContent()) as Record<string, unknown>;
    expect(body).toEqual({ ok: true, service: 'rapid-pilot' });
  });
});

describe('tester submissions', () => {
  it('stores every valid answer with codes, labels and metadata', () => {
    const result = post(harness, testerEnvelope());
    expect(result.ok).toBe(true);
    expect(result.duplicate).toBe(false);
    expect(String(result.id)).toMatch(/^RAPID-T-\d{8}-[0-9A-F]{6}$/);

    const [row] = testerRows();
    expect(row).toBeDefined();
    expect(row!['Email']).toBe('adaeze@example.com');
    expect(row!['Status']).toBe('New');
    expect(row!['Main situation code']).toBe('employed');
    expect(row!['Primary segment']).toBe('Working adult');
    expect(row!['Interest codes']).toBe('education, technology');
    expect(row!['WhatsApp']).toBe('+2348012345678');
    expect(row!['WhatsApp reminders']).toBe('Yes');
    expect(row!['Reminder opt-in at']).not.toBe('');
    expect(row!['Contact suppression']).toBe('Active');
    expect(row!['Privacy version']).toBe('2026-10-20');
    expect(row!['Schema version']).toBe('2026-10-20');
    expect(row!['Privacy acknowledged at']).toBe('2026-10-20T10:00:00.000Z');
    expect(row!['Source']).toBe('linkedin');
    expect(row!['Landing path']).toBe('/join');
    expect(row!['Application ID']).toBe(result.id);
  });

  it('keeps one application per normalised email without overwriting it', () => {
    const first = post(harness, testerEnvelope());
    const second = post(
      harness,
      testerEnvelope({
        answers: {
          email: '  ADAEZE@Example.COM ',
          cityState: 'Abuja',
          frustration: 'A completely different answer that is long enough to pass validation.',
        },
        emailConfirm: 'adaeze@example.com',
      }),
    );

    expect(second.ok).toBe(true);
    expect(second.duplicate).toBe(true);
    expect(second.id).toBe(first.id);
    expect(testerRows()).toHaveLength(1);
    expect(testerRows()[0]!['City or state']).toBe('Lagos');
  });

  it('treats a repeated submission identifier as the same application', () => {
    const envelope = testerEnvelope();
    const first = post(harness, envelope);
    const second = post(
      harness,
      testerEnvelope({
        submissionId: envelope.submissionId,
        answers: { email: 'other@example.com' },
        emailConfirm: 'other@example.com',
      }),
    );

    expect(second.duplicate).toBe(true);
    expect(second.id).toBe(first.id);
    expect(testerRows()).toHaveLength(1);
  });

  it('accepts a blank optional phone when reminders are not requested', () => {
    const result = post(
      harness,
      testerEnvelope({
        answers: { whatsapp: '', whatsappReminders: false },
      }),
    );
    expect(result.ok).toBe(true);
    expect(testerRows()[0]!['WhatsApp']).toBe('');
    expect(testerRows()[0]!['WhatsApp reminders']).toBe('No');
    expect(testerRows()[0]!['Reminder opt-in at']).toBe('');
  });

  it('acknowledges a filled spam trap without writing a record', () => {
    const result = post(harness, testerEnvelope({ website: 'https://spam.example' }));
    expect(result.ok).toBe(true);
    expect(harness.spreadsheet.getSheetByName('Testers')).toBeNull();
  });
});

describe('server-side tester validation', () => {
  const cases: Array<[string, Record<string, unknown>, string, Record<string, unknown>?]> = [
    ['short name', { fullName: 'A' }, 'fullName'],
    ['name with digits', { fullName: 'Adaeze 2' }, 'fullName'],
    ['invalid email', { email: 'nope' }, 'email'],
    ['mismatched email', { email: 'a@example.com' }, 'emailConfirm', { emailConfirm: 'b@example.com' }],
    ['unknown age', { ageRange: '50_60' }, 'ageRange'],
    ['missing 18+ confirmation', { ageConfirmed: false }, 'ageConfirmed'],
    ['unknown situation', { mainSituation: 'retired' }, 'mainSituation'],
    ['missing school for student', { mainSituation: 'recent_graduate', school: '' }, 'school'],
    ['missing industry for worker', { industry: '' }, 'industry'],
    [
      'other industry needs a description',
      { industry: 'other', industryOther: '' },
      'industryOther',
    ],
    ['no interests', { interests: [] }, 'interests'],
    [
      'too many interests',
      { interests: ['education', 'food', 'housing', 'shopping'] },
      'interests',
    ],
    ['duplicate interests', { interests: ['education', 'education'] }, 'interests'],
    ['unknown interest', { interests: ['crypto'] }, 'interests'],
    ['short frustration', { frustration: 'a'.repeat(49) }, 'frustration'],
    ['long frustration', { frustration: 'a'.repeat(801) }, 'frustration'],
    ['phone without country code', { whatsapp: '08012345678' }, 'whatsapp'],
    [
      'reminders need a phone',
      { whatsapp: '', whatsappReminders: true },
      'whatsapp',
    ],
    ['missing privacy acknowledgement', { privacyAck: false }, 'privacyAck'],
    ['too-short city', { cityState: 'L' }, 'cityState'],
    ['other activity repeats main', { otherActivities: ['employed'] }, 'otherActivities'],
  ];

  for (const [label, answers, field, extra] of cases) {
    it(`rejects ${label}`, () => {
      const result = post(
        harness,
        testerEnvelope({
          answers,
          ...(extra as Record<string, unknown> | undefined),
        }),
      );
      expect(result.ok).toBe(false);
      expect(result.error).toBe('validation');
      expect(Object.keys(result.fields as Record<string, string>)).toContain(field);
      expect(testerRows()).toHaveLength(0);
    });
  }

  it('requires the schema, privacy version and submission identifier', () => {
    const missing = post(harness, {
      ...testerEnvelope(),
      schemaVersion: '',
      privacyVersion: '',
      submissionId: '',
    });
    expect(missing.fields).toMatchObject({
      schemaVersion: expect.any(String),
      privacyVersion: expect.any(String),
      submissionId: expect.any(String),
    });
  });
});

describe('founder submissions', () => {
  it('stores a request and normalises the phone number', () => {
    const result = post(harness, founderEnvelope());
    expect(result.ok).toBe(true);
    const [row] = founderRows();
    expect(row!['Request ID']).toBe(result.id);
    expect(row!['Status']).toBe('New');
    expect(row!['WhatsApp']).toBe('+2348012345678');
    expect(row!['Audience code']).toBe('students');
    expect(row!['Audience']).toBe('Students');
    expect(row!['Submission ID']).not.toBe('');
    expect(row!['Follow-up at']).toBe('');
  });

  it('allows a fresh request from the same phone and dedupes retries by submission ID', () => {
    const envelope = founderEnvelope();
    const first = post(harness, envelope);
    const retry = post(harness, envelope);
    expect(retry.duplicate).toBe(true);
    expect(retry.id).toBe(first.id);

    const fresh = post(harness, founderEnvelope());
    expect(fresh.duplicate).toBe(false);
    expect(founderRows()).toHaveLength(2);
  });

  it('accepts no optional email', () => {
    const result = post(harness, founderEnvelope({ answers: { email: '' } }));
    expect(result.ok).toBe(true);
    expect(founderRows()[0]!['Email']).toBe('');
  });

  const invalid: Array<[string, Record<string, unknown>, string]> = [
    ['short name', { fullName: 'T' }, 'fullName'],
    ['missing phone', { whatsapp: '' }, 'whatsapp'],
    ['phone without country code', { whatsapp: '08012345678' }, 'whatsapp'],
    ['invalid optional email', { email: 'nope' }, 'email'],
    ['short description', { testDescription: 'Short.' }, 'testDescription'],
    ['unknown audience', { audience: 'nobody' }, 'audience'],
    [
      'mixed audience needs a description',
      { audience: 'more_than_one', audienceDescription: '' },
      'audienceDescription',
    ],
    [
      'other audience needs a description',
      { audience: 'someone_else', audienceDescription: 'New' },
      'audienceDescription',
    ],
    ['missing consent', { privacyAck: false }, 'privacyAck'],
  ];

  for (const [label, answers, field] of invalid) {
    it(`rejects ${label}`, () => {
      const result = post(harness, founderEnvelope({ answers }));
      expect(result.ok).toBe(false);
      expect(result.error).toBe('validation');
      expect(Object.keys(result.fields as Record<string, string>)).toContain(field);
      expect(founderRows()).toHaveLength(0);
    });
  }

  it('rate limits the sixth request from one contact inside the window', () => {
    const results = Array.from({ length: 6 }, () => post(harness, founderEnvelope()));
    expect(results.slice(0, 5).every((result) => result.ok === true)).toBe(true);
    expect(results[5]!.ok).toBe(false);
    expect(results[5]!.error).toBe('rate_limited');
    expect(founderRows()).toHaveLength(5);
  });
});

describe('private team tools', () => {
  it('creates both sheets with the required columns', () => {
    harness.api.setup();
    const testers = harness.spreadsheet.getSheetByName('Testers');
    const founders = harness.spreadsheet.getSheetByName('Founders');
    expect(testers).not.toBeNull();
    expect(founders).not.toBeNull();

    for (const header of [
      'Application ID',
      'Status',
      'Primary segment',
      'Review reason',
      'Reviewer',
      'Review time',
      'Outcome email sent at',
      'Delivery issue',
      'Group invite sent at',
      'Joined group at',
      'Reminder opt-in at',
      'Reminder withdrawal at',
      'Contact suppression',
      'Submission ID',
    ]) {
      expect(testers!.headers()).toContain(header);
    }

    for (const header of [
      'Request ID',
      'Status',
      'Owner',
      'Follow-up at',
      'Linked test ID',
      'Submission ID',
    ]) {
      expect(founders!.headers()).toContain(header);
    }
  });

  it('exposes the export, suppression and deletion menu', () => {
    harness.api.onOpen();
    expect(harness.ui.menuItems).toEqual([
      'Export all testers (CSV)',
      'Export accepted testers (CSV)',
      'Export founder requests (CSV)',
      'Suppress tester by email…',
      'Delete tester by email…',
    ]);
  });

  it('escapes formulas, quotes and commas in exports', () => {
    post(
      harness,
      testerEnvelope({
        answers: {
          cityState: 'Lagos, Island',
          frustration:
            '=HYPERLINK("https://evil.example","click") plus enough text to pass the length rule.',
        },
      }),
    );

    const sheet = harness.spreadsheet.getSheetByName('Testers')!;
    expect(sheet.records()[0]!['WhatsApp']).toBe('+2348012345678');
    expect(sheet.records()[0]!['Recent frustration'].startsWith("'=")).toBe(true);

    harness.api.setCell_(sheet, sheet.headers(), 2, 'Status', 'Accepted');
    harness.api.exportInvitations_();

    const csv = harness.files.at(-1)!.content;
    expect(csv).toContain('"Lagos, Island"');
    expect(csv).not.toContain(',=HYPERLINK');
    expect(harness.api.csvCell_('=1+1')).toBe("'=1+1");
    expect(harness.api.csvCell_('+2348012345678')).toBe("'+2348012345678");
    expect(harness.api.csvCell_('hello "there", friend')).toBe('"hello ""there"", friend"');
    expect(harness.api.safeCell_('+2348012345678')).toBe('+2348012345678');
  });

  it('excludes suppressed and non-accepted testers from the invitation export', () => {
    post(harness, testerEnvelope());
    post(
      harness,
      testerEnvelope({
        answers: { email: 'second@example.com' },
        emailConfirm: 'second@example.com',
      }),
    );

    const sheet = harness.spreadsheet.getSheetByName('Testers')!;
    harness.api.setCell_(sheet, sheet.headers(), 2, 'Status', 'Accepted');
    harness.api.setCell_(sheet, sheet.headers(), 3, 'Status', 'Needs clarification');

    harness.api.exportInvitations_();
    const csv = harness.files.at(-1)!.content;
    const lines = csv.trim().split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('adaeze@example.com');
  });

  it('suppresses a tester and stops reminders', () => {
    post(harness, testerEnvelope());
    harness.ui.promptResponse = '  ADAEZE@example.com ';
    harness.api.suppressTester_();

    const row = testerRows()[0]!;
    expect(row['Status']).toBe('Withdrawn');
    expect(row['Contact suppression']).toBe('Suppressed');
    expect(row['WhatsApp reminders']).toBe('No');
    expect(row['Reminder withdrawal at']).not.toBe('');

    harness.api.exportInvitations_();
    expect(harness.files.at(-1)!.content.trim().split('\r\n')).toHaveLength(1);
  });

  it('deletes a tester row after confirmation', () => {
    post(harness, testerEnvelope());
    harness.ui.promptResponse = 'adaeze@example.com';
    harness.ui.alertConfirm = true;
    harness.api.deleteTester_();
    expect(testerRows()).toHaveLength(0);
  });

  it('keeps the row when deletion is cancelled', () => {
    post(harness, testerEnvelope());
    harness.ui.promptResponse = 'adaeze@example.com';
    harness.ui.alertConfirm = false;
    harness.api.deleteTester_();
    expect(testerRows()).toHaveLength(1);
  });
});
