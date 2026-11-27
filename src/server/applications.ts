import { one, query } from './db';
import { sendEmail } from './email';
import { ApiError } from './http';
import { notify, notifyStaff } from './notify';
import { enforceApplicationLimits } from './rate-limit';
import {
  normaliseEmail,
  normalisePhone,
  type SubmissionEnvelope,
} from '../lib/submission-schema';
import { validateFounder, validateTester } from './validate';

export interface ApplicationResult {
  reference: string;
  duplicate: boolean;
}

interface AccountContact {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
}

/**
 * A signed-in submission belongs to that account, never to a supplied address.
 * The caller passes the id resolved from a verified session.
 */
async function accountContact(personId: string): Promise<AccountContact> {
  const account = await one<AccountContact>(
    `select id, email, full_name, phone
       from people
      where id = $1 and state = 'active'`,
    [personId],
  );
  if (!account) throw new ApiError(401, 'unauthorized');
  return account;
}

/** Fill gaps on the account record from the answers, never overwrite them. */
async function fillAccountContact(
  personId: string,
  fullName: string,
  phone: string | null,
): Promise<void> {
  await query(
    `update people
        set full_name = case when full_name = '' then $2 else full_name end,
            phone = coalesce(phone, $3),
            updated_at = now()
      where id = $1`,
    [personId, fullName, phone],
  );
}

async function upsertPerson(email: string, fullName: string, phone: string | null) {
  const rows = await query<{ id: string }>(
    `insert into people (email, full_name, phone)
     values ($1, $2, $3)
     on conflict (lower(email)) do update
       set full_name = case when people.full_name = '' then excluded.full_name else people.full_name end,
           phone = coalesce(people.phone, excluded.phone),
           updated_at = now()
     returning id`,
    [email, fullName, phone],
  );
  const id = rows[0]?.id;
  if (!id) throw new ApiError(500, 'server');
  return id;
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === '23505',
  );
}

export async function submitTesterApplication(
  request: Request,
  envelope: SubmissionEnvelope,
  origin: string,
  accountId?: string,
): Promise<ApplicationResult> {
  if (envelope.website) {
    return { reference: envelope.submissionId, duplicate: false };
  }

  const validation = validateTester(envelope);
  if (!validation.ok) throw new ApiError(422, 'validation', validation.fields);
  const values = validation.values;
  const account = accountId ? await accountContact(accountId) : null;
  const submittedEmail = normaliseEmail(values.email);
  const email = account ? normaliseEmail(account.email) : submittedEmail;

  if (account && submittedEmail !== email) {
    throw new ApiError(422, 'validation', {
      email: 'Use the email on your account, or sign out and apply with a different address.',
    });
  }

  await enforceApplicationLimits(request, email);

  const existing = account
    ? await one<{ submission_id: string }>(
        'select submission_id from tester_profiles where person_id = $1',
        [account.id],
      )
    : await one<{ submission_id: string }>(
        `select tp.submission_id
           from tester_profiles tp
           join people p on p.id = tp.person_id
          where tp.submission_id = $1 or lower(p.email) = $2
          limit 1`,
        [envelope.submissionId, email],
      );
  if (existing) return { reference: existing.submission_id, duplicate: true };

  const phone = values.whatsapp ? normalisePhone(values.whatsapp) : null;
  const personId =
    account?.id ??
    (await upsertPerson(email, values.fullName.trim(), phone));

  if (account) {
    await fillAccountContact(account.id, values.fullName.trim(), phone);
  }

  try {
    await query(
      `insert into tester_profiles
         (person_id, submission_id, country_code, city, age_band, situation,
          other_activities, industry, industry_other, interests, interests_other,
          frustration, whatsapp, whatsapp_reminders, hear_about, application_status,
          privacy_version, schema_version, source)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'received',$16,$17,$18)`,
      [
        personId,
        envelope.submissionId,
        values.country,
        values.cityState.trim(),
        values.ageRange,
        values.mainSituation,
        values.otherActivities,
        values.industry || null,
        values.industryOther || null,
        values.interests,
        values.interestsOther || null,
        values.frustration.trim(),
        values.whatsapp ? normalisePhone(values.whatsapp) : null,
        values.whatsappReminders,
        values.hearAbout || null,
        envelope.privacyVersion,
        envelope.schemaVersion,
        JSON.stringify(envelope.source ?? {}),
      ],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { reference: envelope.submissionId, duplicate: true };
    }
    throw error;
  }

  await query(
    `insert into audit_events (action, entity, entity_id, meta)
     values ('application.received', 'tester', $1, $2)`,
    [personId, JSON.stringify({ submissionId: envelope.submissionId })],
  );

  await notify(
    personId,
    'application_received',
    'Application received',
    'We have your application. The team reviews new applications within three business days.',
    '/app/tester',
  );

  await sendEmail({
    personId,
    to: email,
    kind: 'application_receipt_tester',
    subject: 'RAPID received your application',
    text: [
      'Thanks for applying to RAPID.',
      '',
      `Your reference is ${envelope.submissionId}.`,
      'We aim to review your application within three business days.',
      `See your status and sign in: ${origin}/app/tester`,
      '',
      'Applying does not guarantee a test or payment.',
      'Questions? Reply to this email.',
    ].join('\n'),
  });

  return { reference: envelope.submissionId, duplicate: false };
}

