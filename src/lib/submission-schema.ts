import { z } from 'zod';
import {
  AGE_RANGES,
  COUNTRIES,
  FOUNDER_AUDIENCES,
  HEARD_ABOUT,
  INDUSTRIES,
  INTERESTS,
  SCHEMA_VERSION,
  PRIVACY_VERSION,
  SEGMENT_LABELS,
  SITUATIONS,
  countryName,
  labelFor,
} from '../content/pilot';

/* ------------------------------------------------------------------ */
/* Shared rules                                                        */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Convert a pasted number to a single E.164-style string. */
export function normalisePhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const cleaned = trimmed.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return `+${cleaned.slice(1).replace(/\+/g, '')}`;
  return `+${cleaned.replace(/\+/g, '')}`;
}

function isCode(options: { code: string }[], value: string): boolean {
  return options.some((option) => option.code === value);
}

const nameSchema = z.string().refine((value) => {
  const name = value.trim();
  return name.length >= 2 && name.length <= 100 && NAME_RE.test(name);
}, 'Enter your full name (2–100 characters).');

const emailSchema = z.string().refine((value) => {
  const email = value.trim();
  return email.length <= 254 && EMAIL_RE.test(email);
}, 'Enter a valid email address, like name@example.com.');

const optionalEmailSchema = z.string().optional().refine((value) => {
  const email = (value ?? '').trim();
  return email.length === 0 || (email.length <= 254 && EMAIL_RE.test(email));
}, 'Enter a valid email address, like name@example.com.');

const requiredPhoneSchema = z
  .string()
  .refine((value) => PHONE_RE.test(normalisePhone(value)), 'Enter a valid number with a country code.');

const optionalPhoneSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value.trim().length === 0 || PHONE_RE.test(normalisePhone(value)),
    'Enter a valid number with a country code, or leave this blank.',
  );

const countrySchema = z
  .string()
  .refine((value) => COUNTRIES.some((country) => country.code === value), 'Select your country.');

const textLength = (min: number, max: number, message: string) =>
  z.string().refine((value) => {
    const length = value.trim().length;
    return length >= min && length <= max;
  }, message);

const optionalTextLength = (min: number, max: number, message: string) =>
  z.string().optional().refine((value) => {
    const length = (value ?? '').trim().length;
    return length === 0 || (length >= min && length <= max);
  }, message);

const booleanRequired = (message: string) =>
  z.boolean().refine((value) => value === true, message);

const codeSchema = (options: { code: string }[], message: string) =>
  z.string().refine((value) => isCode(options, value), message);

export const STUDYING_CODES = [
  'early_undergraduate',
  'late_undergraduate',
  'recent_graduate',
] as const;
export const WORKING_CODES = ['employed', 'entrepreneur'] as const;

export function hasSituation(
  main: string,
  others: string[],
  codes: readonly string[],
): boolean {
  return codes.includes(main) || others.some((code) => codes.includes(code));
}

/* ------------------------------------------------------------------ */
/* Tester application                                                  */
/* ------------------------------------------------------------------ */

