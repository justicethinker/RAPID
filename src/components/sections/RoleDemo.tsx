import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Rocket,
  CalendarDays,
  Users,
  Lightbulb,
  ArrowRight,
  MessageSquare,
  X,
  Check,
  CheckCircle2,
  Undo2,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { GradientText } from '@/components/ui/GradientText';
import { IconCircle } from '@/components/ui/IconCircle';
import { Chip } from '@/components/ui/Chip';
import { Logo } from '@/components/ui/Logo';
import { VideoTile } from '@/components/media/VideoTile';
import { ROLE_DEMO, PROBLEM_SOLUTION } from '@/content/copy';
import { cn } from '@/lib/cn';

type TesterView = 'idle' | 'try' | 'call' | 'collab';
type Decision = 'accepted' | 'passed';

export function RoleDemo() {
  const [role, setRole] = useState('tester');

  // Tester preview flow — purely local, nothing is sent or booked.
  const [testerView, setTesterView] = useState<TesterView>('idle');
  const [testerResult, setTesterResult] = useState<string | null>(null);

  // Founder inbox — accept / pass each incoming action (local demo state).
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [reportOpen, setReportOpen] = useState(false);

  const openTesterView = (view: TesterView) => {
    setTesterView(view);
    setTesterResult(null);
  };
  const resetTester = () => {
    setTesterView('idle');
    setTesterResult(null);
  };
  const decide = (title: string, decision: Decision) =>
    setDecisions((prev) => ({ ...prev, [title]: decision }));
  const undo = (title: string) =>
    setDecisions((prev) => {
      const next = { ...prev };
      delete next[title];
      return next;
    });

  const handledCount = Object.keys(decisions).length;
  const totalActions = PROBLEM_SOLUTION.actions.length;

  return (
    <section className="cv-auto relative overflow-hidden surface-dark surface-dark--bleed-top seam-hairline py-[56px] lg:py-24">
      <Container className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo size={28} />
          <span className="text-xs text-dark-muted">Interactive demo · Sample data</span>
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h2 className="t-section text-dark-text mb-4">
            <span className="block">{ROLE_DEMO.headline1}</span>
            <span className="block">
              <GradientText>{ROLE_DEMO.headline2}</GradientText>
            </span>
          </h2>
          <p className="lead mx-auto">{ROLE_DEMO.lead}</p>
        </div>

        {/* Role switch */}
        <Tabs.Root value={role} onValueChange={setRole} className="flex w-full flex-col items-center gap-8">
          <Tabs.List
            className="flex rounded-full glass-dark p-1.5 gap-1"
            aria-label="Choose role"
          >
            {[
              { value: 'tester', label: ROLE_DEMO.testerTab, hint: ROLE_DEMO.testerHint, icon: Users },
              { value: 'founder', label: ROLE_DEMO.founderTab, hint: ROLE_DEMO.founderHint, icon: Rocket },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'flex items-center gap-2.5 h-14 px-4 sm:px-6 rounded-full text-left transition-all duration-200',
                  role === tab.value
                    ? 'bg-brand-btn text-ink shadow-glow-btn'
                    : 'text-dark-text hover:text-brand-500'
                )}
              >
                <tab.icon size={20} className="shrink-0" />
                <span className="leading-tight">
                  <span className="block text-base font-bold">{tab.label}</span>
                  <span
                    className={cn(
                      'hidden sm:block text-xs font-medium',
                      role === tab.value ? 'text-ink/70' : 'text-dark-muted'
                    )}
                  >
                    {tab.hint}
                  </span>
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Content panels */}
          <div className="w-full max-w-[980px]">
            <Tabs.Content value="tester" className="outline-none">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Left card */}
                <div className="flex-1 bg-white rounded-[20px] shadow-card-light overflow-hidden max-w-[440px] w-full">
                  <VideoTile duration="0:58" image="/images/role-demo.webp" className="w-full" aspectRatio="16/10" showPlayButton={false} />
                  <div className="p-5">
                    <h3 className="text-[22px] font-extrabold text-ink mb-1">{ROLE_DEMO.testerIdeaTitle}</h3>
                    <p className="text-sm text-light-muted mb-3">{ROLE_DEMO.testerIdeaSub}</p>
                    <div className="flex items-start gap-2 bg-sand-50 rounded-lg px-3 py-2.5 mb-4">
                      <Lightbulb size={14} className="text-brand-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-brand-700">
                        <strong>Why this fits</strong> {ROLE_DEMO.whyThisFits}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        showArrow
                        className={cn('whitespace-nowrap', testerView === 'try' && !testerResult && 'ring-2 ring-brand-500 ring-offset-2')}
                        aria-pressed={testerView === 'try'}
                        onClick={() => openTesterView('try')}
                      >
                        <Rocket size={16} /> {ROLE_DEMO.tryItCta}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn('whitespace-nowrap', testerView === 'call' && !testerResult && 'ring-2 ring-brand-500/70')}
                        aria-pressed={testerView === 'call'}
                        onClick={() => openTesterView('call')}
                      >
                        <CalendarDays size={14} /> {ROLE_DEMO.bookCallCta}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn('whitespace-nowrap', testerView === 'collab' && !testerResult && 'ring-2 ring-brand-500/70')}
                        aria-pressed={testerView === 'collab'}
                        onClick={() => openTesterView('collab')}
                      >
                        <Users size={14} /> {ROLE_DEMO.collaborateCta}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center">
                  <ArrowRight size={36} className="text-brand-500" style={{ filter: 'drop-shadow(0 0 8px #15E6A0)' }} />
                </div>

                {/* Right panel — responds to the buttons on the left */}
                <div className="flex-1 bg-white rounded-[20px] shadow-card-light p-6 max-w-[440px] w-full relative lg:min-h-[372px]">
                  {testerView !== 'idle' && !testerResult && (
                    <button
                      type="button"
                      onClick={resetTester}
                      className="absolute top-4 right-4 text-light-muted hover:text-ink"
                      aria-label="Close preview"
                    >
                      <X size={18} />
                    </button>
                  )}

                  {testerResult ? (
                    /* Success state — after previewing any of the three actions */
                    <div role="status" className="flex flex-col items-start gap-4 pt-2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                        <CheckCircle2 size={26} className="text-brand-600" />
                      </span>
                      <p className="text-[17px] font-bold text-ink">{testerResult}</p>
                      <Button variant="ghost" size="sm" onClick={resetTester}>
                        {ROLE_DEMO.tryAnotherCta}
                      </Button>
                    </div>
                  ) : testerView === 'idle' ? (
                    /* Empty state — tells you what to do */
                    <div className="flex h-full flex-col items-start justify-center gap-3 lg:min-h-[324px]">
                      <IconCircle size={48} variant="mint">
                        <ArrowRight size={22} className="text-brand-700" />
                      </IconCircle>
                      <h3 className="text-xl font-bold text-ink">{ROLE_DEMO.testerIdleTitle}</h3>
                      <p className="text-sm text-light-muted">{ROLE_DEMO.testerIdleText}</p>
                    </div>
                  ) : testerView === 'try' ? (
                    <div>
                      <IconCircle size={56} variant="mint" className="mb-4">
                        <Rocket size={28} className="text-brand-700" />
                      </IconCircle>
                      <h3 className="text-xl font-bold text-ink mb-2">{ROLE_DEMO.tryTitle}</h3>
                      <p className="text-sm text-light-muted mb-4">{ROLE_DEMO.tryDescription}</p>
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-ink leading-relaxed border border-gray-100">
                        Hi! I'm a student near campus and I'd love early access to this. I usually grab lunch between 11–1pm. Please keep me updated!
                      </div>
                      <div className="flex gap-3 mb-3">
                        <Button variant="primary" size="sm" showArrow onClick={() => setTesterResult(ROLE_DEMO.trySuccess)}>
                          {ROLE_DEMO.previewRequestCta}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetTester}>
                          {ROLE_DEMO.closeCta}
                        </Button>
                      </div>
                      <p className="text-[13px] text-light-muted">{ROLE_DEMO.tryFootnote}</p>
                    </div>
                  ) : testerView === 'call' ? (
                    <div>
                      <IconCircle size={56} variant="mint" className="mb-4">
                        <CalendarDays size={28} className="text-brand-700" />
                      </IconCircle>
                      <h3 className="text-xl font-bold text-ink mb-2">{ROLE_DEMO.callTitle}</h3>
                      <p className="text-sm text-light-muted mb-4">{ROLE_DEMO.callDescription}</p>
                      <div className="space-y-2">
                        {ROLE_DEMO.callSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTesterResult(ROLE_DEMO.callSuccess)}
                            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-ink transition-colors hover:border-brand-500 hover:bg-brand-50/60"
                          >
                            <span className="flex items-center gap-2">
                              <CalendarDays size={15} className="text-brand-600" />
                              {slot}
                            </span>
                            <ArrowRight size={15} className="text-light-muted" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* collab */
                    <div>
                      <IconCircle size={56} variant="mint" className="mb-4">
                        <Users size={28} className="text-brand-700" />
                      </IconCircle>
                      <h3 className="text-xl font-bold text-ink mb-2">{ROLE_DEMO.collabTitle}</h3>
                      <p className="text-sm text-light-muted mb-4">{ROLE_DEMO.collabDescription}</p>
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-ink leading-relaxed border border-gray-100">
                        {ROLE_DEMO.collabNote}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="primary" size="sm" showArrow onClick={() => setTesterResult(ROLE_DEMO.collabSuccess)}>
                          {ROLE_DEMO.collabPreviewCta}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetTester}>
                          {ROLE_DEMO.closeCta}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="founder" className="outline-none">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Left card — incoming actions you can accept or pass on */}
                <div className="flex-1 bg-white rounded-[20px] shadow-card-light p-5 max-w-[440px] w-full">
                  <h3 className="text-[22px] font-extrabold text-ink mb-2">{ROLE_DEMO.founderIdeaTitle}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ROLE_DEMO.founderIdeaChips.map((chip) => (
                      <Chip key={chip}>{chip}</Chip>
                    ))}
                  </div>
                  <p className="text-sm text-light-muted mb-3">{ROLE_DEMO.founderStats}</p>

                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-light-muted uppercase tracking-wide">
                      {ROLE_DEMO.founderInboxLabel}
                    </p>
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                      {handledCount}/{totalActions}
                    </span>
                  </div>

                  {/* Action rows */}
                  <div className="space-y-0">
                    {PROBLEM_SOLUTION.actions.map((action, i) => {
                      const icons = [CheckCircle2, CalendarDays, MessageSquare];
                      const Icon = icons[i]!;
                      const decision = decisions[action.title];
                      return (
                        <div
                          key={action.title}
                          className={cn(
                            'flex items-center gap-3 py-3 transition-opacity',
                            i < PROBLEM_SOLUTION.actions.length - 1 && 'border-b border-[#EEF2F5]',
                            decision === 'passed' && 'opacity-60'
                          )}
                        >
                          <IconCircle size={42} variant="mint">
                            <Icon size={18} />
                          </IconCircle>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-sm font-bold text-ink',
                                decision === 'passed' && 'line-through decoration-light-muted/70'
                              )}
                            >
                              {action.title}
                            </p>
                            <p className="text-xs text-light-muted">{action.sub}</p>
                          </div>

                          {decision ? (
                            <div className="flex shrink-0 items-center gap-2">
                              <span
                                className={cn(
                                  'rounded-full px-2.5 py-1 text-xs font-bold',
                                  decision === 'accepted'
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'bg-gray-100 text-gray-600'
                                )}
                              >
                                {decision === 'accepted' ? ROLE_DEMO.founderAccepted : ROLE_DEMO.founderPassed}
                              </span>
                              <button
                                type="button"
                                onClick={() => undo(action.title)}
                                aria-label={`Undo decision for ${action.title}`}
                                title={ROLE_DEMO.founderUndoCta}
                                className="rounded p-1.5 text-light-muted transition-colors hover:bg-gray-100 hover:text-ink"
                              >
                                <Undo2 size={15} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => decide(action.title, 'accepted')}
                                aria-label={`Accept: ${action.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-ink shadow-accent transition-colors hover:bg-brand-600"
                              >
                                <Check size={18} strokeWidth={3} />
                              </button>
                              <button
                                type="button"
                                onClick={() => decide(action.title, 'passed')}
                                aria-label={`Pass on: ${action.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 text-light-muted transition-colors hover:border-gray-300 hover:text-ink"
                              >
                                <X size={17} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {handledCount === totalActions && (
                    <p role="status" className="pt-2 text-sm font-bold text-brand-700">
                      {ROLE_DEMO.founderAllHandled}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center">
                  <ArrowRight size={36} className="text-brand-500" style={{ filter: 'drop-shadow(0 0 8px #15E6A0)' }} />
                </div>

                {/* Right panel — sample report expands in place */}
                <div className="flex-1 bg-white rounded-[20px] shadow-card-light p-6 max-w-[440px] w-full lg:min-h-[372px]">
                  <p className="text-xs font-semibold text-light-muted uppercase tracking-wide mb-2">
                    {ROLE_DEMO.founderReportLabel}
                  </p>
                  <div className="bg-sand-50 rounded-xl p-4 mb-4 border border-sand-200">
                    <p className="text-lg font-bold text-ink">Students liked choosing a pickup time. Meal choice needs another test.</p>
                  </div>

                  {reportOpen && (
                    <div className="space-y-2 mb-4">
                      {ROLE_DEMO.founderReportDetails.map((detail) => (
                        <div key={detail.title} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-light-muted">
                            {detail.title}
                          </p>
                          <p className="text-sm leading-snug text-ink">{detail.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="md"
                    showArrow={!reportOpen}
                    className="w-full"
                    aria-expanded={reportOpen}
                    onClick={() => setReportOpen((open) => !open)}
                  >
                    {reportOpen ? ROLE_DEMO.closeCta : ROLE_DEMO.openReportCta}
                  </Button>
                </div>
              </div>
            </Tabs.Content>
          </div>
        </Tabs.Root>

        {/* Footer note */}
        <div className="flex items-center justify-center mt-12">
          <div className="h-[1px] w-16 bg-navy-line mr-4" />
          <p className="text-sm text-dark-muted">{ROLE_DEMO.footerNote}</p>
          <div className="h-[1px] w-16 bg-navy-line ml-4" />
        </div>
      </Container>
    </section>
  );
}
