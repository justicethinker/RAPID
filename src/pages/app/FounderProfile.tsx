import { useState } from "react";
import { useSession } from "@/auth/session";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApiClient } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import {
  ErrorPanel,
  FieldLabel,
  PageHeading,
  Panel,
  inputClass,
} from "@/pages/app/Ui";

export default function FounderProfile() {
  const { me, refresh } = useSession();
  const request = useApiClient();
  const [fullNameEdit, setFullName] = useState<string>();
  const fullName = fullNameEdit ?? me?.person.fullName ?? '';
  const [phoneEdit, setPhone] = useState<string>();
  const phone = phoneEdit ?? me?.person.phone ?? '';
  const [organisationEdit, setOrganisation] = useState<string>();
  const organisation = organisationEdit ?? me?.founder?.organisation ?? '';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({ title: "Founder profile | RAPID", noindex: true });



  if (!me) return null;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await request("/api/me", {
        method: "PATCH",
        body: { fullName, phone, organisation },
      });
      await refresh();
      setFullName(undefined);
      setPhone(undefined);
      setOrganisation(undefined);
      setSaved(true);
    } catch (cause) {
      const fields = cause instanceof ApiError ? cause.fields : undefined;
      setError(
        fields
          ? (Object.values(fields)[0] ?? "Check the fields.")
          : "Could not save.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Founder"
        title="Profile"
        description="The team uses these details to scope your tests."
      />

      {error && <ErrorPanel message={error} />}
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
          </div>
          <div>
            <FieldLabel htmlFor="organisation" hint="Optional.">
              Organisation
            </FieldLabel>
            <input
              id="organisation"
              className={inputClass}
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
              autoComplete="organization"
            />
          </div>
          <div>
            <FieldLabel htmlFor="phone" hint="Include your country code.">
              Phone or WhatsApp
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
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
