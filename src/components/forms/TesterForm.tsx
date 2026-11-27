import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  CheckboxField,
  OptionGroup,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/forms/Field';
import {
  AGE_RANGES,
  COUNTRIES,
  HEARD_ABOUT,
  INDUSTRIES,
  INTERESTS,
  SITUATIONS,
  TESTER_FORM,
} from '@/content/pilot';
import {
  STUDYING_CODES,
  WORKING_CODES,
  buildTesterSubmission,
  emptyTesterValues,
  hasSituation,
  testerSchema,
  type TesterFormValues,
} from '@/lib/submission-schema';
import { submitEnvelope, warmSubmissions, type SubmitResult } from '@/lib/submissions';
import { SubmitOverlay } from '@/components/forms/SubmitOverlay';
import { createSubmissionId } from '@/lib/submission-id';
import { getAttribution } from '@/lib/attribution';
import { trackEvent, trackSuccessOnce } from '@/lib/analytics';
import type { AccountFormContext } from '@/components/forms/account';

const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({
  value: country.code,
  label: country.name,
}));

const AGE_OPTIONS = AGE_RANGES.map((option) => ({ value: option.code, label: option.label }));
const SITUATION_OPTIONS = SITUATIONS.map((option) => ({
  code: option.code,
  label: option.label,
  hint: option.hint,
}));
const INDUSTRY_OPTIONS = INDUSTRIES.map((option) => ({
  value: option.code,
  label: option.label,
}));
const HEARD_OPTIONS = HEARD_ABOUT.map((option) => ({
  value: option.code,
  label: option.label,
}));
const INTEREST_OPTIONS = INTERESTS.map((option) => ({
  code: option.code,
  label: option.label,
}));

