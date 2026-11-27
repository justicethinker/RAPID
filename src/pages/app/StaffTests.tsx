import { useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi } from "@/hooks/useApi";
import type { StaffTestSummary } from "@/lib/dashboard-types";
import {
  EmptyState,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
  inputClass,
} from "@/pages/app/Ui";

const STATUSES = [
  ["", "All statuses"],
  ["requested", "Requested"],
  ["scoping", "Scoping"],
  ["recruiting", "Recruiting"],
  ["fielding", "Fielding"],
  ["findings", "Findings"],
  ["published", "Published"],
  ["closed", "Closed"],
  ["cancelled", "Cancelled"],
] as const;

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  scoping: "Scoping",
  recruiting: "Recruiting",
  fielding: "Fielding",
  findings: "Findings",
  published: "Published",
  closed: "Closed",
  cancelled: "Cancelled",
};

function tone(status: string): "positive" | "warning" | "negative" | "neutral" {
  if (status === "published" || status === "closed") return "positive";
  if (status === "cancelled") return "negative";
  if (status === "findings") return "warning";
  return "neutral";
}

export default function StaffTests() {
  const [status, setStatus] = useState("");
  const url = `/api/staff/tests${status ? `?status=${status}` : ""}`;
  const { data, loading, error, refresh } = useApi<StaffTestSummary[]>(url);

  usePageMeta({ title: "Tests | RAPID staff", noindex: true });

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Staff"
        title="Tests"
        description="Scope requests, invite matched testers, review responses and publish findings."
      />

      <Panel>
        <label htmlFor="status" className="block text-sm font-semibold text-ink">
          Status
        </label>
        <select
          id="status"
          className={`${inputClass} max-w-[280px]`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Panel>

      {loading && !data && <Loading label="Loading tests…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && (
        <Panel
          title="All tests"
          action={
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-studio-600 tabular-nums">
              {data.length} shown
            </span>
          }
        >
          {data.length === 0 ? (
            <EmptyState
              icon={<FlaskConical size={20} aria-hidden="true" />}
              title="No tests match this filter"
            >
              <p>
                Choose another status, or wait for a founder request to arrive.
                Nothing is created on the public site without a founder asking
                for it.
              </p>
            </EmptyState>
          ) : (
            <ul className="rows divide-y divide-studio-200">
              {data.map((test, index) => (
                <li key={test.id}>
                  <Link
                    to={`/staff/tests/${test.id}`}
                    className="group grid grid-cols-[28px_1fr] gap-3 py-5 transition-colors duration-300 sm:grid-cols-[40px_1fr] sm:gap-4"
                  >
                    <span
                      aria-hidden="true"
                      className="pt-1 text-[10px] font-bold tracking-[0.14em] text-studio-600 tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span className="flex flex-wrap items-start justify-between gap-3">
                        <span className="text-[17px] font-bold leading-snug tracking-[-0.01em] text-ink group-hover:text-brand-700">
                          {test.title || "Untitled test"}
                        </span>
                        <Pill tone={tone(test.status)}>
                          {STATUS_LABEL[test.status] ?? test.status}
                        </Pill>
                      </span>

                      <span className="mt-1.5 block max-w-[65ch] text-sm leading-relaxed text-light-muted">
                        {test.question}
                      </span>

                      <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-studio-600">
                        <span className="font-semibold text-ink">
                          {test.founder.name || test.founder.email}
                        </span>
                        <span aria-hidden="true" className="h-3 w-px bg-studio-300" />
                        <span className="tabular-nums">
                          {test.counts.invited} invited
                        </span>
                        <span aria-hidden="true" className="h-3 w-px bg-studio-300" />
                        <span className="tabular-nums">
                          {test.counts.accepted} accepted
                        </span>
                        <span aria-hidden="true" className="h-3 w-px bg-studio-300" />
                        <span className="tabular-nums">
                          {test.counts.responses} response
                          {test.counts.responses === 1 ? "" : "s"}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
