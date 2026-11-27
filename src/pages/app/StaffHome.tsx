import { useState } from "react";
import { Download, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useSession } from "@/auth/session";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi } from "@/hooks/useApi";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger } from "@/components/motion/Reveal";
import {
  EmptyState,
  ErrorPanel,
  Loading,
  Meta,
  PageHeading,
  Panel,
  Stat,
} from "@/pages/app/Ui";

interface StaffSummary {
  applications: {
    received: number;
    underReview: number;
    approved: number;
    waitlisted: number;
    declined: number;
  };
  tests: {
    requested: number;
    scoping: number;
    recruiting: number;
    fielding: number;
    findings: number;
    published: number;
    closed: number;
    cancelled: number;
  };
  totals: {
    testers: number;
    founders: number;
    invitations: number;
    responses: number;
  };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

const EXPORTS = [
  ["testers", "Testers"],
  ["founders", "Founders"],
  ["invitations", "Invitations"],
] as const;

export default function StaffHome() {
  const { getToken, me } = useSession();
  const { data: summary, loading, error, refresh: load } = useApi<StaffSummary>("/api/staff/summary");
  const status = loading ? "loading" : error ? "error" : "ready";
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  usePageMeta({ title: "Staff | RAPID", noindex: true });

  const download = async (type: "testers" | "founders" | "invitations") => {
    setExporting(type);
    setExportError(null);
    try {
      const token = await getToken();
      const response = await fetch(`/api/staff/export?type=${type}`, {
        credentials: "same-origin",
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error("export failed");
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const name =
        disposition.match(/filename="([^"]+)"/)?.[1] ?? `rapid-${type}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("The export did not download. Try again.");
    } finally {
      setExporting(null);
    }
  };

  if (!me) return null;

  const applicationsTotal = summary
    ? sum([
        summary.applications.received,
        summary.applications.underReview,
        summary.applications.approved,
        summary.applications.waitlisted,
        summary.applications.declined,
      ])
    : 0;

  const testsTotal = summary
    ? sum([
        summary.tests.requested,
        summary.tests.scoping,
        summary.tests.recruiting,
        summary.tests.fielding,
        summary.tests.findings,
        summary.tests.published,
        summary.tests.closed,
        summary.tests.cancelled,
      ])
    : 0;

  const queueEmpty =
    summary !== null && applicationsTotal === 0 && testsTotal === 0;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Staff operations"
        title="Pilot operations"
        description="Live counts from the RAPID database. Nothing here is typed in."
      >
        <button
          type="button"
          onClick={() => void load()}
          disabled={status === "loading"}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-studio-300 bg-studio-25 px-5 text-sm font-semibold text-ink transition-colors hover:border-brand-600 disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
          Refresh
        </button>
      </PageHeading>

      {status === "error" && (
        <ErrorPanel
          message="The staff summary did not load. Check the API and database."
          onRetry={() => void load()}
        />
      )}

      {status === "loading" && !summary && (
        <Loading label="Loading the queue…" />
      )}

      {summary && (
        <>
          {queueEmpty && (
            <Panel>
              <EmptyState
                icon={<ShieldCheck size={20} aria-hidden="true" />}
                title="The queue is empty"
              >
                <p>
                  New tester applications and founder test requests appear here
                  as they are submitted. No sample records are shown.
                </p>
              </EmptyState>
            </Panel>
          )}

          <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Stat
              label="Awaiting review"
              value={
                summary.applications.received + summary.applications.underReview
              }
              hint="Received or under review"
            />
            <Stat
              label="Approved testers"
              value={summary.applications.approved}
              hint="Cleared to be invited"
            />
            <Stat
              label="Tests in progress"
              value={
                summary.tests.scoping +
                summary.tests.recruiting +
                summary.tests.fielding +
                summary.tests.findings
              }
              hint="Scoping through findings"
            />
            <Stat
              label="Responses received"
              value={summary.totals.responses}
              hint="Written evidence collected"
            />
          </Stagger>

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <Breakdown
              title="Applications"
              total={applicationsTotal}
              rows={[
                ["Received", summary.applications.received],
                ["Under review", summary.applications.underReview],
                ["Approved", summary.applications.approved],
                ["Waitlisted", summary.applications.waitlisted],
                ["Not selected", summary.applications.declined],
              ]}
            />
            <Breakdown
              title="Tests"
              total={testsTotal}
              rows={[
                ["Requested", summary.tests.requested],
                ["Scoping", summary.tests.scoping],
                ["Recruiting", summary.tests.recruiting],
                ["Fielding", summary.tests.fielding],
                ["Findings", summary.tests.findings],
                ["Published", summary.tests.published],
                ["Closed", summary.tests.closed],
                ["Cancelled", summary.tests.cancelled],
              ]}
            />
          </div>

          <Panel
            title="Pilot totals"
            description="Everyone and everything currently on the books."
          >
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Meta label="Testers">
                <CountUp value={summary.totals.testers} />
              </Meta>
              <Meta label="Founders">
                <CountUp value={summary.totals.founders} />
              </Meta>
              <Meta label="Invitations">
                <CountUp value={summary.totals.invitations} />
              </Meta>
              <Meta label="Responses">
                <CountUp value={summary.totals.responses} />
              </Meta>
            </dl>
          </Panel>

          <Panel
            title="Export"
            description="CSV files contain contact details. Download only for a specific operational need, and delete the file afterwards."
          >
            {exportError && (
              <p role="alert" className="mb-4 text-sm font-semibold text-danger">
                {exportError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {EXPORTS.map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => void download(type)}
                  disabled={exporting !== null}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-studio-300 bg-studio-25 px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-600 disabled:opacity-60"
                >
                  {exporting === type ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Download size={15} aria-hidden="true" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

/**
 * A state breakdown reads like the public evidence blocks: a plain label, the
 * count, and its share of the total so nobody reads a number without a
 * denominator.
 */
function Breakdown({
  title,
  total,
  rows,
}: {
  title: string;
  total: number;
  rows: [string, number][];
}) {
  return (
    <Panel
      title={title}
      action={
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-studio-600 tabular-nums">
          <CountUp value={total} /> total
        </span>
      }
    >
      <dl className="rows divide-y divide-studio-200">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-3 py-2.5"
          >
            <dt className="text-sm text-light-muted">{label}</dt>
            <dd className="flex items-baseline gap-2.5 tabular-nums">
              {total > 0 && (
                <span className="text-[11px] text-studio-600">
                  {Math.round((value / total) * 100)}%
                </span>
              )}
              <span className="min-w-[2ch] text-right text-sm font-semibold text-ink">
                {value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