function msg(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

export function TesterForm({ account }: { account?: AccountFormContext } = {}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrorsFromServer, setFieldErrorsFromServer] = useState(false);
  const [submissionId] = useState(() => createSubmissionId('t'));
  const started = useRef(false);

  const form = useForm<TesterFormValues>({
    resolver: zodResolver(testerSchema),
    defaultValues: account
      ? {
          ...emptyTesterValues(),
          fullName: account.name,
          email: account.email,
          emailConfirm: account.email,
        }
      : emptyTesterValues(),
    shouldUnregister: true,
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    setError,
    setFocus,
    formState: { errors },
  } = form;

  const mainSituation = useWatch({ control, name: 'mainSituation' }) ?? '';
  const otherActivities = useWatch({ control, name: 'otherActivities' }) ?? [];
  const selectedInterests = useWatch({ control, name: 'interests' }) ?? [];
  const industry = useWatch({ control, name: 'industry' }) ?? '';
  const whatsappReminders = useWatch({ control, name: 'whatsappReminders' }) ?? false;
  const frustration = useWatch({ control, name: 'frustration' }) ?? '';

  const needsSchool = hasSituation(mainSituation, otherActivities, STUDYING_CODES);
  const needsIndustry = hasSituation(mainSituation, otherActivities, WORKING_CODES);

  const disabledActivities = mainSituation ? [mainSituation] : [];

  const disabledInterests =
    selectedInterests.length < 3
      ? []
      : INTERESTS.map((option) => option.code).filter(
          (code) => !selectedInterests.includes(code),
        );

  useEffect(() => {
    const current = getValues('otherActivities') ?? [];
    if (mainSituation && current.includes(mainSituation)) {
      setValue(
        'otherActivities',
        current.filter((code) => code !== mainSituation),
        { shouldValidate: false },
      );
    }
  }, [mainSituation, getValues, setValue]);

  useEffect(() => {
    warmSubmissions();
  }, []);

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    trackEvent('form_start', { form_type: 'tester' });
  };

  const onValid = async (values: TesterFormValues) => {
    if (status === 'saving') return;

    // Hidden spam trap: silently accept and show nothing to the bot.
    if (values.website) {
      if (account) {
        await account.onSubmitted();
      } else {
        navigate('/thanks/tester', { replace: true });
      }
      return;
    }

    setStatus('saving');
    setFormError(null);
    setFieldErrorsFromServer(false);

    const attribution = getAttribution();
    const acknowledgedAt = new Date().toISOString();
    let result: SubmitResult;
    try {
      const token = account ? await account.getToken() : null;
      result = await submitEnvelope(
        buildTesterSubmission(values, {
          submissionId,
          acknowledgedAt,
          source: attribution,
        }),
        { token },
      );
    } catch {
      setStatus('error');
      setFormError(TESTER_FORM.saveError);
      return;
    }

    if (result.ok) {
      if (result.duplicate) {
        trackEvent('form_duplicate', { form_type: 'tester' });
      } else {
        trackSuccessOnce(submissionId, {
          form_type: 'tester',
          new_record: 'true',
          source: attribution.source,
          campaign: attribution.campaign,
        });
      }
      if (account) {
        await account.onSubmitted();
        return;
      }
      navigate('/thanks/tester', {
        replace: true,
        state: { reference: result.id ?? submissionId },
      });
      return;
    }

    setStatus('error');
    trackEvent('form_save_failure', {
      form_type: 'tester',
      code: result.code,
    });

    if (result.code === 'validation' && result.fields) {
      const entries = Object.entries(result.fields);
      for (const [field, message] of entries) {
        setError(field as keyof TesterFormValues, { type: 'server', message });
      }
      setFieldErrorsFromServer(true);
      setFormError(TESTER_FORM.serverValidation);
      const first = entries[0]?.[0];
      if (first) {
        window.setTimeout(() => setFocus(first as keyof TesterFormValues), 0);
      }
      return;
    }

    if (result.code === 'rate_limited') {
      setFormError('Too many attempts. Please wait a few minutes and try again.');
      return;
    }

    setFormError(TESTER_FORM.saveError);
  };

  const onInvalid = (formErrors: typeof errors) => {
    for (const field of Object.keys(formErrors)) {
      if (field === 'root') continue;
      trackEvent('form_validation_error', { form_type: 'tester', field });
    }
  };

  const retry = () => {
    setFormError(null);
    setFieldErrorsFromServer(false);
    void handleSubmit(onValid, onInvalid)();
  };

  const frustrationLength = frustration.trim().length;

  return (
    <form
      onSubmit={handleSubmit(onValid, onInvalid)}
      onFocusCapture={onStart}
      onChangeCapture={onStart}
      noValidate
      aria-busy={status === 'saving'}
      className="space-y-10"
    >
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="tester-website">Company website</label>
        <input
          id="tester-website"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <section aria-labelledby="tester-about">
        <h2 id="tester-about" className="t-section mb-6 text-[26px] sm:text-[30px]">
          {TESTER_FORM.sections.about}
        </h2>
        <div className="space-y-5">
          <TextField
            id="tester-full-name"
            label={TESTER_FORM.fields.fullName}
            required
            autoComplete="name"
            registration={register('fullName')}
            error={msg(errors.fullName)}
          />

          {account ? (
            <>
              {/* The visible confirmation field is redundant once the address comes
                  from the account, but the schema still compares the two. */}
              <input type="hidden" {...register('emailConfirm')} />
              <TextField
                id="tester-email"
                label={TESTER_FORM.fields.email}
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                readOnly
                hint="This is the email on your account, so your application and invitations stay together."
                registration={register('email')}
                error={msg(errors.email)}
                className="bg-cream-50 text-ink-soft"
              />
            </>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="tester-email"
                label={TESTER_FORM.fields.email}
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                registration={register('email')}
                error={msg(errors.email)}
              />
              <TextField
                id="tester-email-confirm"
                label={TESTER_FORM.fields.emailConfirm}
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                registration={register('emailConfirm')}
                error={msg(errors.emailConfirm)}
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="tester-country"
              label={TESTER_FORM.fields.country}
              required
              autoComplete="country"
              registration={register('country')}
              options={COUNTRY_OPTIONS}
              error={msg(errors.country)}
            />
            <TextField
              id="tester-city"
              label={TESTER_FORM.fields.cityState}
              required
              autoComplete="address-level2"
              registration={register('cityState')}
              error={msg(errors.cityState)}
            />
          </div>

          <SelectField
            id="tester-age"
            label={TESTER_FORM.fields.ageRange}
            required
            placeholder="Select your age range"
            registration={register('ageRange')}
            options={AGE_OPTIONS}
            error={msg(errors.ageRange)}
          />

          <CheckboxField
            id="tester-age-confirm"
            registration={register('ageConfirmed')}
            error={msg(errors.ageConfirmed)}
          >
            {TESTER_FORM.fields.ageConfirm}
          </CheckboxField>
        </div>
      </section>

      <section aria-labelledby="tester-situation">
        <h2 id="tester-situation" className="t-section mb-6 text-[26px] sm:text-[30px]">
          {TESTER_FORM.sections.situation}
        </h2>
        <div className="space-y-6">
          <SelectField
            id="tester-main-situation"
            label={TESTER_FORM.fields.mainSituation}
            required
            placeholder="Select your main situation"
            hint="Early undergraduate means levels 100–200; late undergraduate means level 300 and above. Recent graduate means within two years."
            registration={register('mainSituation')}
            options={SITUATIONS.map((option) => ({ value: option.code, label: option.label }))}
            error={msg(errors.mainSituation)}
          />

          <OptionGroup
            name="tester-other-activities"
            legend={TESTER_FORM.fields.otherActivities}
            hint={TESTER_FORM.fields.otherActivitiesHint}
            options={SITUATION_OPTIONS}
            registration={register('otherActivities')}
            disabledCodes={disabledActivities}
            error={msg(errors.otherActivities)}
          />

          {needsSchool && (
            <TextField
              id="tester-school"
              label={TESTER_FORM.fields.school}
              required
              hint={TESTER_FORM.fields.schoolHint}
              autoComplete="organization"
              registration={register('school')}
              error={msg(errors.school)}
            />
          )}

          {needsIndustry && (
            <div className="space-y-5">
              <SelectField
                id="tester-industry"
                label={TESTER_FORM.fields.industry}
                required
                placeholder="Select your industry"
                hint={TESTER_FORM.fields.industryHint}
                registration={register('industry')}
                options={INDUSTRY_OPTIONS}
                error={msg(errors.industry)}
              />
              {industry === 'other' && (
                <TextField
                  id="tester-industry-other"
                  label={TESTER_FORM.fields.industryOther}
                  required
                  registration={register('industryOther')}
                  error={msg(errors.industryOther)}
                />
              )}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="tester-interests">
        <h2 id="tester-interests" className="t-section mb-6 text-[26px] sm:text-[30px]">
          {TESTER_FORM.sections.interests}
        </h2>
        <div className="space-y-6">
          <OptionGroup
            name="tester-interests"
            legend={TESTER_FORM.fields.interests}
            required
            hint={TESTER_FORM.fields.interestsHint}
            options={INTEREST_OPTIONS}
            registration={register('interests')}
            disabledCodes={disabledInterests}
            error={msg(errors.interests)}
          />

          {selectedInterests.includes('other') && (
            <TextField
              id="tester-interests-other"
              label={TESTER_FORM.fields.interestsOther}
              maxLength={100}
              registration={register('interestsOther')}
              error={msg(errors.interestsOther)}
            />
          )}

          <TextAreaField
            id="tester-frustration"
            label={TESTER_FORM.fields.frustration}
            required
            hint={[TESTER_FORM.fields.frustrationPrompt, TESTER_FORM.fields.frustrationHint]
              .filter(Boolean)
              .join(' ')}
            counter={`${frustrationLength}/800`}
            maxLength={800}
            registration={register('frustration')}
            error={msg(errors.frustration)}
          />
        </div>
      </section>

      <section aria-labelledby="tester-contact">
        <h2 id="tester-contact" className="t-section mb-6 text-[26px] sm:text-[30px]">
          {TESTER_FORM.sections.contact}
        </h2>
        <div className="space-y-5">
          <TextField
            id="tester-whatsapp"
            label={`${TESTER_FORM.fields.whatsapp} (${TESTER_FORM.fields.whatsappOptional})`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint={TESTER_FORM.fields.whatsappHint}
            registration={register('whatsapp')}
            error={msg(errors.whatsapp)}
          />

          <CheckboxField
            id="tester-whatsapp-reminders"
            registration={register('whatsappReminders')}
            error={msg(errors.whatsappReminders)}
          >
            {TESTER_FORM.fields.whatsappReminders}
            {whatsappReminders && (
              <span className="mt-1 block text-sm text-ink-soft">
                We will use the number above.
              </span>
            )}
          </CheckboxField>

          <SelectField
            id="tester-hear-about"
            label={TESTER_FORM.fields.hearAbout}
            placeholder="Select an option"
            registration={register('hearAbout')}
            options={HEARD_OPTIONS}
            error={msg(errors.hearAbout)}
          />

          <CheckboxField
            id="tester-privacy"
            registration={register('privacyAck')}
            error={msg(errors.privacyAck)}
          >
            I have read the{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-rapid-700 underline underline-offset-2"
            >
              Privacy Policy
            </a>{' '}
            and understand RAPID will use my details to review my application and email me about
            suitable tests. I can ask to be removed.
          </CheckboxField>
        </div>
      </section>

      {formError && (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger-50 p-5"
        >
          <p className="font-semibold text-danger">{formError}</p>
          {!fieldErrorsFromServer && (
            <p className="mt-1 text-sm text-ink-soft">{TESTER_FORM.saveErrorDetail}</p>
          )}
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={retry}>
            {TESTER_FORM.retry}
          </Button>
        </div>
      )}

      <div className="border-t border-cream-200 pt-6">
        <Button
          type="submit"
          size="lg"
          showArrow
          disabled={status === 'saving'}
          className="w-full sm:w-auto"
        >
          {status === 'saving' ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              {TESTER_FORM.saving}
            </>
          ) : (
            TESTER_FORM.submit
          )}
        </Button>
        <p className="mt-3 text-sm text-ink-soft">{TESTER_FORM.note}</p>
      </div>

      <SubmitOverlay show={status === 'saving'} message={TESTER_FORM.saving} />
    </form>
  );
}
