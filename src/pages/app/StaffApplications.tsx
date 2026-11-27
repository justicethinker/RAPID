import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi } from "@/hooks/useApi";
import type { StaffApplication } from "@/lib/dashboard-types";
import {
  EmptyState,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
  inputClass,
} from "@/pages/app/Ui";

const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["received", "Received"],
  ["under_review", "Under review"],
  ["approved", "Approved"],
  ["waitlisted", "Waitlisted"],
  ["declined", "Not selected"],
] as const;

const STATUS_LABEL: Record<string, string> = {
  received: "Received",
  under_review: "Under review",
  approved: "Approved",
  waitlisted: "Waitlisted",
  declined: "Not selected",
};

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function tone(status: string): "positive" | "warning" | "negative" | "neutral" {
  if (status === "approved") return "positive";
  if (status === "declined") return "negative";
  if (status === "under_review" || status === "waitlisted") return "warning";
  return "neutral";
}

export default function StaffApplications() {
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (appliedQuery) params.set("q", appliedQuery);
  const url = `/api/staff/applications${params.size ? `?${params}` : ""}`;

  const { data, loading, error, refresh } = useApi<StaffApplication[]>(url);

  usePageMeta({ title: "Applications | RAPID staff", noindex: true });

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Staff"
        title="Applications"
        description="Review tester applications. Decisions notify the applicant by email and in their account."
      />

      <Panel>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedQuery(query.trim());
          }}
        >
          <div className="min-w-[180px]">
            <label htmlFor="status" className="block text-sm font-semibold text-ink">
              Status
            </label>
            <select
              id="status"
              className={inputClass}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[220px] flex-1">
            <label htmlFor="search" className="block text-sm font-semibold text-ink">
              Search
            </label>
            <input
              id="search"
              className={inputClass}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name or email"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink transition-colors hover:bg-sun-400"
          >
            Apply filters
          </button>
        </form>
      </Panel>

      {loading && !data && <Loading label="Loading applications…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && (
        <Panel
          title="Applicants"
          action={
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint tabular-nums">
              {data.length} shown
            </span>
          }
        >
          {data.length === 0 ? (
            <EmptyState
              icon={<Search size={20} aria-hidden="true" />}
              title="No applications match these filters"
            >
              <p>
                Try another status, or clear the search to see everyone who has
                applied so far.
              </p>
            </EmptyState>
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm sm:min-w-[680px]">
                <thead>
                  <tr className="border-b border-cream-200 text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    <th scope="col" className="px-2 py-3 font-bold">
                      Applicant
                    </th>
                    <th scope="col" className="hidden px-2 py-3 font-bold sm:table-cell">
                      Location
                    </th>
                    <th scope="col" className="hidden px-2 py-3 font-bold sm:table-cell">
                      Situation
                    </th>
                    <th scope="col" className="hidden px-2 py-3 font-bold sm:table-cell">
                      Applied
                    </th>
                    <th scope="col" className="px-2 py-3 font-bold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((application) => (
                    <tr
                      key={application.personId}
                      className="border-b border-cream-100 transition-colors last:border-0 hover:bg-cream-50/70"
                    >
                      <td className="px-2 py-4">
                        <Link
                          to={`/staff/applications/${application.personId}`}
                          className="font-semibold text-ink underline-offset-4 hover:text-rapid-700 hover:underline"
                        >
                          {application.fullName || "No name"}
                        </Link>
                        <span className="mt-0.5 block text-[12px] text-ink-faint">
                          {application.email}
                        </span>
                        <span className="mt-1.5 block text-[12px] leading-relaxed text-ink-soft sm:hidden">
                          {application.city ?? "—"}
                          {application.country ? `, ${application.country}` : ""}
                          {" · "}
                          {application.situation?.replaceAll("_", " ") ?? "—"}
                          {" · "}
                          {shortDate(application.appliedAt)}
                        </span>
                      </td>
                      <td className="hidden px-2 py-4 text-ink-soft sm:table-cell">
                        {application.city ?? "—"}
                        {application.country ? `, ${application.country}` : ""}
                      </td>
                      <td className="hidden px-2 py-4 text-ink-soft sm:table-cell">
                        {application.situation?.replaceAll("_", " ") ?? "—"}
                      </td>
                      <td className="hidden px-2 py-4 text-ink-soft tabular-nums sm:table-cell">
                        {shortDate(application.appliedAt)}
                      </td>
                      <td className="px-2 py-4">
                        <Pill tone={tone(application.status)}>
                          {STATUS_LABEL[application.status] ??
                            application.status.replaceAll("_", " ")}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
