import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import { BackLink, ErrorPanel, FieldLabel, Loading, PageHeading, Panel, inputClass } from '@/pages/app/Ui';

interface Brief {
  id: string;
  status: string;
  brief: Record<string, unknown>;
  missingDetails: string[];
  risks: string[];
  version: number;
  messages: Array<{ id: string; role: string; content: string; created_at: string }>;
}

const SERVICES = [
  { value: 'idea_validation', label: 'Idea Validation' },
  { value: 'product_testing', label: 'Product Testing' },
  { value: 'customer_research', label: 'Customer Research' },
];

const FIELDS = [
  { key: 'productSummary', label: 'What are you building?' },
  { key: 'targetCustomer', label: 'Who is it for?' },
  { key: 'problem', label: 'What problem does it solve?' },
  { key: 'goal', label: 'What do you need to learn?' },
  { key: 'suggestedTest', label: 'What should testers do first?' },
  { key: 'hypothesis', label: 'What do you believe, and what would change your mind?' },
] as const;

export default function FounderIntake() {
  const { id } = useParams<{ id: string }>();
  const request = useApiClient();
  const navigate = useNavigate();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(!id);
  const [serviceKey, setServiceKey] = useState('idea_validation');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    request<Brief>(`/api/founder/intake/${id}`).then((data) => {
      setBrief(data);
      setFields(Object.fromEntries(FIELDS.map((field) => [field.key, String(data.brief[field.key] ?? '')])));
      setLoading(false);
    }).catch(() => { setError('We could not load the guided intake.'); setLoading(false); });
  }, [id, request]);

  const start = async () => {
    setSaving(true);
    setError(null);
    try {
      const created = await request<Brief>('/api/founder/intake', { method: 'POST', body: { serviceKey } });
      navigate(`/app/founder/intake/${created.id}`, { replace: true });
      setBrief(created);
      setFields(Object.fromEntries(FIELDS.map((field) => [field.key, String(created.brief[field.key] ?? '')])));
    } catch {
      setError('We could not start guided intake.');
    } finally {
      setSaving(false);
    }
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!brief || message.trim().length < 5) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await request<Brief & { assistant?: string }>(`/api/founder/intake/${brief.id}/message`, { method: 'POST', body: { message } });
      setBrief(updated);
      setFields(Object.fromEntries(FIELDS.map((field) => [field.key, String(updated.brief[field.key] ?? '')])));
      setMessage('');
    } catch (cause) {
      setError(cause instanceof ApiError ? 'We could not save that message.' : 'We could not save that message.');
    } finally {
      setSaving(false);
    }
  };

  const confirm = async () => {
    if (!brief) return;
    setSaving(true);
    setError(null);
    try {
      const result = await request<{ id: string }>(`/api/founder/intake/${brief.id}/confirm`, {
        method: 'POST',
        body: { serviceKey, brief: fields },
      });
      navigate(`/app/founder/tests/${result.id}`, { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError && cause.fields?.brief ? cause.fields.brief : 'We could not confirm the brief.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading guided intake…" />;

  return (
    <div className="space-y-6">
      <BackLink to="/app/founder">All tests</BackLink>
      <PageHeading eyebrow="Founder" title="Guided intake" description="Answer five questions and we will save a structured brief for the team." />
      {error && <ErrorPanel message={error} />}

      {!brief ? (
        <Panel title="Choose a service">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[220px] flex-1">
              <FieldLabel htmlFor="service">Service</FieldLabel>
              <select id="service" className={inputClass} value={serviceKey} onChange={(event) => setServiceKey(event.target.value)}>
                {SERVICES.map((service) => <option key={service.value} value={service.value}>{service.label}</option>)}
              </select>
            </div>
            <button type="button" disabled={saving} onClick={() => void start()} className="min-h-[44px] rounded-full bg-sun-500 px-5 text-sm font-bold text-ink hover:bg-sun-400 disabled:opacity-60">Start guided intake</button>
          </div>
        </Panel>
      ) : (
        <>
          <Panel title="Brief chat">
            <div className="space-y-4">
              {brief.messages.map((entry) => (
                <div key={entry.id} className={entry.role === 'founder' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}>
                  <p className={entry.role === 'founder' ? 'rounded-2xl bg-sun-500 px-4 py-3 text-sm text-ink' : 'rounded-2xl bg-cream-50 px-4 py-3 text-sm text-ink'}>{entry.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="mt-5 space-y-3">
              <FieldLabel htmlFor="message">Your answer</FieldLabel>
              <textarea id="message" className={`${inputClass} min-h-[90px]`} value={message} maxLength={1000} onChange={(event) => setMessage(event.target.value)} required />
              <button type="submit" disabled={saving || message.trim().length < 5} className="min-h-[44px] rounded-full bg-sun-500 px-5 text-sm font-bold text-ink hover:bg-sun-400 disabled:opacity-60">Send</button>
            </form>
          </Panel>

          <Panel title="Structured brief" description={brief.missingDetails.length ? `Still missing: ${brief.missingDetails.join(', ')}.` : 'Ready to confirm.'}>
            {brief.risks.length > 0 && <p className="mb-4 border-l-2 border-danger pl-3 text-sm text-danger">{brief.risks.join(' ')}</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <div key={field.key} className={field.key === 'productSummary' ? 'sm:col-span-2' : undefined}>
                  <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                  <input id={field.key} className={inputClass} value={fields[field.key] ?? ''} maxLength={1000} onChange={(event) => setFields((current) => ({ ...current, [field.key]: event.target.value }))} />
                </div>
              ))}
            </div>
            <button type="button" disabled={saving || brief.missingDetails.length > 0} onClick={() => void confirm()} className="mt-6 min-h-[44px] rounded-full bg-sun-500 px-5 text-sm font-bold text-ink hover:bg-sun-400 disabled:opacity-60">Confirm brief and create project</button>
          </Panel>
        </>
      )}
    </div>
  );
}
