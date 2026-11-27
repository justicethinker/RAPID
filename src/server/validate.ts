import {
  founderSchema,
  testerSchema,
  type FounderFormValues,
  type SubmissionEnvelope,
  type TesterFormValues,
} from '../lib/submission-schema';

type Answer = string | string[] | boolean;
type Answers = Record<string, Answer | undefined>;

export type ValidationResult<T> =
  | { ok: true; values: T }
  | { ok: false; fields: Record<string, string> };

function text(answers: Answers, key: string): string {
  const value = answers[key];
  return typeof value === 'string' ? value : '';
}

function list(answers: Answers, key: string): string[] {
  const value = answers[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function truthy(answers: Answers, key: string): boolean {
  return answers[key] === true;
}

function fieldsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export function isSubmissionEnvelope(value: unknown): value is SubmissionEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<SubmissionEnvelope>;
  return (
    (envelope.formType === 'tester' || envelope.formType === 'founder') &&
    typeof envelope.submissionId === 'string' &&
    envelope.submissionId.length >= 8 &&
    envelope.submissionId.length <= 100 &&
    typeof envelope.answers === 'object' &&
    envelope.answers !== null &&
    !Array.isArray(envelope.answers)
  );
}

export function validateTester(
  envelope: SubmissionEnvelope,
): ValidationResult<TesterFormValues> {
  const answers = envelope.answers as Answers;
  const parsed = testerSchema.safeParse({
    fullName: text(answers, 'fullName'),
    email: text(answers, 'email'),
    emailConfirm: envelope.emailConfirm ?? text(answers, 'email'),
    country: text(answers, 'country'),
    cityState: text(answers, 'cityState'),
    ageRange: text(answers, 'ageRange'),
    ageConfirmed: truthy(answers, 'ageConfirmed'),
    mainSituation: text(answers, 'mainSituation'),
    otherActivities: list(answers, 'otherActivities'),
    school: text(answers, 'school'),
    industry: text(answers, 'industry'),
    industryOther: text(answers, 'industryOther'),
    interests: list(answers, 'interests'),
    interestsOther: text(answers, 'interestsOther'),
    frustration: text(answers, 'frustration'),
    whatsapp: text(answers, 'whatsapp'),
    whatsappReminders: truthy(answers, 'whatsappReminders'),
    hearAbout: text(answers, 'hearAbout'),
    privacyAck: truthy(answers, 'privacyAck'),
    website: envelope.website,
  });

  if (!parsed.success) return { ok: false, fields: fieldsFrom(parsed.error) };
  return { ok: true, values: parsed.data };
}

export function validateFounder(
  envelope: SubmissionEnvelope,
): ValidationResult<FounderFormValues> {
  const answers = envelope.answers as Answers;
  const parsed = founderSchema.safeParse({
    fullName: text(answers, 'fullName'),
    whatsapp: text(answers, 'whatsapp'),
    email: text(answers, 'email'),
    testDescription: text(answers, 'testDescription'),
    audience: text(answers, 'audience'),
    audienceDescription: text(answers, 'audienceDescription'),
    privacyAck: truthy(answers, 'privacyAck'),
    website: envelope.website,
  });

  if (!parsed.success) return { ok: false, fields: fieldsFrom(parsed.error) };
  return { ok: true, values: parsed.data };
}
