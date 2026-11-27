import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Inbox, Plus, Trash2, Users } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApi, useApiClient } from "@/hooks/useApi";
import { ApiError } from "@/lib/api";
import { FOUNDER_AUDIENCES, INTERESTS, SITUATIONS } from "@/content/pilot";
import type { StaffTestDetail as TestDetail } from "@/lib/dashboard-types";
import { labelOutcome } from "@/lib/labels";
import {
  BackLink,
  EmptyState,
  ErrorPanel,
  FieldLabel,
  Loading,
  PageHeading,
  Panel,
  Pill,
  Quote,
  Stat,
  inputClass,
} from "@/pages/app/Ui";

interface Candidate {
  id: string;
  name: string;
  email: string;
  city: string | null;
  country: string | null;
  situation: string | null;
  interests: string[];
  ageBand?: string | null;
  industry?: string | null;
  matchReasons?: string[];
}

interface StudyDefinition {
  steps: Array<{ id: string; position: number; stepType: string; prompt: string; options: string[]; required: boolean }>;
  rules: Array<{ id: string; ruleType: string; operator: string; value: Record<string, unknown> }>;
  screeners: Array<{ id: string; position: number; question: string; options: string[]; required: boolean }>;
}

interface Learning {
  label: string;
  detail: string;
}

export default function StaffTestDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refresh } = useApi<TestDetail>(
    id ? `/api/staff/tests/${id}` : null,
  );

  usePageMeta({ title: "Test workspace | RAPID staff", noindex: true });
  if (loading && !data) return <Loading label="Loading the test workspace…" />;
  if (error)
    return <ErrorPanel message={error} onRetry={() => void refresh()} />;
  if (!data || !id) return null;
  return <StaffTestEditor key={id} id={id} data={data} refresh={refresh} />;
}

