import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useApi, useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import type { TesterInvitationDetail } from '@/lib/dashboard-types';
import { labelOutcome } from '@/lib/labels';
import {
  BackLink,
  ErrorPanel,
  FieldLabel,
  Loading,
  Meta,
  PageHeading,
  Panel,
  Pill,
  Quote,
  inputClass,
} from '@/pages/app/Ui';
import { INVITATION_LABEL, formatDay, invitationTone } from '@/pages/app/status';

const OUTCOMES = [
  { value: 'tried', label: 'I tried it' },
  { value: 'booked_call', label: 'I booked a call' },
  { value: 'collaborated', label: 'I agreed to collaborate' },
  { value: 'no_action', label: 'I did not take action' },
];

export default function TesterInvitationDetail() {
  const { id } = useParams<{ id: string }>();
  const request = useApiClient();
  const { data, loading, error, refresh } = useApi<TesterInvitationDetail>(
    id ? `/api/tester/invitations/${id}` : null,
  );

  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('tried');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [screeners, setScreeners] = useState<Record<string, unknown>>({});
  const [taskOutcome, setTaskOutcome] = useState('completed');
  const [taskReason, setTaskReason] = useState('');

  usePageMeta({ title: 'Invitation | RAPID', noindex: true });

  if (loading && !data) return <Loading label="Loading invitation…" />;
  if (error)
    return <ErrorPanel message={error} onRetry={() => void refresh()} />;
  if (!data || !id) return null;

  const respond = async (action: 'accept' | 'decline') => {
    setPending(true);
    setFormError(null);
    try {
      await request(`/api/tester/invitations/${id}/respond`, {
        method: 'POST',
        body: { action },
      });
      await refresh();
    } catch (cause) {
      setFormError(
        cause instanceof ApiError && cause.status === 409
          ? 'This invitation has already been answered.'
          : 'We could not save your answer. Try again.',
      );
    } finally {
      setPending(false);
    }
  };

  const saveAnswer = async (stepId: string, value: unknown) => {
    setAnswers((current) => ({ ...current, [stepId]: value }));
    setPending(true);
    setFormError(null);
    try {
      await request(`/api/tester/invitations/${id}/answers`, { method: 'POST', body: { stepId, answer: value } });
    } catch {
      setFormError('We could not save that answer. Try again.');
    } finally {
      setPending(false);
    }
  };

  const saveScreeners = async () => {
    setPending(true);
    setFormError(null);
    try {
      await request(`/api/tester/invitations/${id}/screeners`, { method: 'POST', body: { answers: Object.entries(screeners).map(([screenerId, answer]) => ({ screenerId, answer })) } });
      await refresh();
    } catch {
      setFormError('We could not save the screener answers.');
    } finally {
      setPending(false);
    }
  };

  const openTask = async () => {
    setPending(true);
    setFormError(null);
    try {
      const link = await request<{ url: string }>(`/api/tester/invitations/${id}/task-link`);
      window.open(link.url, '_blank', 'noopener');
      await refresh();
    } catch {
      setFormError('This task link is unavailable.');
    } finally {
      setPending(false);
    }
  };

  const reportAction = async () => {
    setPending(true);
    setFormError(null);
    try {
      await request(`/api/tester/invitations/${id}/task-link`, { method: 'POST', body: { outcome: taskOutcome, reason: taskReason } });
      await refresh();
    } catch {
      setFormError('We could not save the task outcome.');
    } finally {
      setPending(false);
    }
  };

  const submitResponse = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    try {
      await request(`/api/tester/invitations/${id}/response`, {
        method: 'POST',
        body: { outcome, note, consentToQuote: consent },
      });
      await refresh();
    } catch (cause) {
      const fields = cause instanceof ApiError ? cause.fields : undefined;
      setFormError(
        fields?.note ??
          fields?.outcome ??
          'We could not save your response. Try again.',
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackLink to="/app/tester/invitations">All invitations</BackLink>

      <PageHeading
        eyebrow="Invitation"
        title={data.test.title || 'RAPID test'}
        description={data.test.question}
      >
        <Pill tone={invitationTone(data.status)}>
          {INVITATION_LABEL[data.status] ?? data.status}
        </Pill>
      </PageHeading>

      <Panel title="The task and terms">
        <p className="max-w-[64ch] whitespace-pre-line text-[16px] leading-[1.75] text-ink-soft">
          {data.test.terms ||
            'The team will confirm the task details before you start.'}
        </p>
        {data.test.method && (
          <div className="mt-6 border-t border-cream-200 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              How to take part
            </p>
            <p className="mt-2 max-w-[62ch] whitespace-pre-line text-sm leading-relaxed text-ink">
              {data.test.method}
            </p>
          </div>
        )}
        <dl className="mt-6 grid gap-5 border-t border-cream-200 pt-5 sm:grid-cols-2">
          <Meta label="Reward">
            {data.test.rewardNote ?? 'No reward stated'}
          </Meta>
          <Meta label="Invited">{formatDay(data.invitedAt)}</Meta>
        </dl>
      </Panel>

      {formError && <ErrorPanel message={formError} />}

      {data.status === 'invited' && (
        <Panel
          title="Will you take part?"
          description="Accepting means you agree to the terms above. You can still decline before you submit a response."
        >
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => void respond('accept')}
              className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400 disabled:opacity-60"
            >
              Accept invitation
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => void respond('decline')}
              className="inline-flex min-h-[44px] items-center rounded-full border border-cream-300 bg-white px-5 text-sm font-semibold text-ink hover:border-rapid-600 disabled:opacity-60"
            >
              Decline
            </button>
          </div>
        </Panel>
      )}

      {data.status === 'accepted' && (
        <Panel
          title="Tell us what happened"
          description="A short, honest account is more useful than a polished one."
        >
          <form onSubmit={submitResponse} className="space-y-5">
            <div>
              <FieldLabel htmlFor="outcome">What happened?</FieldLabel>
              <select
                id="outcome"
                className={inputClass}
                value={outcome}
                onChange={(event) => setOutcome(event.target.value)}
              >
                {OUTCOMES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel
                htmlFor="note"
                hint="Between 20 and 1,000 characters. Say what you did and what got in the way."
              >
                Your account of what happened
              </FieldLabel>
              <textarea
                id="note"
                className={`${inputClass} min-h-[160px]`}
                value={note}
                maxLength={1000}
                onChange={(event) => setNote(event.target.value)}
                required
              />
              <p className="mt-1 text-xs text-ink-faint tabular-nums">
                {note.trim().length}/1000
              </p>
            </div>

            <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-cream-300 text-rapid-700 focus:ring-rapid-500"
              />
              RAPID may share this account as an anonymous quote with the
              founder. Your name and contact details are never shared.
            </label>

            <button
              type="submit"
              disabled={pending || note.trim().length < 20}
              className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400 disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Submit response'}
            </button>
          </form>
        </Panel>
      )}

      {data.status === 'accepted' && data.screeners.length > 0 && (
        <Panel title="Screening questions" description="Answer these before the study questions.">
          <div className="space-y-5">
            {data.screeners.map((screener) => (
              <div key={screener.id}>
                <FieldLabel htmlFor={`screen-${screener.id}`}>{screener.question}</FieldLabel>
                <select id={`screen-${screener.id}`} className={inputClass} value={String(screeners[screener.id] ?? screener.answer ?? '')} onChange={(event) => setScreeners((current) => ({ ...current, [screener.id]: event.target.value }))}>
                  <option value="">Choose one</option>
                  {screener.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            ))}
            <button type="button" disabled={pending} onClick={() => void saveScreeners()} className="min-h-[44px] rounded-full bg-sun-500 px-5 text-sm font-bold text-ink hover:bg-sun-400 disabled:opacity-60">Save screener</button>
          </div>
        </Panel>
      )}

      {data.status === 'accepted' && data.steps.length > 0 && (
        <Panel title="Study questions" description={`Question ${data.steps.length} steps · answers save as you go.`}>
          <div className="space-y-6">
            {data.steps.map((step, index) => (
              <div key={step.id} className="border-t border-cream-200 pt-5 first:border-0 first:pt-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">Step {index + 1} · {step.stepType.replaceAll('_', ' ')}</p>
                <FieldLabel htmlFor={`step-${step.id}`}>{step.prompt}</FieldLabel>
                {step.stepType === 'single_choice' ? (
                  <select id={`step-${step.id}`} className={inputClass} value={String(answers[step.id] ?? step.answer ?? '')} onChange={(event) => void saveAnswer(step.id, event.target.value)}>
                    <option value="">Choose one</option>{step.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : step.stepType === 'multiple_choice' ? (
                  <div className="flex flex-wrap gap-2">{step.options.map((option) => { const raw = answers[step.id] ?? step.answer; const current: string[] = Array.isArray(raw) ? raw.map(String) : []; const selected = current.includes(option); return <button key={option} type="button" onClick={() => { const next = selected ? current.filter((item) => item !== option) : [...current, option]; void saveAnswer(step.id, next); }} className={`min-h-[44px] rounded-xl border px-4 text-sm font-semibold ${selected ? 'border-rapid-600 bg-rapid-50 text-rapid-700' : 'border-cream-300'}`}>{option}</button>; })}</div>
                ) : step.stepType === 'scale' ? (
                  <div className="flex gap-2">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => void saveAnswer(step.id, value)} className={`h-11 w-11 rounded-xl border text-sm font-bold ${Number(answers[step.id] ?? step.answer) === value ? 'border-rapid-600 bg-sun-500 text-ink' : 'border-cream-300'}`}>{value}</button>)}</div>
                ) : step.stepType === 'image_prompt' ? (
                  <><p className="mb-2 text-sm text-ink-soft">{String(step.metadata.instructions ?? 'Look at the image and answer in your own words.')}</p><textarea id={`step-${step.id}`} className={`${inputClass} min-h-[90px]`} value={String(answers[step.id] ?? step.answer ?? '')} onChange={(event) => setAnswers((current) => ({ ...current, [step.id]: event.target.value }))} onBlur={(event) => void saveAnswer(step.id, event.target.value)} /></>
                ) : (
                  <textarea id={`step-${step.id}`} className={`${inputClass} min-h-[90px]`} value={String(answers[step.id] ?? step.answer ?? '')} onChange={(event) => setAnswers((current) => ({ ...current, [step.id]: event.target.value }))} onBlur={(event) => void saveAnswer(step.id, event.target.value)} />
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {data.status === 'accepted' && data.test.taskUrl && (
        <Panel title="External task" description="Open the signed task link, finish the task, then return here and tell us what happened.">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={pending} onClick={() => void openTask()} className="min-h-[44px] rounded-full bg-sun-500 px-5 text-sm font-bold text-ink hover:bg-sun-400 disabled:opacity-60">Open task</button>
            <span className="text-sm text-ink-soft">State: {data.action.state.replaceAll('_', ' ')}</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <select className={inputClass} value={taskOutcome} onChange={(event) => setTaskOutcome(event.target.value)}>
              <option value="completed">I completed it</option>
              <option value="could_not_complete">I could not complete it</option>
              <option value="chose_not">I chose not to</option>
            </select>
            <input className={inputClass} value={taskReason} maxLength={1000} onChange={(event) => setTaskReason(event.target.value)} placeholder="Short reason" />
            <button type="button" disabled={pending} onClick={() => void reportAction()} className="min-h-[44px] rounded-xl border border-cream-300 px-5 text-sm font-bold disabled:opacity-60">Save outcome</button>
          </div>
          {data.test.taskRequiresReturn && <p className="mt-3 text-sm text-ink-soft">Return to Rapid after you finish so we can record your outcome.<a className="ml-2 font-bold text-rapid-700 underline" href={`/app/tester/invitations/${id}`}>Return to Rapid</a></p>}
        </Panel>
      )}

      {data.status === 'completed' && data.response && (
        <Panel
          title="Your response"
          description="This is what the founder sees, without your name or contact details."
        >
          <Quote
            label={`Tester response · ${formatDay(data.response.submittedAt)}`}
          >
            {data.response.note}
          </Quote>
          <dl className="mt-6 grid gap-5 border-t border-cream-200 pt-5 sm:grid-cols-2">
            <Meta label="Outcome">
              {labelOutcome(data.response.outcome)}
            </Meta>
            <Meta label="Reward">
              {data.rewardStatus === 'sent'
                ? 'Sent'
                : data.rewardStatus === 'pending'
                  ? 'Pending'
                  : 'Not applicable'}
            </Meta>
          </dl>
        </Panel>
      )}

      {data.status === 'declined' && (
        <Panel title="Invitation declined">
          <p className="max-w-[62ch] leading-relaxed text-ink-soft">
            You declined this test. It will stay in your history and will not
            affect future invitations.
          </p>
        </Panel>
      )}
    </div>
  );
}
