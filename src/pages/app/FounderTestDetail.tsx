import { useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi, useApiClient } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import type { FounderTestDetail as TestDetail } from "@/lib/dashboard-types";
import { labelOutcome } from "@/lib/labels";
import { FOUNDER_AUDIENCES, labelFor } from "@/content/pilot";
import { cn } from "@/lib/cn";
import {
  BackLink,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
  Quote,
  type Tone,
} from "@/pages/app/Ui";
import { formatDay } from "@/pages/app/status";

const STATUSES = [
  ["requested", "Requested"],
  ["scoping", "Scoping"],
  ["recruiting", "Recruiting"],
  ["fielding", "Fielding"],
  ["findings", "Findings"],
  ["published", "Published"],
] as const;

const DECISIONS = [
  ["build", "Build it"],
  ["iterate", "Iterate"],
  ["pivot", "Pivot"],
] as const;

function toneFor(status: string): Tone {
  if (status === "published") return "proof";
  if (status === "cancelled") return "negative";
  if (status === "findings") return "warning";
  return "neutral";
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </dt>
      <dd>
        <span className="mt-2 block text-[32px] font-extrabold leading-none tracking-[-0.04em] text-ink tabular-nums">
          {value}
        </span>
        {hint && (
          <span className="mt-1.5 block text-xs leading-snug text-ink-soft">
            {hint}
          </span>
        )}
      </dd>
    </div>
  );
}

