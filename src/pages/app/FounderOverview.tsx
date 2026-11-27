import { Link } from "react-router-dom";
import { ArrowUpRight, Compass, FileText, Plus, Users } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi } from "@/hooks/useApi";
import type { FounderStartupResponse, FounderTestSummary } from "@/lib/dashboard-types";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { cn } from "@/lib/cn";
import {
  EmptyState,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
  Stat,
  StatusTimeline,
  type Tone,
} from "@/pages/app/Ui";
import { formatDay } from "@/pages/app/status";

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

const TIMELINE = ["requested", "scoping", "recruiting", "fielding", "findings", "published"].map((key) => ({
  key,
  label: STATUS_LABEL[key] ?? key,
}));

const LIVE_STATUSES = new Set(["recruiting", "fielding", "findings"]);

function nextActionFor(status: string, decision: string | null): string {
  switch (status) {
    case "requested":
      return "Waiting for the team to scope this request.";
    case "scoping":
      return "The team is scoping the question and audience with you.";
    case "recruiting":
      return "The team is inviting matched testers. No action needed yet.";
    case "fielding":
      return "Invited testers are completing the task.";
    case "findings":
      return "The team is reviewing responses before publishing findings.";
    case "published":
      return decision
        ? `Decision recorded: ${decision}. The team can see it.`
        : "Findings are ready. Read them and record your decision.";
    case "closed":
      return "This test is closed.";
    case "cancelled":
      return "This test was cancelled by the team.";
    default:
      return "The team will update you on the next step.";
  }
}

function toneFor(status: string): Tone {
  // Published findings are the proof this whole surface exists for, so they
  // wear the evidence colour rather than the action green.
  if (status === "published") return "proof";
  if (status === "closed") return "positive";
  if (status === "cancelled") return "negative";
  if (status === "findings") return "warning";
  return "neutral";
}

