import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import { FOUNDER_AUDIENCES } from '@/content/pilot';
import {
  BackLink,
  ErrorPanel,
  FieldLabel,
  PageHeading,
  Panel,
  inputClass,
} from '@/pages/app/Ui';

export default function FounderNewTest() {
  const request = useApiClient();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [audienceCode, setAudienceCode] = useState('');
  const [audienceDescription, setAudienceDescription] = useState('');
  const [serviceKey, setServiceKey] = useState('idea_validation');
  const [rewardNote, setRewardNote] = useState('');
  const [terms, setTerms] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  // Reused if the founder retries after a timeout, so the staff queue does not
  // receive the same request twice.
  const [submissionId] = useState(() => crypto.randomUUID());

  usePageMeta({ title: 'New test request | RAPID', noindex: true });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFields({});
    try {
      const result = await request<{ id: string }>('/api/founder/tests', {
        method: 'POST',
        body: {
          title,
          question,
          audienceCode,
          audienceDescription,
          rewardNote,
          terms,
          serviceKey,
          submissionId,
        },
      });
      navigate(`/app/founder/tests/${result.id}`, { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) {
        setFields(cause.fields);
        setError('Check the highlighted fields.');
      } else {
        setError('We could not save the request. Try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackLink to="/app/founder">All tests</BackLink>

      <PageHeading
        eyebrow="Founder"
        title="Request a test"
        description="A request is not a booking. The team scopes the question, audience and terms with you before recruitment starts."
      />

      {error && <ErrorPanel message={error} />}

      <Panel
        title="Guided intake"
        description="Answer five questions and RAPID will save a structured brief for the team to review."
      >
        <a href="/app/founder/intake" className="inline-flex min-h-[44px] items-center rounded-xl bg-brand-500 px-5 text-sm font-bold text-ink hover:bg-brand-700 hover:text-white">Start guided intake</a>
        <p className="mt-3 text-sm text-light-muted">Prefer the manual form? Continue below.</p>
      </Panel>

      <Panel>
        <form onSubmit={submit} className="space-y-8">
          <section aria-labelledby="request-question" className="space-y-5">
            <div className="flex items-baseline gap-3 border-b border-studio-200 pb-3">
              <span
                aria-hidden="true"
                className="text-[10px] font-bold tracking-[0.14em] text-studio-600 tabular-nums"
              >
                01
              </span>
              <h2
                id="request-question"
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink"
              >
                The question
              </h2>
            </div>

            <div>
              <FieldLabel htmlFor="title" hint="Optional. A short name for your own reference.">
                Title
              </FieldLabel>
              <input
                id="title"
                className={inputClass}
                value={title}
                maxLength={120}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div>
              <FieldLabel htmlFor="service-key" hint="Choose the closest service.">Service</FieldLabel>
              <select id="service-key" className={inputClass} value={serviceKey} onChange={(event) => setServiceKey(event.target.value)}>
                <option value="idea_validation">Idea Validation</option>
                <option value="product_testing">Product Testing</option>
                <option value="customer_research">Customer Research</option>
              </select>
            </div>

            <div>
              <FieldLabel
                htmlFor="question"
                hint="20–500 characters. What do you need to learn before your next decision?"
              >
                What do you want to test?
              </FieldLabel>
              <textarea
                id="question"
                className={`${inputClass} min-h-[130px]`}
                value={question}
                maxLength={500}
                onChange={(event) => setQuestion(event.target.value)}
                required
              />
              {fields.question && <p className="mt-1 text-sm text-danger">{fields.question}</p>}
            </div>
          </section>

          <section aria-labelledby="request-people" className="space-y-5">
            <div className="flex items-baseline gap-3 border-b border-studio-200 pb-3">
              <span
                aria-hidden="true"
                className="text-[10px] font-bold tracking-[0.14em] text-studio-600 tabular-nums"
              >
                02
              </span>
              <h2
                id="request-people"
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink"
              >
                The people
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel
                  htmlFor="audience"
                  hint="Choose the closest match; the team refines it with you."
                >
                  Who is it for?
                </FieldLabel>
                <select
                  id="audience"
                  className={inputClass}
                  value={audienceCode}
                  onChange={(event) => setAudienceCode(event.target.value)}
                >
                  <option value="">Select an audience</option>
                  {FOUNDER_AUDIENCES.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="reward" hint="Optional. What participants receive.">
                  Reward
                </FieldLabel>
                <input
                  id="reward"
                  className={inputClass}
                  value={rewardNote}
                  onChange={(event) => setRewardNote(event.target.value)}
                  placeholder="e.g. NGN 5,000 mobile credit"
                />
              </div>
            </div>

            <div>
              <FieldLabel
                htmlFor="audience-description"
                hint="Optional, but useful for matching."
              >
                Describe who you need to reach
              </FieldLabel>
              <input
                id="audience-description"
                className={inputClass}
                value={audienceDescription}
                maxLength={300}
                onChange={(event) => setAudienceDescription(event.target.value)}
              />
            </div>
          </section>

          <section aria-labelledby="request-terms" className="space-y-5">
            <div className="flex items-baseline gap-3 border-b border-studio-200 pb-3">
              <span
                aria-hidden="true"
                className="text-[10px] font-bold tracking-[0.14em] text-studio-600 tabular-nums"
              >
                03
              </span>
              <h2
                id="request-terms"
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink"
              >
                The terms
              </h2>
            </div>

            <div>
              <FieldLabel
                htmlFor="terms"
                hint="Optional. What the task involves, how long it takes and how the reward is paid."
              >
                Task terms
              </FieldLabel>
              <textarea
                id="terms"
                className={`${inputClass} min-h-[120px]`}
                value={terms}
                maxLength={4000}
                onChange={(event) => setTerms(event.target.value)}
              />
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-studio-200 pt-6">
            <p className="max-w-[42ch] text-xs leading-relaxed text-studio-600">
              Requests are scoped by the team before recruitment starts.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-brand-500 px-5 text-sm font-bold text-ink hover:bg-brand-700 hover:text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Send request'}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
