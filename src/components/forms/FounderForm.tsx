import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  CheckboxField,
  OptionGroup,
  TextAreaField,
  TextField,
} from '@/components/forms/Field';
import { FOUNDER_AUDIENCES, FOUNDER_FORM } from '@/content/pilot';
import {
  buildFounderSubmission,
  emptyFounderValues,
  founderSchema,
  type FounderFormValues,
} from '@/lib/submission-schema';
import { submitEnvelope, warmSubmissions, type SubmitResult } from '@/lib/submissions';
import { SubmitOverlay } from '@/components/forms/SubmitOverlay';
import { createSubmissionId } from '@/lib/submission-id';
import { getAttribution } from '@/lib/attribution';
import { trackEvent, trackSuccessOnce } from '@/lib/analytics';
import type { AccountFormContext } from '@/components/forms/account';

const AUDIENCE_OPTIONS = FOUNDER_AUDIENCES.map((option) => ({
  code: option.code,
  label: option.label,
}));

function msg(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

export function FounderForm({ account }: { account?: AccountFormContext } = {}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrorsFromServer, setFieldErrorsFromServer] = useState(false);
  const [submissionId] = useState(() => createSubmissionId('f'));
  const started = useRef(false);

  const form = useForm<FounderFormValues>({
    resolver: zodResolver(founderSchema),
    defaultValues: account
      ? {
          ...emptyFounderValues(),
          fullName: account.name,
          email: account.email,
        }
      : emptyFounderValues(),
    shouldUnregister: true,
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    setFocus,
    formState: { errors },
  } = form;

  const audience = useWatch({ control, name: 'audience' }) ?? '';
  const needsAudienceDetail = audience === 'more_than_one' || audience === 'someone_else';

  useEffect(() => {
    warmSubmissions();
  }, []);

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    trackEvent('form_start', { form_type: 'founder' });
  };

  const onValid = async (values: FounderFormValues) => {
    if (status === 'saving') return;

    if (values.website) {
      if (account) {
        await account.onSubmitted();
      } else {
        navigate('/thanks/founder', { replace: true });
      }
      return;
    }

    setStatus('saving');
    setFormError(null);
    setFieldErrorsFromServer(false);

    const attribution = getAttribution();
    let result: SubmitResult;
    try {
      const token = account ? await account.getToken() : null;
      result = await submitEnvelope(
        buildFounderSubmission(values, {
          submissionId,
          acknowledgedAt: new Date().toISOString(),
          source: attribution,
        }),
        { token },
      );
    } catch {
      setStatus('error');
      setFormError(FOUNDER_FORM.saveError);
      return;
    }

    if (result.ok) {
      if (result.duplicate) {
        trackEvent('form_duplicate', { form_type: 'founder' });
      } else {
        trackSuccessOnce(submissionId, {
          form_type: 'founder',
          new_record: 'true',
          source: attribution.source,
          campaign: attribution.campaign,
        });
      }
      if (account) {
        await account.onSubmitted();
        return;
      }
      navigate('/thanks/founder', {
        replace: true,
        state: { reference: result.id ?? submissionId },
      });
      return;
    }

    setStatus('error');
    trackEvent('form_save_failure', {
      form_type: 'founder',
      code: result.code,
    });

    if (result.code === 'validation' && result.fields) {
      const entries = Object.entries(result.fields);
      for (const [field, message] of entries) {
        setError(field as keyof FounderFormValues, { type: 'server', message });
      }
      setFieldErrorsFromServer(true);
      setFormError(FOUNDER_FORM.serverValidation);
      const first = entries[0]?.[0];
      if (first) {
        window.setTimeout(() => setFocus(first as keyof FounderFormValues), 0);
      }
      return;
    }

    if (result.code === 'rate_limited') {
      setFormError('Too many attempts. Please wait a few minutes and try again.');
      return;
    }

    setFormError(FOUNDER_FORM.saveError);
  };

  const onInvalid = (formErrors: typeof errors) => {
    for (const field of Object.keys(formErrors)) {
      if (field === 'root') continue;
      trackEvent('form_validation_error', { form_type: 'founder', field });
    }
  };

  const retry = () => {
    setFormError(null);
    setFieldErrorsFromServer(false);
    void handleSubmit(onValid, onInvalid)();
  };

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
        <label htmlFor="founder-website">Company website</label>
        <input
          id="founder-website"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <section aria-labelledby="founder-about">
        <h2 id="founder-about" className="t-section mb-6 text-[26px] sm:text-[30px]">
          About you
        </h2>
        <div className="space-y-5">
          <TextField
            id="founder-full-name"
            label={FOUNDER_FORM.fields.fullName}
            required
            autoComplete="name"
            registration={register('fullName')}
            error={msg(errors.fullName)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="founder-whatsapp"
              label={FOUNDER_FORM.fields.whatsapp}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              hint={FOUNDER_FORM.fields.whatsappHint}
              registration={register('whatsapp')}
              error={msg(errors.whatsapp)}
            />
            <TextField
              id="founder-email"
              label={account ? FOUNDER_FORM.fields.email : `${FOUNDER_FORM.fields.email} (${FOUNDER_FORM.fields.emailOptional})`}
              type="email"
              inputMode="email"
              autoComplete="email"
              readOnly={Boolean(account)}
              hint={account ? 'This is the email on your account.' : undefined}
              registration={register('email')}
              error={msg(errors.email)}
              className={account ? 'bg-cream-50 text-ink-soft' : undefined}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="founder-request">
        <h2 id="founder-request" className="t-section mb-6 text-[26px] sm:text-[30px]">
          What you need to learn
        </h2>
        <div className="space-y-6">
          <TextAreaField
            id="founder-test-description"
            label={FOUNDER_FORM.fields.testDescription}
            required
            hint={FOUNDER_FORM.fields.testDescriptionHint}
            maxLength={500}
            registration={register('testDescription')}
            error={msg(errors.testDescription)}
          />

          <OptionGroup
            name="founder-audience"
            legend={FOUNDER_FORM.fields.audience}
            required
            type="radio"
            options={AUDIENCE_OPTIONS}
            registration={register('audience')}
            error={msg(errors.audience)}
          />

          {needsAudienceDetail && (
            <TextField
              id="founder-audience-description"
              label={FOUNDER_FORM.fields.audienceDescription}
              required
              hint={FOUNDER_FORM.fields.audienceDescriptionHint}
              registration={register('audienceDescription')}
              error={msg(errors.audienceDescription)}
            />
          )}
        </div>
      </section>

      <section aria-labelledby="founder-consent">
        <h2 id="founder-consent" className="t-section mb-6 text-[26px] sm:text-[30px]">
          Consent
        </h2>
        <CheckboxField
          id="founder-privacy"
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
          and understand RAPID will contact me on WhatsApp about this request.
        </CheckboxField>
      </section>

      {formError && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-50 p-5">
          <p className="font-semibold text-danger">{formError}</p>
          {!fieldErrorsFromServer && (
            <p className="mt-1 text-sm text-ink-soft">{FOUNDER_FORM.saveErrorDetail}</p>
          )}
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={retry}>
            {FOUNDER_FORM.retry}
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
              {FOUNDER_FORM.saving}
            </>
          ) : (
            FOUNDER_FORM.submit
          )}
        </Button>
        <p className="mt-3 text-sm text-ink-soft">{FOUNDER_FORM.note}</p>
      </div>

      <SubmitOverlay show={status === 'saving'} message={FOUNDER_FORM.saving} />
    </form>
  );
}