export const testerSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    emailConfirm: emailSchema,
    country: countrySchema,
    cityState: textLength(2, 100, 'Enter your city or state (2–100 characters).'),
    ageRange: codeSchema(AGE_RANGES, 'Select your age range.'),
    ageConfirmed: booleanRequired('Confirm that you are 18 or older.'),
    mainSituation: codeSchema(SITUATIONS, 'Select your main situation.'),
    otherActivities: z.array(z.string()).max(5),
    school: optionalTextLength(2, 150, 'Enter your school or university (2–150 characters).'),
    industry: z
      .string()
      .optional()
      .refine(
        (value) => !value || isCode(INDUSTRIES, value),
        'Select your industry.',
      ),
    industryOther: optionalTextLength(2, 100, 'Describe your industry (2–100 characters).'),
    interests: z
      .array(z.string())
      .refine(
        (values) => values.length >= 1 && values.length <= 3,
        'Choose 1–3 interests.',
      ),
    interestsOther: z
      .string()
      .optional()
      .refine(
        (value) => (value ?? '').trim().length <= 100,
        'Keep this to 100 characters or fewer.',
      ),
    frustration: textLength(
      50,
      800,
      'Write at least 50 characters so we can understand what happened (up to 800).',
    ),
    whatsapp: optionalPhoneSchema,
    whatsappReminders: z.boolean(),
    hearAbout: z
      .string()
      .optional()
      .refine(
        (value) => !value || isCode(HEARD_ABOUT, value),
        'Select an option.',
      ),
    privacyAck: booleanRequired('Please confirm that you have read the Privacy Policy.'),
    website: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (normaliseEmail(value.email) !== normaliseEmail(value.emailConfirm)) {
      ctx.addIssue({
        code: 'custom',
        path: ['emailConfirm'],
        message: 'The email addresses do not match.',
      });
    }

    if (value.mainSituation && value.otherActivities.includes(value.mainSituation)) {
      ctx.addIssue({
        code: 'custom',
        path: ['otherActivities'],
        message: 'Other activities cannot repeat your main situation.',
      });
    }

    const invalidActivity = value.otherActivities.find((code) => !isCode(SITUATIONS, code));
    if (invalidActivity) {
      ctx.addIssue({
        code: 'custom',
        path: ['otherActivities'],
        message: 'Select a valid activity.',
      });
    }

    if (hasSituation(value.mainSituation, value.otherActivities, STUDYING_CODES)) {
      const length = (value.school ?? '').trim().length;
      if (length < 2 || length > 150) {
        ctx.addIssue({
          code: 'custom',
          path: ['school'],
          message: 'Enter your school or university (2–150 characters).',
        });
      }
    }

    if (hasSituation(value.mainSituation, value.otherActivities, WORKING_CODES)) {
      if (!value.industry) {
        ctx.addIssue({
          code: 'custom',
          path: ['industry'],
          message: 'Select your industry.',
        });
      }
    }

    if (value.industry === 'other') {
      const length = (value.industryOther ?? '').trim().length;
      if (length < 2 || length > 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['industryOther'],
          message: 'Describe your industry (2–100 characters).',
        });
      }
    }

    const uniqueInterests = new Set(value.interests);
    if (uniqueInterests.size !== value.interests.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['interests'],
        message: 'Choose each interest only once.',
      });
    }
    if (value.interests.some((code) => !isCode(INTERESTS, code))) {
      ctx.addIssue({
        code: 'custom',
        path: ['interests'],
        message: 'Select a valid interest.',
      });
    }

    if (value.whatsappReminders && !PHONE_RE.test(normalisePhone(value.whatsapp ?? ''))) {
      ctx.addIssue({
        code: 'custom',
        path: ['whatsapp'],
        message: 'Add a valid WhatsApp number to receive reminders.',
      });
    }
  });

export type TesterFormValues = z.infer<typeof testerSchema>;

export function emptyTesterValues(): TesterFormValues {
  return {
    fullName: '',
    email: '',
    emailConfirm: '',
    country: 'NG',
    cityState: '',
    ageRange: '',
    ageConfirmed: false,
    mainSituation: '',
    otherActivities: [],
    school: '',
    industry: '',
    industryOther: '',
    interests: [],
    interestsOther: '',
    frustration: '',
    whatsapp: '',
    whatsappReminders: false,
    hearAbout: '',
    privacyAck: false,
    website: '',
  };
}

/* ------------------------------------------------------------------ */
/* Founder request                                                     */
/* ------------------------------------------------------------------ */

export const founderSchema = z
  .object({
    fullName: nameSchema,
    whatsapp: requiredPhoneSchema,
    email: optionalEmailSchema,
    testDescription: textLength(
      20,
      500,
      'Describe what you want to test in 20–500 characters.',
    ),
    audience: codeSchema(FOUNDER_AUDIENCES, 'Select who the test is for.'),
    audienceDescription: optionalTextLength(
      5,
      300,
      'Describe who you need to reach (5–300 characters).',
    ),
    privacyAck: booleanRequired('Please confirm that you have read the Privacy Policy.'),
    website: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.audience === 'more_than_one' || value.audience === 'someone_else') {
      const length = (value.audienceDescription ?? '').trim().length;
      if (length < 5 || length > 300) {
        ctx.addIssue({
          code: 'custom',
          path: ['audienceDescription'],
          message: 'Describe who you need to reach (5–300 characters).',
        });
      }
    }
  });

