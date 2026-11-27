import { useState } from 'react';
import { useSession } from '@/auth/session';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useApi, useApiClient } from '@/hooks/useApi';
import { ApiError } from '@/lib/api';
import type { TesterOverviewData } from '@/lib/dashboard-types';
import {
  ErrorPanel,
  FieldLabel,
  Loading,
  PageHeading,
  Panel,
  inputClass,
} from '@/pages/app/Ui';

export default function TesterProfile() {
  const { me, refresh: refreshSession } = useSession();
  const request = useApiClient();
  const { data, loading, error, refresh } = useApi<TesterOverviewData>('/api/tester/overview');

  const [fullNameEdit, setFullName] = useState<string>();
  const fullName = fullNameEdit ?? me?.person.fullName ?? '';
  const [phoneEdit, setPhone] = useState<string>();
  const phone = phoneEdit ?? me?.person.phone ?? '';
  const [whatsappEdit, setWhatsapp] = useState<string>();
  const whatsapp = whatsappEdit ?? data?.application.whatsapp ?? '';
  const [remindersEdit, setReminders] = useState<boolean>();
  const reminders = remindersEdit ?? data?.application.whatsappReminders ?? false;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  usePageMeta({ title: 'Profile | RAPID', noindex: true });



  if (loading && !data) return <Loading label="Loading your profile…" />;
  if (error) return <ErrorPanel message={error} onRetry={() => void refresh()} />;
  if (!data || !me) return null;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setFormError(null);
    try {
      await request('/api/tester/profile', {
        method: 'PATCH',
        body: { fullName, phone, whatsapp, whatsappReminders: reminders },
      });
      await Promise.all([refreshSession(), refresh()]);
      setFullName(undefined);
      setPhone(undefined);
      setWhatsapp(undefined);
      setReminders(undefined);
      setSaved(true);
    } catch (cause) {
      const fields = cause instanceof ApiError ? cause.fields : undefined;
      setFormError(fields ? Object.values(fields)[0] ?? 'Check the fields.' : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Tester"
        title="Profile"
        description="Keep your contact details current so invitations and rewards reach you."
      />

      {formError && <ErrorPanel message={formError} />}
      {saved && (
        <p className="rounded-xl border border-rapid-100 bg-rapid-50 p-4 text-sm font-semibold text-rapid-700">
          Profile saved.
        </p>
      )}

      <Panel title="Contact details">
        <form onSubmit={save} className="space-y-5">
          <div>
            <FieldLabel htmlFor="full-name">Full name</FieldLabel>
            <input
              id="full-name"
              className={inputClass}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <input
              id="email"
              className={`${inputClass} bg-cream-50 text-ink-soft`}
              value={me.person.email}
              readOnly
            />
            <p className="mt-1 text-xs text-ink-soft">
              Email changes are handled by support so an account cannot be taken over.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="phone" hint="Include your country code.">
                Phone
              </FieldLabel>
              <input
                id="phone"
                type="tel"
                className={inputClass}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </div>
            <div>
              <FieldLabel htmlFor="whatsapp" hint="Include your country code.">
                WhatsApp
              </FieldLabel>
              <input
                id="whatsapp"
                type="tel"
                className={inputClass}
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={reminders}
              onChange={(event) => setReminders(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-cream-300 text-rapid-700 focus:ring-rapid-500"
            />
            You may send WhatsApp reminders about my application and suitable tests.
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </Panel>

      <Panel title="Leaving the pilot">
        <p className="max-w-[62ch] text-ink-soft">
          Email support to request removal. RAPID anonymises your record, keeps the test
          counts intact and stops contacting you.
        </p>
      </Panel>
    </div>
  );
}