export async function submitFounderApplication(
  request: Request,
  envelope: SubmissionEnvelope,
  origin: string,
  accountId?: string,
): Promise<ApplicationResult> {
  if (envelope.website) {
    return { reference: envelope.submissionId, duplicate: false };
  }

  const validation = validateFounder(envelope);
  if (!validation.ok) throw new ApiError(422, 'validation', validation.fields);
  const values = validation.values;
  const account = accountId ? await accountContact(accountId) : null;
  const submittedEmail = values.email ? normaliseEmail(values.email) : '';
  const email = account ? normaliseEmail(account.email) : submittedEmail;

  if (account && submittedEmail && submittedEmail !== email) {
    throw new ApiError(422, 'validation', {
      email: 'Use the email on your account, or sign out and apply with a different address.',
    });
  }

  const whatsapp = normalisePhone(values.whatsapp);

  await enforceApplicationLimits(request, email || whatsapp);

  const existing = await one<{ id: string }>(
    'select id from tests where submission_id = $1',
    [envelope.submissionId],
  );
  if (existing) return { reference: existing.id, duplicate: true };

  // A founder request needs an email to create an account shell. Without one,
  // the request still persists and staff follow up on WhatsApp.
  const personId =
    account?.id ??
    (email
      ? await upsertPerson(email, values.fullName.trim(), whatsapp)
      : (
          await one<{ id: string }>(
            `insert into people (email, email_verified, full_name, phone)
             values ($1, false, $2, $3)
             returning id`,
            [`whatsapp-${whatsapp.replace(/\D/g, '')}@rapid.invalid`, values.fullName.trim(), whatsapp],
          )
        )?.id);

  if (!personId) throw new ApiError(500, 'server');

  if (account) {
    await fillAccountContact(account.id, values.fullName.trim(), whatsapp || null);
  }

  await query(
    `insert into founder_profiles (person_id, whatsapp)
     values ($1, $2)
     on conflict (person_id) do update set whatsapp = excluded.whatsapp, updated_at = now()`,
    [personId, whatsapp],
  );

  const title = values.testDescription.trim().slice(0, 80);
  const test = await one<{ id: string }>(
    `insert into tests
       (founder_id, title, question, audience_code, audience_description, status, submission_id)
     values ($1, $2, $3, $4, $5, 'requested', $6)
     returning id`,
    [
      personId,
      title,
      values.testDescription.trim(),
      values.audience,
      values.audienceDescription || null,
      envelope.submissionId,
    ],
  );
  if (!test) throw new ApiError(500, 'server');

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'test.requested', 'test', $2, $3)`,
    [personId, test.id, JSON.stringify({ submissionId: envelope.submissionId })],
  );

  await notify(
    personId,
    'application_received',
    'Test request received',
    'The team will contact you to scope the question, audience and terms.',
    '/app/founder',
  );
  await notifyStaff(
    'application_received',
    'New test request',
    `${values.fullName.trim()} requested a test.`,
    `/staff/tests/${test.id}`,
  );

  if (email) {
    await sendEmail({
      personId,
      to: email,
      kind: 'application_receipt_founder',
      subject: 'RAPID received your test request',
      text: [
        'Thanks. We have received your test request.',
        '',
        `Reference: ${test.id}`,
        'We aim to contact you within three business days to discuss whether the pilot is a fit.',
        `See your request: ${origin}/app/founder`,
      ].join('\n'),
    });
  }

  return { reference: test.id, duplicate: false };
}
