import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X, TriangleAlert, Users, Lightbulb, MessageSquare, FlaskConical, Settings, RefreshCw, BarChart3, Hammer } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { IconCircle } from '@/components/ui/IconCircle';
import { VideoTile } from '@/components/media/VideoTile';
import { ActionPreviewDialog } from './ActionPreviewDialog';
import { DEMO_APP } from '@/content/copy';
import { FOUNDER_REPORT_STATS } from '@/content/demo-data';
import type { ActionVariantKey } from '@/content/copy';
import { cn } from '@/lib/cn';

interface DemoAppDialogProps {
  open: boolean;
  onClose: () => void;
  initialView?: 'discover' | 'report';
}

export function DemoAppDialog({ open, onClose, initialView = 'discover' }: DemoAppDialogProps) {
  const [view, setView] = useState<'discover' | 'report'>(initialView);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionVariant, setActionVariant] = useState<ActionVariantKey>('tryIt');
  const [notForMe, setNotForMe] = useState(false);
  const [nextStep, setNextStep] = useState('iterate');
  const [planTestOpen, setPlanTestOpen] = useState(false);

  const openAction = (v: ActionVariantKey) => {
    setActionVariant(v);
    setActionOpen(true);
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{ colorScheme: 'light' }}
            aria-label="Interactive demo"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#0B1E2D] px-5 py-3 shrink-0">
              <div className="flex items-center gap-4">
                <Logo size={24} className="text-dark-text" />
                <Tabs.Root value={view} onValueChange={(v) => setView(v as 'discover' | 'report')}>
                  <Tabs.List className="flex gap-4">
                    {[
                      { value: 'discover', label: 'Discover' },
                      { value: 'report', label: 'My report' },
                    ].map((tab) => (
                      <Tabs.Trigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          'text-sm font-medium pb-1 border-b-2 transition-colors',
                          view === tab.value
                            ? 'text-dark-text border-brand-500'
                            : 'text-dark-muted border-transparent hover:text-dark-text'
                        )}
                      >
                        {tab.label}
                      </Tabs.Trigger>
                    ))}
                    <span className="text-sm text-dark-muted/40 cursor-not-allowed pb-1 border-b-2 border-transparent" title="Not part of this demo">
                      Profile
                    </span>
                  </Tabs.List>
                </Tabs.Root>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-brand-500">
                  <FlaskConical size={12} /> {DEMO_APP.demoLabel}
                </span>
                <Dialog.Close asChild>
                  <button type="button" className="text-dark-muted hover:text-dark-text" aria-label="Close demo">
                    <X size={18} />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {view === 'discover' ? (
                <PitchDetail onOpenAction={openAction} onNotForMe={() => setNotForMe(true)} />
              ) : (
                <FounderReport
                  nextStep={nextStep}
                  setNextStep={setNextStep}
                  onPlanTest={() => setPlanTestOpen(true)}
                />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Not for me overlay */}
      {notForMe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/40 backdrop-blur-sm" style={{ colorScheme: 'light' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl text-center">
            <p className="text-lg font-bold text-ink mb-2">No problem.</p>
            <p className="text-sm text-light-muted mb-4">Skipping has no penalty.</p>
            <Button variant="primary" size="sm" onClick={() => { setNotForMe(false); onClose(); }}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Plan another test dialog */}
      {planTestOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/40 backdrop-blur-sm" style={{ colorScheme: 'light' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl text-center">
            <p className="text-lg font-bold text-ink mb-2">Not available in demo</p>
            <p className="text-sm text-light-muted mb-4">
              In the real product this starts a new test. Not available in the demo.
            </p>
            <Button variant="primary" size="sm" onClick={() => setPlanTestOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      <ActionPreviewDialog
        open={actionOpen}
        onClose={() => setActionOpen(false)}
        variant={actionVariant}
      />
    </>
  );
}

/* ── Pitch Detail View ────────────────────────────────────────── */

function PitchDetail({
  onOpenAction,
  onNotForMe,
}: {
  onOpenAction: (v: ActionVariantKey) => void;
  onNotForMe: () => void;
}) {
  return (
    <div className="p-6">
      {/* Demo banner */}
      <div className="flex items-center gap-1.5 text-[11px] text-brand-700 mb-4">
        <FlaskConical size={12} /> Interactive demo · Sample data
      </div>

      {/* Back link */}
      <button type="button" className="text-sm text-light-muted hover:text-ink mb-4">
        ← Back to ideas
      </button>

      {/* Title */}
      <h2 className="text-[40px] font-extrabold text-ink mb-6 leading-tight">
        {DEMO_APP.pitchTitle}
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left - Video */}
        <div className="lg:w-[45%]">
          <VideoTile
            label={DEMO_APP.pitchPreview}
            image="/images/feed-1.webp"
            className="w-full"
            aspectRatio="16/10"
          />
          <p className="text-[13px] text-light-muted mt-2">{DEMO_APP.videoNotice}</p>
        </div>

        {/* Right - Details */}
        <div className="lg:flex-1 space-y-4">
          {[
            { icon: TriangleAlert, label: DEMO_APP.problemLabel, text: DEMO_APP.problemText, color: 'bg-amber-50 text-amber-700' },
            { icon: Users, label: DEMO_APP.audienceLabel, text: DEMO_APP.audienceText, color: 'bg-blue-50 text-blue-700' },
            { icon: Lightbulb, label: DEMO_APP.ideaLabel, text: DEMO_APP.ideaText, color: 'bg-sand-50 text-brand-700' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3">
                <div className={cn('h-16 w-16 rounded-2xl flex items-center justify-center shrink-0', item.color)}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-light-muted">{item.label}</p>
                  <p className="text-[17px] font-bold text-ink mt-0.5">{item.text}</p>
                </div>
              </div>
            );
          })}

          {/* Pitch summary (only when opened from create pitch) */}
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 bg-gray-50 text-light-muted">
              <Settings size={24} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-light-muted">{DEMO_APP.summaryLabel}</p>
              <p className="text-[17px] font-bold text-ink mt-0.5">{DEMO_APP.summaryText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA bar */}
      <div className="mt-8 bg-sand-50 rounded-[20px] p-5 border border-sand-200">
        <div className="flex items-center gap-3 mb-3">
          <IconCircle size={56} variant="mint">
            <MessageSquare size={28} />
          </IconCircle>
          <div>
            <p className="text-lg font-bold text-ink">{DEMO_APP.tryQuestion}</p>
            <p className="text-sm text-light-muted">{DEMO_APP.trySub}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm" showArrow onClick={() => onOpenAction('previewTrial')}>
            {DEMO_APP.previewTrialCta}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenAction('shareFeedback')}>
            <MessageSquare size={14} /> {DEMO_APP.shareFeedbackCta}
          </Button>
          <button
            type="button"
            className="text-sm font-medium text-light-muted hover:text-ink transition-colors px-3 py-2"
            onClick={onNotForMe}
          >
            {DEMO_APP.notForMeCta}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Founder Report View ──────────────────────────────────────── */