export default function FounderOverview() {
  const { data, loading, error, refresh } =
    useApi<FounderTestSummary[]>("/api/founder/tests");
  const {
    data: startupData,
    loading: startupLoading,
    error: startupError,
    refresh: refreshStartup,
  } = useApi<FounderStartupResponse>("/api/founder/startup");
  const startup = startupData?.startup ?? null;
  const publicUrl = startup?.visibility === "published"
    ? `${window.location.origin}/startup/${startup.slug}`
    : null;

  usePageMeta({ title: "Founder account | RAPID", noindex: true });

  const tests = data ?? [];
  const live = tests.filter((test) => LIVE_STATUSES.has(test.status)).length;
  const published = tests.filter((test) => test.status === "published").length;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Founder workspace"
        title="Your startup"
        description="Build your public profile, share what you are learning and follow every validation request in one place."
      >
        <Link
          to="/app/founder/posts"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400"
        >
          <FileText size={16} aria-hidden="true" />
          Create post
        </Link>
      </PageHeading>

      {startupLoading && !startupData && <Loading label="Loading your startup…" />}
      {startupError && (
        <ErrorPanel message={startupError} onRetry={() => void refreshStartup()} />
      )}

      {startupData && !startup && (
        <Panel
          title="Your public startup profile"
          description="Set up your profile before you publish a post or share a waitlist link."
        >
          <EmptyState icon={<Compass size={20} aria-hidden="true" />} title="Start with your startup">
            <p>
              Add a name, a short description and a category. You can publish it when you are ready.
            </p>
            <Link
              to="/app/founder/startup"
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400"
            >
              Set up startup
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </EmptyState>
        </Panel>
      )}

      {startup && (
        <Panel
          title={startup.name}
          description={
            startup.visibility === "published"
              ? "Your profile is public and ready to share."
              : "Your profile is a draft. Publish it to share a public link."
          }
          action={
            <Link
              to="/app/founder/startup"
              className="inline-flex min-h-[36px] items-center rounded-full px-3 text-sm font-semibold text-rapid-700 transition-colors hover:bg-rapid-50"
            >
              Edit profile
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Link to="/app/founder/posts" className="lift rounded-2xl bg-cream-50 p-4 ring-1 ring-cream-200 hover:ring-rapid-300">
              <span className="flex items-center gap-2 text-xs font-semibold text-ink-faint">
                <FileText size={14} aria-hidden="true" /> Posts
              </span>
              <span className="mt-2 block font-display text-[34px] font-bold leading-none tracking-[-0.04em] text-ink tabular-nums">
                {startup.counts.posts}
              </span>
              <span className="mt-1 block text-xs text-ink-soft">
                {startup.counts.publishedPosts} published
              </span>
            </Link>
            <Link to="/app/founder/audience" className="lift rounded-2xl bg-cream-50 p-4 ring-1 ring-cream-200 hover:ring-rapid-300">
              <span className="flex items-center gap-2 text-xs font-semibold text-ink-faint">
                <Users size={14} aria-hidden="true" /> Waitlist
              </span>
              <span className="mt-2 block font-display text-[34px] font-bold leading-none tracking-[-0.04em] text-ink tabular-nums">
                {startup.counts.waitlist}
              </span>
              <span className="mt-1 block text-xs text-ink-soft">
                {startup.counts.waitlist === 0 ? "No sign-ups yet" : "People interested"}
              </span>
            </Link>
            <div className="rounded-2xl bg-cream-50 p-4 ring-1 ring-cream-200">
              <span className="text-xs font-semibold text-ink-faint">Status</span>
              <span className="mt-2 block text-[17px] font-bold text-ink">
                {startup.visibility === "published" ? "Published" : "Draft"}
              </span>
              <span className="mt-1 block text-xs text-ink-soft">
                {startup.visibility === "published" ? "Visible with the link" : "Only visible to you"}
              </span>
            </div>
          </div>
          {publicUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-cream-200 pt-4">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 text-xs font-bold text-rapid-700 underline underline-offset-2"
              >
                View public profile
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <CopyLinkButton url={publicUrl} label="Copy public link" />
            </div>
          )}
        </Panel>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[24px] font-bold tracking-[-0.025em] text-ink">Validation requests</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Managed research is separate from your public posts. Follow each request from scoping to findings.
          </p>
        </div>
        <Link
          to="/app/founder/new"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cream-300 bg-white px-4 text-sm font-semibold text-ink hover:border-rapid-600 hover:bg-cream-50"
        >
          <Plus size={15} aria-hidden="true" />
          New request
        </Link>
      </div>

      {loading && !data && <Loading label="Loading your tests…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}

      {data && data.length > 0 && (
        <div className="rows grid gap-4 sm:grid-cols-3">
          <Stat label="Requests" value={tests.length} />
          <Stat label="In progress" value={live} hint="Recruiting, fielding or in review" />
          <Stat label="Published" value={published} hint="Findings you can read" />
        </div>
      )}

      {data && (
        <Panel>
          {data.length === 0 ? (
            <EmptyState
              icon={<Compass size={20} aria-hidden="true" />}
              title="No test requests yet"
            >
              <p>
                Tell us the question you need answered and the people you need
                to reach. The team scopes every request before recruitment
                starts.
              </p>
              <Link
                to="/app/founder/new"
                className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400"
              >
                Request a test
              </Link>
            </EmptyState>
          ) : (
            <ul className="rows divide-y divide-cream-200">
              {data.map((test, index) => (
                <li key={test.id}>
                  <Link
                    to={`/app/founder/tests/${test.id}`}
                    className="group -mx-2 grid grid-cols-[28px_1fr] gap-3 rounded-2xl px-2 py-5 transition-colors duration-300 hover:bg-cream-50 sm:grid-cols-[40px_1fr] sm:gap-4"
                  >
                    <span
                      aria-hidden="true"
                      className="pt-0.5 font-display text-sm font-bold text-ink-faint tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span className="flex flex-wrap items-start justify-between gap-3">
                        <span className="font-display text-[19px] font-bold leading-snug tracking-[-0.015em] text-ink group-hover:text-rapid-700">
                          {test.title || "Untitled test"}
                        </span>
                        <Pill tone={toneFor(test.status)}>
                          {STATUS_LABEL[test.status] ?? test.status}
                        </Pill>
                      </span>

                      <span className="mt-1.5 block max-w-[65ch] text-sm leading-relaxed text-ink-soft">
                        {test.question}
                      </span>

                      <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
                        <span>{formatDay(test.createdAt)}</span>
                        <span aria-hidden="true" className="h-3 w-px bg-cream-300" />
                        <span className="tabular-nums">
                          {test.counts.invited} invited
                        </span>
                        <span aria-hidden="true" className="h-3 w-px bg-cream-300" />
                        <span className="tabular-nums">
                          {test.counts.accepted} accepted
                        </span>
                        <span aria-hidden="true" className="h-3 w-px bg-cream-300" />
                        <span className="tabular-nums">
                          {test.counts.responses} response
                          {test.counts.responses === 1 ? "" : "s"}
                        </span>
                      </span>

                      {test.status !== "cancelled" && test.status !== "closed" && (
                        <StatusTimeline stages={TIMELINE} current={test.status} className="mt-4 max-w-[560px]" />
                      )}

                      <span
                        className={cn(
                          "mt-3 block rounded-xl px-3 py-2 text-sm font-semibold",
                          test.status === "published" && !test.decision
                            ? "bg-sun-100 text-ink"
                            : "bg-rapid-50 text-rapid-800",
                        )}
                      >
                        {nextActionFor(test.status, test.decision)}
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
