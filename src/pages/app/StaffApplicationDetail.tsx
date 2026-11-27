import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi, useApiClient } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import type { StaffApplication } from "@/lib/dashboard-types";
import { labelAgeBand, labelInterest, labelSituation } from "@/lib/labels";
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
} from "@/pages/app/Ui";

const DECISIONS = [
  ["under_review", "Mark under review"],
  ["approved", "Approve"],
  ["waitlisted", "Waitlist"],
  ["declined", "Not selected"],
] as const;

export default function StaffApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const request = useApiClient();
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useApi<StaffApplication>(
    id ? `/api/staff/applications/${id}` : null,
  );

  const [note, setNote] = useState("");
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  usePageMeta({ title: "Application | RAPID staff", noindex: true });

  if (data && loadedId !== data.personId) {
    setNote(data.note ?? "");
    setLoadedId(data.personId);
  }

  if (loading && !data) return <Loading label="Loading application…" />;
  if (error)
    return <ErrorPanel message={error} onRetry={() => void refresh()} />;
  if (!data || !id) return null;

  const decide = async (status: string) => {
    setPending(true);
    setActionError(null);
    try {
      await request(`/api/staff/applications/${id}/decision`, {
        method: "POST",
        body: { status, note },
      });
      await refresh();
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? (Object.values(cause.fields ?? {})[0] ??
              "Could not save the decision.")
          : "Could not save the decision.",
      );
    } finally {
      setPending(false);
    }
  };

  const anonymise = async () => {
    if (
      !window.confirm(
        "Anonymise this person? Their name, email, phone and written answers will be cleared. Counts stay intact. This cannot be undone.",
      )
    ) {
      return;
    }
    setPending(true);
    try {
      await request(`/api/staff/people/${id}/anonymise`, { method: "POST" });
      navigate("/staff/applications", { replace: true });
    } catch {
      setActionError("Could not anonymise this person.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackLink to="/staff/applications">Application queue</BackLink>

      <PageHeading
        eyebrow="Application"
        title={data.fullName || "No name"}
        description={data.email}
      >
        <Pill tone={data.status === "approved" ? "positive" : "neutral"}>
          {data.status.replaceAll("_", " ")}
        </Pill>
      </PageHeading>

      {actionError && <ErrorPanel message={actionError} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Contact">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Meta label="Email">
              <span className="break-all font-normal">{data.email}</span>
            </Meta>
            <Meta label="Phone">{data.phone ?? "—"}</Meta>
            <Meta label="WhatsApp">{data.whatsapp ?? "—"}</Meta>
            <Meta label="Reference">
              <span className="break-all font-mono text-xs text-ink-soft">
                {data.reference}
              </span>
            </Meta>
            <Meta label="Applied">
              {new Date(data.appliedAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Meta>
          </dl>
        </Panel>

        <Panel title="Situation">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Meta label="Country">{data.country ?? "—"}</Meta>
            <Meta label="City or state">{data.city ?? "—"}</Meta>
            <Meta label="Age band">{labelAgeBand(data.ageBand) ?? "—"}</Meta>
            <Meta label="Main situation">
              {labelSituation(data.situation) ?? "—"}
            </Meta>
            <Meta label="Industry">{data.industry ?? "—"}</Meta>
            <div className="sm:col-span-2">
              <Meta label="Other activities">
                <span className="font-normal text-ink-soft">
                  {data.otherActivities
                    .map((item) => labelSituation(item) ?? item)
                    .join(", ") || "—"}
                </span>
              </Meta>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel
        title="Interests"
        description="What this applicant asked to be considered for."
      >
        <ul className="flex flex-wrap gap-2">
          {data.interests.length === 0 && (
            <li className="text-ink-soft">No interests recorded.</li>
          )}
          {data.interests.map((interest) => (
            <li
              key={interest}
              className="rounded-full border border-cream-200 bg-cream-50 px-3 py-1 text-sm font-semibold text-ink"
            >
              {labelInterest(interest)}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="What they told us">
        {data.frustration ? (
          <Quote label="Applicant's own words">
            <span className="whitespace-pre-line">{data.frustration}</span>
          </Quote>
        ) : (
          <p className="text-ink-soft">No answer recorded.</p>
        )}
      </Panel>

      <Panel
        title="Decision"
        description="The applicant receives an in-app notification and an email."
      >
        <FieldLabel htmlFor="note" hint="Optional. Visible to staff only.">
          Review note
        </FieldLabel>
        <textarea
          id="note"
          className={`${inputClass} min-h-[90px]`}
          value={note}
          maxLength={1000}
          onChange={(event) => setNote(event.target.value)}
        />
        {data.note && (
          <p className="mt-2 text-xs text-ink-soft">
            Current note: {data.note}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {DECISIONS.map(([status, label]) => (
            <button
              key={status}
              type="button"
              disabled={pending}
              onClick={() => void decide(status)}
              className={`inline-flex min-h-[44px] items-center rounded-xl border px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
                data.status === status
                  ? "border-rapid-700 bg-rapid-50 text-rapid-700"
                  : "border-cream-300 bg-white text-ink hover:border-rapid-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Privacy">
        <p className="max-w-[62ch] text-sm text-ink-soft">
          Anonymising clears the name, email, phone and written answers in
          place. Invitation and response counts stay intact so founder reports
          do not change.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => void anonymise()}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-full border border-danger/30 bg-white px-4 text-sm font-semibold text-danger hover:bg-danger-50 disabled:opacity-60"
        >
          Anonymise person
        </button>
      </Panel>
    </div>
  );
}