function StaffTestEditor({ id, data, refresh }: { id: string; data: TestDetail; refresh: () => Promise<void> }) {
  const request = useApiClient();
  const [title, setTitle] = useState(data.title);
  const [question, setQuestion] = useState(data.question);
  const [terms, setTerms] = useState(data.terms);
  const [rewardNote, setRewardNote] = useState(data.rewardNote ?? "");
  const [audienceCode, setAudienceCode] = useState(data.audienceCode ?? "");
  const [audienceDescription, setAudienceDescription] = useState(data.audienceDescription ?? "");
  const [method, setMethod] = useState(data.method ?? "");
  const [sampleTarget, setSampleTarget] = useState(data.sampleTarget?.toString() ?? "");
  const [reportDueAt, setReportDueAt] = useState(data.reportDueAt ? data.reportDueAt.slice(0, 10) : "");
  const [status, setStatus] = useState(data.status);
  const [serviceKey, setServiceKey] = useState(data.serviceKey);
  const [projectStatus, setProjectStatus] = useState(data.projectStatus);
  const [paymentStatus, setPaymentStatus] = useState(data.paymentStatus);
  const [priceAmount, setPriceAmount] = useState(data.priceAmount?.toString() ?? "");
  const [priceCurrency, setPriceCurrency] = useState(data.priceCurrency ?? "NGN");
  const [rewardAmount, setRewardAmount] = useState(data.rewardAmount?.toString() ?? "");
  const [taskUrl, setTaskUrl] = useState(data.taskUrl ?? "");
  const [taskRequiresReturn, setTaskRequiresReturn] = useState(data.taskRequiresReturn);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [candidateQuery, setCandidateQuery] = useState("");
  const [candidateCountry, setCandidateCountry] = useState("");
  const [candidateSituation, setCandidateSituation] = useState("");
  const [candidateInterest, setCandidateInterest] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    country: "",
    situation: "",
    interest: "",
  });

  const candidateParams = new URLSearchParams();
  if (appliedFilters.q) candidateParams.set("q", appliedFilters.q);
  if (appliedFilters.country)
    candidateParams.set("country", appliedFilters.country);
  if (appliedFilters.situation)
    candidateParams.set("situation", appliedFilters.situation);
  if (appliedFilters.interest)
    candidateParams.set("interest", appliedFilters.interest);
  const study = useApi<StudyDefinition>(id ? `/api/staff/tests/${id}/study` : null);
  const templates = useApi<Array<{ service_key: string; name: string; description: string }>>(id ? `/api/staff/templates` : null);
  const [templateKey, setTemplateKey] = useState("idea_validation");
  const [stepType, setStepType] = useState("single_choice");
  const [stepPrompt, setStepPrompt] = useState("");
  const [stepOptions, setStepOptions] = useState("");
  const [ruleType, setRuleType] = useState("country");
  const [ruleValues, setRuleValues] = useState("");
  const [screenerQuestion, setScreenerQuestion] = useState("");
  const [screenerOptions, setScreenerOptions] = useState("");

  const candidates = useApi<Candidate[]>(
    id
      ? `/api/staff/tests/${id}/candidates${
          candidateParams.size ? `?${candidateParams}` : ""
        }`
      : null,
  );

  const [headline, setHeadline] = useState(data.findings?.headline ?? "");
  const [summary, setSummary] = useState(data.findings?.summary ?? "");
  const [limits, setLimits] = useState(data.findings?.limits ?? "");
  const [recommendation, setRecommendation] = useState(data.findings?.recommendation ?? "");
  const [learnings, setLearnings] = useState<Learning[]>(data.findings?.learnings.length ? data.findings.learnings : [{ label: "", detail: "" }]);


  const saveTest = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setActionError(null);
    setSaved(null);
    try {
      await request(`/api/staff/tests/${id}`, {
        method: "PATCH",
        body: {
          title,
          question,
          terms,
          rewardNote,
          audienceCode,
          audienceDescription,
          method,
          sampleTarget: sampleTarget || null,
          reportDueAt: reportDueAt || null,
          status,
          serviceKey,
          projectStatus,
          paymentStatus,
          priceAmount: priceAmount || null,
          priceCurrency,
          rewardAmount: rewardAmount || null,
          taskUrl: taskUrl || null,
          taskRequiresReturn,
        },
      });
      await refresh();
      setSaved("Test details saved.");
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? (Object.values(cause.fields ?? {})[0] ?? "Could not save the test.")
          : "Could not save the test.",
      );
    } finally {
      setSaving(false);
    }
  };

  const invite = async () => {
    if (!selected.length) return;
    setSaving(true);
    setActionError(null);
    setSaved(null);
    try {
      await request(`/api/staff/tests/${id}/invitations`, {
        method: "POST",
        body: { testerIds: selected },
      });
      setSelected([]);
      setStatus("recruiting");
      await Promise.all([refresh(), candidates.refresh()]);
      setSaved("Invitations sent.");
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? (Object.values(cause.fields ?? {})[0] ??
              "Could not send invitations.")
          : "Could not send invitations.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveFindings = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setActionError(null);
    setSaved(null);
    try {
      await request(`/api/staff/tests/${id}/findings`, {
        method: "PUT",
        body: { headline, summary, limits, recommendation, learnings },
      });
      setStatus((current) => (current === "published" ? current : "findings"));
      await refresh();
      setSaved("Report saved as a draft.");
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? (Object.values(cause.fields ?? {})[0] ?? "Could not save findings.")
          : "Could not save findings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    setActionError(null);
    setSaved(null);
    try {
      await request(`/api/staff/tests/${id}/findings/publish`, {
        method: "POST",
      });
      setStatus("published");
      await refresh();
      setSaved("Findings published to the founder.");
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? (Object.values(cause.fields ?? {})[0] ??
              "Could not publish findings.")
          : "Could not publish findings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const markReward = async (invitationId: string) => {
    setSaving(true);
    setActionError(null);
    try {
      await request(`/api/staff/invitations/${invitationId}/reward`, {
        method: "POST",
      });
      await refresh();
      setSaved("Reward marked as sent.");
    } catch {
      setActionError("Could not mark the reward.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackLink to="/staff/tests">All tests</BackLink>

      <PageHeading
        eyebrow="Staff test workspace"
        title={data.title || "Untitled test"}
        description={`${data.founder.name || data.founder.email} · ${data.founder.email}`}
      >
        <Pill tone={data.status === "published" ? "positive" : "neutral"}>
          {data.status}
        </Pill>
      </PageHeading>

      {actionError && <ErrorPanel message={actionError} />}
      {saved && (
        <p className="rounded-xl border border-rapid-100 bg-rapid-50 p-4 text-sm font-semibold text-rapid-700">
          {saved}
        </p>
      )}

      <div className="rows grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Invited" value={data.counts.invited} />
        <Stat
          label="Accepted"
          value={data.counts.accepted}
          hint="Includes completed"
        />
        <Stat label="Completed" value={data.counts.completed} />
        <Stat
          label="Responses"
          value={data.counts.responses}
          hint="Written answers to review"
        />
      </div>

      <Panel
        title="Scope"
        description="What the founder asked for, and what testers will be told."
      >
        <form onSubmit={saveTest} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
            <div>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <input
                id="title"
                className={inputClass}
                value={title}
                maxLength={120}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <select
                id="status"
                className={inputClass}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {[
                  "requested",
                  "scoping",
                  "recruiting",
                  "fielding",
                  "findings",
                  ...(data.status === "published" ? ["published"] : []),
                  "closed",
                  "cancelled",
                ].map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                Publishing is a separate step in the findings panel.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div><FieldLabel htmlFor="service-key">Service</FieldLabel><select id="service-key" className={inputClass} value={serviceKey} onChange={(event) => setServiceKey(event.target.value)}><option value="idea_validation">Idea Validation</option><option value="product_testing">Product Testing</option><option value="customer_research">Customer Research</option></select></div>
            <div><FieldLabel htmlFor="project-status">Project status</FieldLabel><select id="project-status" className={inputClass} value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}>{["draft","under_review","awaiting_payment","recruiting","running","reviewing","completed","cancelled","on_hold"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></div>
            <div><FieldLabel htmlFor="payment-status">Payment status</FieldLabel><select id="payment-status" className={inputClass} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>{["not_required","awaiting_payment","processing","paid","failed","refunded","waived"].map((value) => <option key={value} value={value} disabled={value === "paid" && data.paymentStatus !== "paid"}>{value.replaceAll("_", " ")}</option>)}</select></div>
            <div><FieldLabel htmlFor="price-amount">Price (kobo)</FieldLabel><input id="price-amount" type="number" min={0} className={inputClass} value={priceAmount} onChange={(event) => setPriceAmount(event.target.value)} /></div>
            <div><FieldLabel htmlFor="price-currency">Currency</FieldLabel><input id="price-currency" className={inputClass} value={priceCurrency} maxLength={3} onChange={(event) => setPriceCurrency(event.target.value.toUpperCase())} /></div>
            <div><FieldLabel htmlFor="reward-amount">Reward (kobo)</FieldLabel><input id="reward-amount" type="number" min={0} className={inputClass} value={rewardAmount} onChange={(event) => setRewardAmount(event.target.value)} /></div>
            <div className="sm:col-span-3"><FieldLabel htmlFor="task-url">External task URL</FieldLabel><input id="task-url" className={inputClass} value={taskUrl} placeholder="https://…" onChange={(event) => setTaskUrl(event.target.value)} /></div>
            <label className="flex items-center gap-3 text-sm text-ink-soft sm:col-span-3"><input type="checkbox" checked={taskRequiresReturn} onChange={(event) => setTaskRequiresReturn(event.target.checked)} className="h-4 w-4" /> Tester must return to Rapid after the task</label>
          </div>

          <div>
            <FieldLabel
              htmlFor="question"
              hint="Visible to the founder and matched testers."
            >
              Question
            </FieldLabel>
            <textarea
              id="question"
              className={`${inputClass} min-h-[110px]`}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <FieldLabel
                htmlFor="audience-code"
                hint="The closest pilot segment."
              >
                Audience segment
              </FieldLabel>
              <select
                id="audience-code"
                className={inputClass}
                value={audienceCode}
                onChange={(event) => setAudienceCode(event.target.value)}
              >
                <option value="">Not selected</option>
                {FOUNDER_AUDIENCES.map((audience) => (
                  <option key={audience.code} value={audience.code}>
                    {audience.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="audience-description">Audience detail</FieldLabel>
              <input
                id="audience-description"
                className={inputClass}
                value={audienceDescription}
                onChange={(event) => setAudienceDescription(event.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="reward">Reward</FieldLabel>
              <input
                id="reward"
                className={inputClass}
                value={rewardNote}
                onChange={(event) => setRewardNote(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_180px_180px]">
            <div>
              <FieldLabel
                htmlFor="method"
                hint="How testers will complete the task."
              >
                Method
              </FieldLabel>
              <textarea
                id="method"
                className={`${inputClass} min-h-[110px]`}
                value={method}
                maxLength={500}
                onChange={(event) => setMethod(event.target.value)}
                placeholder="e.g. Prototype walkthrough followed by a written response"
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="sample-target"
                hint="Usable completions."
              >
                Target completions
              </FieldLabel>
              <input
                id="sample-target"
                type="number"
                min={1}
                max={1000}
                className={inputClass}
                value={sampleTarget}
                onChange={(event) => setSampleTarget(event.target.value)}
                placeholder="e.g. 8"
              />
            </div>
            <div>
              <FieldLabel htmlFor="report-due" hint="Agreed report date.">
                Report due
              </FieldLabel>
              <input
                id="report-due"
                type="date"
                className={inputClass}
                value={reportDueAt}
                onChange={(event) => setReportDueAt(event.target.value)}
              />
            </div>
          </div>

          <div>
            <FieldLabel
              htmlFor="terms"
              hint="Testers accept these terms with the invitation."
            >
              Terms
            </FieldLabel>
            <textarea
              id="terms"
              className={`${inputClass} min-h-[110px]`}
              value={terms}
              onChange={(event) => setTerms(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400 disabled:opacity-60"
          >
            Save scope
          </button>
        </form>
      </Panel>

      <Panel title="Study builder" description="Copy a service template, then edit steps, screeners and eligibility. AI drafts stay editable until you save.">
        <div className="flex flex-wrap items-end gap-3 border-b border-cream-200 pb-5">
          <div className="min-w-[220px] flex-1"><FieldLabel htmlFor="template-key">Template</FieldLabel><select id="template-key" className={inputClass} value={templateKey} onChange={(event) => setTemplateKey(event.target.value)}>{(templates.data ?? []).map((template) => <option key={template.service_key} value={template.service_key}>{template.name}</option>)}</select></div>
          <button type="button" disabled={saving} onClick={async () => { setSaving(true); try { await request(`/api/staff/tests/${id}/copy-template`, { method: 'POST', body: { serviceKey: templateKey } }); await study.refresh(); setSaved('Template copied.'); } catch { setActionError('Could not copy the template.'); } finally { setSaving(false); } }} className="min-h-[44px] rounded-full bg-sun-500 px-4 text-sm font-bold text-ink hover:bg-sun-400 disabled:opacity-60">Copy template</button>
          <button type="button" disabled={saving} onClick={async () => { setSaving(true); try { await request(`/api/staff/tests/${id}/ai-draft`, { method: 'POST', body: {} }); await study.refresh(); setSaved('AI draft added. Review it before publishing.'); } catch { setActionError('Could not draft the study.'); } finally { setSaving(false); } }} className="min-h-[44px] rounded-xl border border-cream-300 px-4 text-sm font-bold disabled:opacity-60">AI draft</button>
        </div>
        <div className="grid gap-6 py-5 lg:grid-cols-3">
          <div className="space-y-4"><h3 className="font-display text-sm font-bold text-ink">Steps</h3>{(study.data?.steps ?? []).map((step) => <div key={step.id} className="rounded-xl border border-cream-200 p-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">{step.position + 1} · {step.stepType.replaceAll('_', ' ')}</p><p className="mt-1 text-sm text-ink">{step.prompt}</p><button type="button" onClick={async () => { await request(`/api/staff/tests/${id}/steps/${step.id}`, { method: 'DELETE' }); await study.refresh(); }} className="mt-2 text-xs font-bold text-danger">Delete</button></div>)}</div>
          <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); setSaving(true); try { await request(`/api/staff/tests/${id}/steps`, { method: 'POST', body: { position: study.data?.steps.length ?? 0, stepType, prompt: stepPrompt, options: stepOptions.split(',').map((item) => item.trim()).filter(Boolean), required: true } }); setStepPrompt(''); setStepOptions(''); await study.refresh(); } catch { setActionError('Could not save the step.'); } finally { setSaving(false); } }}>
            <h3 className="font-display text-sm font-bold text-ink">Add step</h3>
            <select className={inputClass} value={stepType} onChange={(event) => setStepType(event.target.value)}><option value="single_choice">Single choice</option><option value="multiple_choice">Multiple choice</option><option value="scale">Scale</option><option value="short_answer">Short answer</option><option value="image_prompt">Image prompt</option><option value="link_task">Link / task</option></select>
            <textarea className={`${inputClass} min-h-[70px]`} value={stepPrompt} onChange={(event) => setStepPrompt(event.target.value)} placeholder="Prompt" required />
            <input className={inputClass} value={stepOptions} onChange={(event) => setStepOptions(event.target.value)} placeholder="Options, comma separated" />
            <button className="min-h-[40px] rounded-full bg-sun-500 px-4 text-sm font-bold text-ink disabled:opacity-60">Add step</button>
          </form>
          <div className="space-y-4"><h3 className="font-display text-sm font-bold text-ink">Eligibility</h3>{(study.data?.rules ?? []).map((rule) => <div key={rule.id} className="rounded-xl border border-cream-200 p-3"><p className="text-sm text-ink">{rule.ruleType.replaceAll('_', ' ')} · {JSON.stringify(rule.value)}</p><button type="button" onClick={async () => { await request(`/api/staff/tests/${id}/rules/${rule.id}`, { method: 'DELETE' }); await study.refresh(); }} className="mt-1 text-xs font-bold text-danger">Delete</button></div>)}</div>
          <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); setSaving(true); try { await request(`/api/staff/tests/${id}/rules`, { method: 'POST', body: { ruleType, operator: 'in', value: { values: ruleValues.split(',').map((item) => item.trim()).filter(Boolean) } } }); setRuleValues(''); await study.refresh(); } catch { setActionError('Could not save the rule.'); } finally { setSaving(false); } }}>
            <select className={inputClass} value={ruleType} onChange={(event) => setRuleType(event.target.value)}><option value="country">Country</option><option value="age_band">Age band</option><option value="situation">Situation</option><option value="interest">Interest</option><option value="industry">Industry</option></select>
            <input className={inputClass} value={ruleValues} onChange={(event) => setRuleValues(event.target.value)} placeholder="Values, comma separated" required />
            <button className="min-h-[40px] rounded-full bg-sun-500 px-4 text-sm font-bold text-ink disabled:opacity-60">Add rule</button>
          </form>
          <div className="space-y-4"><h3 className="font-display text-sm font-bold text-ink">Screeners</h3>{(study.data?.screeners ?? []).map((screener) => <div key={screener.id} className="rounded-xl border border-cream-200 p-3"><p className="text-sm text-ink">{screener.question}</p><button type="button" onClick={async () => { await request(`/api/staff/tests/${id}/screeners/${screener.id}`, { method: 'DELETE' }); await study.refresh(); }} className="mt-1 text-xs font-bold text-danger">Delete</button></div>)}</div>
          <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); setSaving(true); try { await request(`/api/staff/tests/${id}/screeners`, { method: 'POST', body: { position: study.data?.screeners.length ?? 0, question: screenerQuestion, options: screenerOptions.split(',').map((item) => item.trim()).filter(Boolean), required: true } }); setScreenerQuestion(''); setScreenerOptions(''); await study.refresh(); } catch { setActionError('Could not save the screener.'); } finally { setSaving(false); } }}>
            <textarea className={`${inputClass} min-h-[70px]`} value={screenerQuestion} onChange={(event) => setScreenerQuestion(event.target.value)} placeholder="Screener question" required />
            <input className={inputClass} value={screenerOptions} onChange={(event) => setScreenerOptions(event.target.value)} placeholder="Options, comma separated" required />
            <button className="min-h-[40px] rounded-full bg-sun-500 px-4 text-sm font-bold text-ink disabled:opacity-60">Add screener</button>
          </form>
        </div>
      </Panel>

      <Panel
        title="Candidates"
        description={data.priceAmount && data.paymentStatus !== 'paid'
          ? 'Verify payment before inviting testers.'
          : 'Approved testers who have not been invited to this test.'}
        action={
          <button
            type="button"
            onClick={() => void invite()}
            disabled={!selected.length || saving || Boolean(data.priceAmount && data.paymentStatus !== 'paid')}
            className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-4 text-sm font-semibold text-ink hover:bg-sun-400 disabled:opacity-60"
          >
            Invite selected ({selected.length})
          </button>
        }
      >
        <form
          className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedFilters({
              q: candidateQuery.trim(),
              country: candidateCountry.trim(),
              situation: candidateSituation,
              interest: candidateInterest,
            });
          }}
        >
          <input
            aria-label="Search candidates"
            className={inputClass}
            placeholder="Name or email"
            value={candidateQuery}
            onChange={(event) => setCandidateQuery(event.target.value)}
          />
          <input
            aria-label="Country code"
            className={inputClass}
            placeholder="Country code"
            value={candidateCountry}
            onChange={(event) =>
              setCandidateCountry(event.target.value.toUpperCase())
            }
          />
          <select
            aria-label="Situation"
            className={inputClass}
            value={candidateSituation}
            onChange={(event) => setCandidateSituation(event.target.value)}
          >
            <option value="">Any situation</option>
            {SITUATIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Interest"
            className={inputClass}
            value={candidateInterest}
            onChange={(event) => setCandidateInterest(event.target.value)}
          >
            <option value="">Any interest</option>
            {INTERESTS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-cream-300 bg-white px-4 text-sm font-semibold text-ink hover:border-rapid-600"
          >
            Filter
          </button>
        </form>

        {candidates.loading && !candidates.data && (
          <Loading label="Loading candidates…" />
        )}
        {candidates.error && (
          <ErrorPanel
            message={candidates.error}
            onRetry={() => void candidates.refresh()}
          />
        )}
        {candidates.data && candidates.data.length === 0 && (
          <EmptyState
            icon={<Users size={20} aria-hidden="true" />}
            title="No testers to invite here"
          >
            <p>
              No approved testers match these filters, or everyone matching has
              already been invited to this test.
            </p>
          </EmptyState>
        )}
        {candidates.data && candidates.data.length > 0 && (
          <ul className="rows divide-y divide-cream-200">
            {candidates.data.map((candidate) => (
              <li key={candidate.id} className="flex items-start gap-3 py-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${candidate.name || candidate.email}`}
                  checked={selected.includes(candidate.id)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, candidate.id]
                        : current.filter((value) => value !== candidate.id),
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-cream-300 text-rapid-700 focus:ring-rapid-500"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {candidate.name || candidate.email}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {candidate.email} · {candidate.city ?? "—"}
                    {candidate.country ? `, ${candidate.country}` : ""} ·{" "}
                    {candidate.situation?.replaceAll("_", " ") ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {candidate.interests
                      .map((interest) => interest.replaceAll("_", " "))
                      .join(", ")}
                  </p>
                  {candidate.matchReasons?.length ? <p className="mt-1 text-xs text-rapid-700">Matched by: {candidate.matchReasons.map((reason) => reason.replaceAll("_", " ")).join(", ")}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Invitations and responses"
        description="What each invited tester did, in their own words."
      >
        {data.invitations.length === 0 ? (
          <EmptyState
            icon={<Inbox size={20} aria-hidden="true" />}
            title="No testers invited yet"
          >
            <p>
              Pick matched testers above and send the invitation. Their answer
              appears here as soon as it is submitted.
            </p>
          </EmptyState>
        ) : (
          <ul className="rows divide-y divide-cream-200">
            {data.invitations.map((invitation) => (
              <li key={invitation.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {invitation.tester.name || invitation.tester.email}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {invitation.tester.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill
                      tone={
                        invitation.status === "completed"
                          ? "positive"
                          : invitation.status === "declined"
                            ? "negative"
                            : "warning"
                      }
                    >
                      {invitation.status}
                    </Pill>
                    {(invitation.status === "accepted" || invitation.status === "completed") && data.taskUrl && <button type="button" disabled={saving} onClick={async () => { setSaving(true); try { await request(`/api/staff/invitations/${invitation.id}/task-action/verify`, { method: 'POST', body: { evidence: 'Verified by staff' } }); setSaved('Task action marked verified.'); } catch { setActionError('Could not verify the task action.'); } finally { setSaving(false); } }} className="inline-flex min-h-[36px] items-center rounded-full border border-cream-300 px-3 text-xs font-semibold text-ink hover:border-rapid-600 disabled:opacity-60">Verify action</button>}
                    {invitation.status === "completed" &&
                      invitation.rewardStatus === "pending" && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void markReward(invitation.id)}
                          className="inline-flex min-h-[36px] items-center rounded-full border border-cream-300 px-3 text-xs font-semibold text-ink hover:border-rapid-600"
                        >
                          Mark reward sent
                        </button>
                      )}
                  </div>
                </div>
                {invitation.response && (
                  <div className="mt-4">
                    <Quote
                      label={`${labelOutcome(invitation.response.outcome)} · ${
                        invitation.response.consentToQuote
                          ? "may be quoted anonymously"
                          : "no quote consent"
                      }`}
                    >
                      <span className="whitespace-pre-line">
                        {invitation.response.note}
                      </span>
                    </Quote>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Findings"
        description="Draft, save, then publish. Publishing notifies the founder and opens their decision control."
        action={
          <button
            type="button"
            onClick={() => void publish()}
            disabled={saving || !data.findings}
            className="inline-flex min-h-[44px] items-center rounded-full border border-cream-300 bg-white px-4 text-sm font-semibold text-ink hover:border-rapid-600 disabled:opacity-60"
          >
            {data.findings?.publishedAt ? "Republish" : "Publish findings"}
          </button>
        }
      >
        <form onSubmit={saveFindings} className="space-y-5">
          <div>
            <FieldLabel htmlFor="headline">Headline</FieldLabel>
            <input
              id="headline"
              className={inputClass}
              value={headline}
              maxLength={160}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="summary"
              hint="What the evidence shows, in plain language."
            >
              Summary
            </FieldLabel>
            <textarea
              id="summary"
              className={`${inputClass} min-h-[120px]`}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="limits"
              hint="What this test cannot tell the founder."
            >
              Limits
            </FieldLabel>
            <textarea
              id="limits"
              className={`${inputClass} min-h-[80px]`}
              value={limits}
              onChange={(event) => setLimits(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              htmlFor="recommendation"
              hint="Optional. What the evidence suggests the founder should do next."
            >
              Suggested next step
            </FieldLabel>
            <textarea
              id="recommendation"
              className={`${inputClass} min-h-[80px]`}
              value={recommendation}
              maxLength={1000}
              onChange={(event) => setRecommendation(event.target.value)}
              placeholder="e.g. Test the timetable import before changing the countdown."
            />
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Learnings
            </legend>
            <div className="mt-3 space-y-3">
              {learnings.map((learning, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border border-cream-200 p-3 sm:grid-cols-[200px_1fr_auto]"
                >
                  <input
                    aria-label={`Learning ${index + 1} label`}
                    className={inputClass}
                    placeholder="Label"
                    value={learning.label}
                    onChange={(event) =>
                      setLearnings((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    aria-label={`Learning ${index + 1} detail`}
                    className={inputClass}
                    placeholder="Detail"
                    value={learning.detail}
                    onChange={(event) =>
                      setLearnings((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, detail: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Remove learning ${index + 1}`}
                    onClick={() =>
                      setLearnings((current) =>
                        current.length === 1
                          ? [{ label: "", detail: "" }]
                          : current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                      )
                    }
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cream-200 text-ink-soft hover:text-danger"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setLearnings((current) => [
                  ...current,
                  { label: "", detail: "" },
                ])
              }
              className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-cream-300 px-3 text-sm font-semibold text-ink hover:border-rapid-600"
            >
              <Plus size={15} aria-hidden="true" />
              Add learning
            </button>
          </fieldset>

          <button type="button" disabled={saving} onClick={async () => { setSaving(true); try { const draft = await request<{ headline: string; summary: string; limits: string; recommendation: string; learnings: Learning[] }>(`/api/staff/tests/${id}/findings/ai-draft`); setHeadline(draft.headline); setSummary(draft.summary); setLimits(draft.limits); setRecommendation(draft.recommendation); setLearnings(draft.learnings.length ? draft.learnings : [{ label: '', detail: '' }]); setSaved('Draft filled. Review it before saving.'); } catch { setActionError('Could not draft findings.'); } finally { setSaving(false); } }} className="inline-flex min-h-[44px] items-center rounded-full border border-cream-300 px-4 text-sm font-semibold text-ink hover:border-rapid-600 disabled:opacity-60">AI draft findings</button>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 text-sm font-semibold text-ink hover:bg-sun-400 disabled:opacity-60"
            >
              Save findings
            </button>
          </div>
          {data.findings?.publishedAt && (
            <p className="text-sm font-semibold text-rapid-700">
              Published {new Date(data.findings.publishedAt).toLocaleString()}
            </p>
          )}
        </form>
      </Panel>
    </div>
  );
}