function FounderReport({
  nextStep,
  setNextStep,
  onPlanTest: _onPlanTest,
}: {
  nextStep: string;
  setNextStep: (v: string) => void;
  onPlanTest: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="p-6">
      {/* Demo banner */}
      <div className="flex items-center gap-1.5 text-[11px] text-brand-700 mb-4">
        <FlaskConical size={12} /> Interactive demo · Sample data
      </div>

      {/* Title */}
      <h2 className="text-[40px] font-extrabold text-ink mb-2 leading-tight">{DEMO_APP.reportTitle}</h2>
      <p className="text-lg text-light-muted mb-6">{DEMO_APP.reportSub}</p>

      {/* Project label */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-light-muted uppercase tracking-wide">{DEMO_APP.reportProjectLabel}</span>
        <span className="text-sm font-bold text-ink">{DEMO_APP.pitchTitle}</span>
      </div>

      <div className="max-w-[700px] space-y-5">
        {/* Key finding */}
        <div className="bg-sand-50 rounded-2xl p-5 border border-sand-200">
          <div className="flex items-center gap-3 mb-2">
            <IconCircle size={64} variant="mint">
              <Lightbulb size={28} />
            </IconCircle>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">{DEMO_APP.keyFindingLabel}</p>
              <p className="text-[24px] font-bold text-ink leading-tight">{DEMO_APP.keyFinding}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: FOUNDER_REPORT_STATS.reached, label: DEMO_APP.statsReached, color: 'bg-[#E8F4FD]' },
            { value: FOUNDER_REPORT_STATS.fitTarget, label: DEMO_APP.statsFit, color: 'bg-sand-50' },
            { value: FOUNDER_REPORT_STATS.trialSignups, label: DEMO_APP.statsTrial, color: 'bg-[#F0EBFA]' },
          ].map((stat) => (
            <div key={stat.label} className={cn('rounded-2xl p-4 text-center', stat.color)}>
              <p className="text-3xl font-extrabold text-ink">{stat.value}</p>
              <p className="text-xs font-medium text-light-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-light-muted">{DEMO_APP.statsNote}</p>

        {/* What we learned */}
        <div className="bg-[#F3F8FB] rounded-2xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-light-muted mb-4">{DEMO_APP.whatWeLearned}</h3>
          {[
            { title: DEMO_APP.learned1Title, text: DEMO_APP.learned1Text },
            { title: DEMO_APP.learned2Title, text: DEMO_APP.learned2Text },
          ].map((item) => (
            <div key={item.title} className="mb-3 last:mb-0">
              <p className="text-sm font-bold text-ink">{item.title}</p>
              <p className="text-sm text-light-muted mt-0.5">{item.text}</p>
            </div>
          ))}
        </div>

        {/* What this does not tell us */}
        <div className="bg-warn-50 rounded-2xl p-5 border border-warn-50">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-warn-900 mb-2">{DEMO_APP.whatNotTellUs}</h3>
          <p className="text-sm font-bold text-ink">{DEMO_APP.notTellUsTitle}</p>
          <p className="text-sm text-light-muted mt-1">{DEMO_APP.notTellUsText}</p>
        </div>

        {/* Recommended next step */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-light-muted mb-3">{DEMO_APP.nextStepLabel}</h3>
          <div className="flex gap-3 mb-4">
            {[
              { key: 'build', label: 'Build', icon: Hammer },
              { key: 'iterate', label: 'Iterate', icon: RefreshCw },
              { key: 'pivot', label: 'Pivot', icon: BarChart3 },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setNextStep(opt.key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border-[1.5px] px-4 py-2 text-sm font-bold transition-all',
                    nextStep === opt.key
                      ? 'border-brand-500 bg-sand-50 text-brand-700'
                      : 'border-gray-200 text-light-muted hover:border-gray-300'
                  )}
                >
                  <Icon size={16} /> {opt.label}
                </button>
              );
            })}
          </div>
          <Button variant="primary" size="md" showArrow onClick={() => setShowConfirm(true)}>
            {DEMO_APP.planTestCta}
          </Button>
        </div>

        {/* Footnote */}
        <p className="text-[13px] text-light-muted">{DEMO_APP.reportFootnote}</p>
      </div>

      {/* Plan test confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/40 backdrop-blur-sm" style={{ colorScheme: 'light' }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl text-center">
            <p className="text-lg font-bold text-ink mb-2">Not available in demo</p>
            <p className="text-sm text-light-muted mb-4">
              In the real product this starts a new test. Not available in the demo.
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowConfirm(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