export default function FounderTestDetail() {
  const { id } = useParams<{ id: string }>();
  const request = useApiClient();
  const { data, loading, error, refresh } = useApi<TestDetail>(
    id ? `/api/founder/tests/${id}` : null,
  );
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  usePageMeta({ title: "Test detail | RAPID", noindex: true });

  if (loading && !data) return <Loading label="Loading the test…" />;
  if (error)
    return <ErrorPanel message={error} onRetry={() => void refresh()} />;
  if (!data || !id) return null;

  const statusIndex = STATUSES.findIndex(([value]) => value === data.status);
  const responseTotal = data.outcomes.reduce(
    (total, outcome) => total + outcome.count,
    0,
  );
  const audience = labelFor(FOUNDER_AUDIENCES, data.audienceCode);

  const downloadReport = async () => {
    setDownloading(true);
    setReportError(null);
    try {
      const result = await request<{ filename: string; markdown: string }>(
        `/api/founder/tests/${id}/report`,
      );
      const blob = new Blob([result.markdown], {
        type: 'text/markdown;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setReportError('The report could not be downloaded. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  const pay = async () => {
    setPaying(true);
    setPaymentError(null);
    try {
      const result = await request<{ authorizationUrl: string }>(`/api/founder/tests/${id}/payment/initialize`, { method: 'POST', body: {} });
      window.location.href = result.authorizationUrl;
    } catch (cause) {
      setPaymentError(cause instanceof ApiError ? 'Payment could not be started. Check the project price.' : 'Payment could not be started.');
    } finally {
      setPaying(false);
    }
  };

  const decide = async (decision: string) => {
    setSaving(true);
    setActionError(null);
    try {
      await request(`/api/founder/tests/${id}/decision`, {
        method: "POST",
        body: { decision },
      });
      await refresh();
    } catch (cause) {
      setActionError(
        cause instanceof ApiError && cause.fields
          ? (Object.values(cause.fields)[0] ?? "Could not save the decision.")
          : "Could not save the decision.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackLink to="/app/founder">All tests</BackLink>

      <PageHeading
        eyebrow="Founder test"
        title={data.title || "Untitled test"}
        description={data.question}
      >
        <Pill tone={toneFor(data.status)}>{data.status}</Pill>
      </PageHeading>

      <Panel
        title="Progress"
        description="Six stages, from the first request to published findings."
      >
        <ol className="grid gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {STATUSES.map(([value, label], index) => {
            const done = statusIndex >= index && statusIndex !== -1;
            return (
              <li key={value} className="min-w-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-[2px] w-full rounded-full",
                    done ? "bg-rapid-600" : "bg-cream-200",
                  )}
                />
                <span className="mt-2.5 flex items-baseline gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "text-[10px] font-bold tabular-nums",
                      done ? "text-rapid-700" : "text-ink-faint",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[13px]",
                      statusIndex === index
                        ? "font-bold text-ink"
                        : done
                          ? "font-semibold text-ink"
                          : "text-ink-faint",
                    )}
                  >
                    {label}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        {data.status === "cancelled" && (
          <p className="mt-5 border-l-2 border-danger pl-3 text-sm text-danger">
            This test was cancelled by the team.
          </p>
        )}
      </Panel>

      <Panel
        title="The brief"
        description="The scope the team agreed before recruitment. Fields marked “to be agreed” are still being confirmed."
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Question
            </dt>
            <dd className="mt-1.5 max-w-[70ch] text-[15px] leading-relaxed text-ink">
              {data.question}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Audience
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-ink">
              {audience || data.audienceDescription || "To be agreed"}
            </dd>
            {audience && data.audienceDescription && (
              <dd className="mt-1 text-xs leading-relaxed text-ink-soft">
                {data.audienceDescription}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Method
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink">
              {data.method || "To be agreed"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Target completions
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-ink tabular-nums">
              {data.sampleTarget ?? "To be agreed"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Report due
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-ink">
              {data.reportDueAt ? formatDay(data.reportDueAt) : "To be agreed"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Reward
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink">
              {data.rewardNote || "No reward confirmed"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Startup
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-ink">
              {data.startupName || "Founder account"}
            </dd>
          </div>
        </dl>
        {data.terms && (
          <div className="mt-6 border-t border-cream-200 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Task terms
            </p>
            <p className="mt-2 max-w-[70ch] whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {data.terms}
            </p>
          </div>
        )}
      </Panel>

      {data.brief && (
        <Panel title="Guided brief" description={`Status: ${data.brief.status} · Version ${data.brief.version}`}>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div><dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">Service</dt><dd className="mt-1 text-sm text-ink">{data.serviceKey.replaceAll('_', ' ')}</dd></div>
            <div><dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">Product</dt><dd className="mt-1 text-sm text-ink">{String(data.brief.brief.productSummary ?? '')}</dd></div>
            <div><dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">Customer</dt><dd className="mt-1 text-sm text-ink">{String(data.brief.brief.targetCustomer ?? '')}</dd></div>
            <div><dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">Goal</dt><dd className="mt-1 text-sm text-ink">{String(data.brief.brief.goal ?? '')}</dd></div>
          </dl>
          {data.brief.risks.length > 0 && <p className="mt-4 border-l-2 border-warning pl-3 text-sm text-warning">{data.brief.risks.join(' ')}</p>}
        </Panel>
      )}

      <Panel title="Payment" description="Recruitment starts only after the payment is verified by the provider.">
        {paymentError && <ErrorPanel message={paymentError} />}
        <dl className="grid gap-5 sm:grid-cols-3">
          <Metric label="Status" value={data.paymentStatus.replaceAll('_', ' ')} />
          <Metric label="Project status" value={data.projectStatus.replaceAll('_', ' ')} />
          <Metric label="Price" value={data.priceAmount ? `${(data.priceAmount / 100).toLocaleString()} ${data.priceCurrency ?? ''}` : 'Not set'} />
        </dl>
        {data.priceAmount && data.paymentStatus !== 'paid' && <button type="button" disabled={paying} onClick={() => void pay()} className="mt-5 min-h-[44px] rounded-full bg-sun-500 px-5 text-sm font-bold text-ink hover:bg-sun-400 disabled:opacity-60">{paying ? 'Starting…' : 'Pay now'}</button>}
        {data.payments.length > 0 && <ul className="mt-5 space-y-2 text-sm text-ink-soft">{data.payments.map((payment) => <li key={payment.id}>{payment.provider_reference} · {payment.status} · {(payment.amountKobo / 100).toLocaleString()} {payment.currency}</li>)}</ul>}
      </Panel>

      <Panel
        title="Evidence so far"
        description="Counts are live. They are the same numbers the team uses when it reviews this test."
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
          <Metric label="Invited" value={data.counts.invited} />
          <Metric
            label="Accepted"
            value={data.counts.accepted}
            hint="Includes completed"
          />
          <Metric label="Responses" value={data.counts.responses} />
          <Metric
            label="Response rate"
            value={
              data.counts.responseRate === null
                ? "—"
                : `${data.counts.responseRate}%`
            }
            hint={
              data.counts.responseRate === null
                ? "No accepted testers yet"
                : `${data.counts.responses} of ${data.counts.accepted} accepted`
            }
          />
        </dl>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-cream-200 pt-5 sm:grid-cols-4">
          <Metric label="Assigned" value={data.actionCounts.assigned} />
          <Metric label="Opened" value={data.actionCounts.linkOpened} />
          <Metric label="Self-reported" value={data.actionCounts.selfReported} />
          <Metric label="Verified" value={data.actionCounts.verified} />
        </dl>
        {data.actionReasons.length > 0 && <p className="mt-4 text-xs text-ink-soft">Reasons: {data.actionReasons.map((item) => `${item.reason} (${item.count})`).join(' · ')}</p>}
        {data.audienceBreakdown.length > 0 && <p className="mt-2 text-xs text-ink-soft">Audience: {data.audienceBreakdown.map((item) => `${item.label} (${item.count})`).join(' · ')}</p>}

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-cream-200 pt-4 text-xs text-ink-faint">
          <span className="tabular-nums">{data.counts.completed} completed</span>
          <span aria-hidden="true" className="h-3 w-px bg-cream-300" />
          <span className="tabular-nums">{data.counts.declined} declined</span>
        </div>

        <div className="mt-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            What testers did
          </p>
          {data.outcomes.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">No responses yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {data.outcomes.map((outcome) => {
                const share =
                  responseTotal > 0
                    ? Math.round((outcome.count / responseTotal) * 100)
                    : 0;
                return (
                  <li key={outcome.outcome}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-ink">
                        {labelOutcome(outcome.outcome)}
                      </span>
                      <span className="text-sm font-semibold text-ink tabular-nums">
                        {outcome.count}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="mt-2 block h-1 overflow-hidden rounded-full bg-cream-200"
                    >
                      <span
                        className="block h-full rounded-full bg-rapid-600"
                        style={{ width: `${share}%` }}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Panel>

      <Panel
        title="Published report"
        description="Published only after the team has reviewed the responses."
        action={
          data.findings ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rapid-700 tabular-nums">
                v{data.findings.version} · {formatDay(data.findings.publishedAt)}
              </span>
              <button
                type="button"
                onClick={() => void downloadReport()}
                disabled={downloading}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 text-xs font-semibold text-ink hover:border-rapid-600 disabled:opacity-60"
              >
                <Download size={14} aria-hidden="true" />
                {downloading ? 'Preparing…' : 'Download report'}
              </button>
            </div>
          ) : undefined
        }
      >
        {reportError && <ErrorPanel message={reportError} />}
        {data.findings ? (
          <article>
            <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-rapid-700">
              <span aria-hidden="true" className="h-px w-6 bg-rapid-600/60" />
              Published finding · Version {data.findings.version}
            </p>
            <h3 className="font-display mt-3 max-w-[26ch] text-[26px] font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[30px]">
              {data.findings.headline}
            </h3>
            <p className="mt-4 max-w-[64ch] whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
              {data.findings.summary}
            </p>

            <ul className="mt-7 divide-y divide-cream-200 border-y border-cream-200">
              {data.findings.learnings.map((learning, index) => (
                <li
                  key={learning.label}
                  className="grid gap-2 py-4 sm:grid-cols-[48px_1fr] sm:gap-4"
                >
                  <span
                    aria-hidden="true"
                    className="text-[10px] font-bold tracking-[0.14em] text-ink-faint tabular-nums sm:pt-1"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{learning.label}</p>
                    <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-ink-soft">
                      {learning.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {data.findings.limits && (
              <div className="mt-6 border-l-2 border-rapid-600 bg-rapid-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rapid-700">
                  What this cannot tell you
                </p>
                <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-ink-soft">
                  {data.findings.limits}
                </p>
              </div>
            )}

            {data.findings.recommendation && (
              <div className="mt-6 rounded-xl border border-rapid-200 bg-rapid-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rapid-700">
                  Suggested next step
                </p>
                <p className="mt-2 max-w-[62ch] whitespace-pre-line text-sm leading-relaxed text-ink">
                  {data.findings.recommendation}
                </p>
              </div>
            )}

            {data.quotes.length > 0 && (
              <div className="mt-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                  What testers said
                </p>
                <ul className="mt-4 space-y-5">
                  {data.quotes.map((quote, index) => (
                    <li key={index}>
                      <Quote label="Tester response · anonymous">
                        {quote.note}
                      </Quote>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ) : (
          <p className="max-w-[62ch] leading-relaxed text-ink-soft">
            Findings appear here after the team has reviewed responses and
            published them. Recruitment counts above are live.
          </p>
        )}
      </Panel>

      {data.findings && (
        <Panel
          title="Your decision"
          description="Record what this evidence means for the product. This is visible to the RAPID team."
        >
          {actionError && <ErrorPanel message={actionError} />}
          <div
            role="group"
            aria-label="Record your decision"
            className="inline-flex flex-wrap gap-1 rounded-xl border border-cream-200 bg-cream-50 p-1"
          >
            {DECISIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={saving}
                aria-pressed={data.decision === value}
                onClick={() => void decide(value)}
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60",
                  data.decision === value
                    ? "bg-white text-rapid-700 shadow-elev-1"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {data.decision && (
            <p className="mt-4 text-sm text-ink-soft">
              Recorded:{" "}
              {data.decision.charAt(0).toUpperCase() + data.decision.slice(1)}
              {data.decidedAt
                ? ` on ${formatDay(data.decidedAt)}`
                : ""}
              .
            </p>
          )}
        </Panel>
      )}
    </div>
  );
}
