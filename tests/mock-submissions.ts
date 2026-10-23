import type { Page, Route } from '@playwright/test';

export interface Envelope {
  formType: 'tester' | 'founder';
  schemaVersion: string;
  privacyVersion: string;
  submissionId: string;
  acknowledgedAt: string;
  source: Record<string, string>;
  answers: Record<string, unknown>;
  labels: Record<string, unknown>;
  emailConfirm?: string;
  website?: string;
}

export interface MockReply {
  status?: number;
  body: unknown;
}

export interface EndpointMock {
  envelopes: Envelope[];
  warmups: number;
}

export async function mockSubmissions(
  page: Page,
  reply: (envelope: Envelope, index: number) => MockReply | Promise<MockReply>,
): Promise<EndpointMock> {
  const state: EndpointMock = { envelopes: [], warmups: 0 };

  await page.route('https://example.invalid/rapid-submissions', async (route: Route) => {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'POST',
          'access-control-allow-headers': 'content-type',
        },
      });
      return;
    }

    const params = new URLSearchParams(request.postData() ?? '');

    if (params.get('warmup') === '1') {
      state.warmups += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ ok: true, warm: true }),
      });
      return;
    }

    let envelope: Envelope;
    try {
      envelope = JSON.parse(params.get('payload') ?? '{}') as Envelope;
    } catch {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ ok: false, error: 'bad_request' }),
      });
      return;
    }

    state.envelopes.push(envelope);
    const result = await reply(envelope, state.envelopes.length - 1);

    await route.fulfill({
      status: result.status ?? 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(result.body),
    });
  });

  return state;
}

export const testerAnswers = {
  fullName: 'Adaeze Okafor',
  email: 'adaeze@example.com',
  emailConfirm: 'adaeze@example.com',
  country: 'NG',
  cityState: 'Lagos',
  ageRange: '25_29',
  ageConfirmed: true,
  mainSituation: 'employed',
  otherActivities: [] as string[],
  school: '',
  industry: 'technology',
  industryOther: '',
  interests: ['education', 'technology'],
  interestsOther: '',
  frustration:
    'I spent forty minutes waiting for a bus after class and could not find a reliable timetable anywhere.',
  whatsapp: '+234 801 234 5678',
  whatsappReminders: true,
  hearAbout: 'friend',
  privacyAck: true,
  website: '',
};

export const founderAnswers = {
  fullName: 'Tunde Bello',
  whatsapp: '+234 801 234 5678',
  email: 'tunde@example.com',
  testDescription:
    'I want to learn whether students would pre-order lunch before a campus rush.',
  audience: 'students',
  audienceDescription: '',
  privacyAck: true,
  website: '',
};

export async function fillTester(page: Page, overrides: Partial<typeof testerAnswers> = {}) {
  const values = { ...testerAnswers, ...overrides };

  await page.locator('#tester-full-name').fill(values.fullName);
  await page.locator('#tester-email').fill(values.email);
  await page.locator('#tester-email-confirm').fill(values.emailConfirm);
  await page.locator('#tester-country').selectOption(values.country);
  await page.locator('#tester-city').fill(values.cityState);
  await page.locator('#tester-age').selectOption(values.ageRange);
  if (values.ageConfirmed) await page.locator('#tester-age-confirm').check();
  await page.locator('#tester-main-situation').selectOption(values.mainSituation);

  for (const activity of values.otherActivities) {
    await page.locator(`#tester-other-activities-${activity}`).check();
  }

  if (values.school) await page.locator('#tester-school').fill(values.school);
  if (values.industry) {
    await page.locator('#tester-industry').selectOption(values.industry);
    if (values.industry === 'other' && values.industryOther) {
      await page.locator('#tester-industry-other').fill(values.industryOther);
    }
  }

  for (const interest of values.interests) {
    await page.locator(`#tester-interests-${interest}`).check();
  }
  if (values.interests.includes('other') && values.interestsOther) {
    await page.locator('#tester-interests-other').fill(values.interestsOther);
  }

  await page.locator('#tester-frustration').fill(values.frustration);
  if (values.whatsapp) await page.locator('#tester-whatsapp').fill(values.whatsapp);
  if (values.whatsappReminders) await page.locator('#tester-whatsapp-reminders').check();
  if (values.hearAbout) await page.locator('#tester-hear-about').selectOption(values.hearAbout);
  if (values.privacyAck) await page.locator('#tester-privacy').check();
}

export async function fillFounder(
  page: Page,
  overrides: Partial<typeof founderAnswers> = {},
) {
  const values = { ...founderAnswers, ...overrides };

  await page.locator('#founder-full-name').fill(values.fullName);
  await page.locator('#founder-whatsapp').fill(values.whatsapp);
  if (values.email) await page.locator('#founder-email').fill(values.email);
  await page.locator('#founder-test-description').fill(values.testDescription);
  await page.locator(`#founder-audience-${values.audience}`).check();
  if (values.audienceDescription) {
    await page.locator('#founder-audience-description').fill(values.audienceDescription);
  }
  if (values.privacyAck) await page.locator('#founder-privacy').check();
}