export type FounderFormValues = z.infer<typeof founderSchema>;

export function emptyFounderValues(): FounderFormValues {
  return {
    fullName: '',
    whatsapp: '',
    email: '',
    testDescription: '',
    audience: '',
    audienceDescription: '',
    privacyAck: false,
    website: '',
  };
}

/* ------------------------------------------------------------------ */
/* Submission envelope                                                 */
/* ------------------------------------------------------------------ */

export interface Attribution {
  source: string;
  medium: string;
  campaign: string;
  landingPath: string;
}

export interface SubmissionMeta {
  submissionId: string;
  acknowledgedAt: string;
  source: Attribution;
}

export interface SubmissionEnvelope {
  formType: 'tester' | 'founder';
  schemaVersion: string;
  privacyVersion: string;
  submissionId: string;
  acknowledgedAt: string;
  source: Attribution;
  answers: Record<string, string | string[] | boolean>;
  labels: Record<string, string | string[]>;
  emailConfirm?: string;
  website: string;
}

function labelsForSituation(code: string): string {
  return labelFor(SITUATIONS, code);
}

export function buildTesterSubmission(
  values: TesterFormValues,
  meta: SubmissionMeta,
): SubmissionEnvelope {
  const email = normaliseEmail(values.email);
  const whatsapp = normalisePhone(values.whatsapp ?? '');
  const otherActivities = (values.otherActivities ?? []).filter(Boolean);

  return {
    formType: 'tester',
    schemaVersion: SCHEMA_VERSION,
    privacyVersion: PRIVACY_VERSION,
    submissionId: meta.submissionId,
    acknowledgedAt: meta.acknowledgedAt,
    source: meta.source,
    emailConfirm: normaliseEmail(values.emailConfirm),
    website: values.website ?? '',
    answers: {
      fullName: values.fullName.trim(),
      email,
      country: values.country,
      cityState: values.cityState.trim(),
      ageRange: values.ageRange,
      ageConfirmed: values.ageConfirmed,
      mainSituation: values.mainSituation,
      otherActivities,
      school: (values.school ?? '').trim(),
      industry: values.industry ?? '',
      industryOther:
        values.industry === 'other' ? (values.industryOther ?? '').trim() : '',
      interests: values.interests ?? [],
      interestsOther:
        (values.interests ?? []).includes('other') ? (values.interestsOther ?? '').trim() : '',
      frustration: values.frustration.trim(),
      whatsapp,
      whatsappReminders: values.whatsappReminders,
      hearAbout: values.hearAbout ?? '',
      privacyAck: values.privacyAck,
    },
    labels: {
      country: countryName(values.country),
      ageRange: labelFor(AGE_RANGES, values.ageRange),
      mainSituation: labelsForSituation(values.mainSituation),
      primarySegment: SEGMENT_LABELS[values.mainSituation] ?? '',
      otherActivities: otherActivities.map(labelsForSituation),
      industry: labelFor(INDUSTRIES, values.industry),
      interests: (values.interests ?? []).map((code) => labelFor(INTERESTS, code)),
      hearAbout: labelFor(HEARD_ABOUT, values.hearAbout ?? ''),
    },
  };
}

export function buildFounderSubmission(
  values: FounderFormValues,
  meta: SubmissionMeta,
): SubmissionEnvelope {
  return {
    formType: 'founder',
    schemaVersion: SCHEMA_VERSION,
    privacyVersion: PRIVACY_VERSION,
    submissionId: meta.submissionId,
    acknowledgedAt: meta.acknowledgedAt,
    source: meta.source,
    website: values.website ?? '',
    answers: {
      fullName: values.fullName.trim(),
      whatsapp: normalisePhone(values.whatsapp),
      email: normaliseEmail(values.email ?? ''),
      testDescription: values.testDescription.trim(),
      audience: values.audience,
      audienceDescription:
        values.audience === 'more_than_one' || values.audience === 'someone_else'
          ? (values.audienceDescription ?? '').trim()
          : '',
      privacyAck: values.privacyAck,
    },
    labels: {
      audience: labelFor(FOUNDER_AUDIENCES, values.audience),
    },
  };
}
