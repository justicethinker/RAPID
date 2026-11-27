import { useEffect, useRef, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Check, ClipboardList, FileSearch, Quote, Scale, Users } from 'lucide-react';
import { SAMPLE } from '@/content/pilot';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/cn';

/**
 * The public product proof: one example test, from brief to decision.
 * Everything here is illustrative. The window chrome carries the single
 * "Example" label instead of tagging every number.
 */

const accepted = Number(SAMPLE.brief.accepted);
const stopped = 7;

/** Nine dots, seven lit: the denominator made visible. */
export function DotRatio({ lit, of, className, size = 'md' }: { lit: number; of: number; className?: string; size?: 'sm' | 'md' }) {
  return (
    <span aria-hidden="true" className={cn('flex flex-wrap gap-1.5', className)}>
      {Array.from({ length: of }, (_, index) => (
        <span
          key={index}
          style={{ animationDelay: `${index * 70}ms` }}
          className={cn(
            'pop-in rounded-full',
            size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
            index < lit ? 'bg-sun-500' : 'bg-rapid-200',
          )}
        />
      ))}
    </span>
  );
}

/** The floating evidence card used over hero photography. */
export function FindingCard({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        'glass w-[300px] rounded-[22px] p-5 text-ink shadow-float ring-1 ring-white/60 sm:w-[330px]',
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-3 text-xs font-semibold text-ink-soft">
        <span className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          Finding · Published
        </span>
        <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[11px] text-ink-faint">Example</span>
      </figcaption>
      <p className="mt-3 font-display text-[22px] font-bold leading-[1.12] tracking-[-0.025em]">
        <span className="text-rapid-700">7 of 9 testers</span> stopped at phone verification.
      </p>
      <DotRatio lit={stopped} of={accepted} size="sm" className="mt-4" />
      <p className="mt-4 border-t border-cream-200 pt-3 font-serif text-[16px] italic leading-snug text-ink-soft">
        “I wasn’t sure the code would work on my network.”
      </p>
    </figure>
  );
}

const STEPS = [
  { value: 'brief', label: 'The brief', icon: ClipboardList },
  { value: 'recruit', label: 'Who took part', icon: Users },
  { value: 'evidence', label: 'The evidence', icon: FileSearch },
  { value: 'decision', label: 'The decision', icon: Scale },
] as const;

type StepValue = (typeof STEPS)[number]['value'];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-cream-200 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="text-[15px] font-semibold text-ink sm:text-right">{value}</dd>
    </div>
  );
}

function BriefPanel() {
  return (
    <div>
      <p className="text-sm font-semibold text-rapid-700">{SAMPLE.brief.kicker}</p>
      <h3 className="mt-2 font-display text-[28px] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[34px]">
        {SAMPLE.brief.question}
      </h3>
      <dl className="mt-6">
        <Row label="Who should answer" value={SAMPLE.brief.audience} />
        <Row label="What they do" value={SAMPLE.brief.task} />
        <Row label="Terms and reward" value="Agreed before anyone is invited" />
      </dl>
    </div>
  );
}

function Bar({ label, value, of, tone }: { label: string; value: number; of: number; tone: 'green' | 'sun' | 'pale' }) {
  const width = `${Math.round((value / of) * 100)}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="tabular-nums text-ink-soft">
          <strong className="font-display text-lg text-ink">{value}</strong> of {of}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-cream-100">
        <div
          className={cn(
            'rule-grow h-full rounded-full',
            tone === 'green' && 'bg-rapid-600',
            tone === 'sun' && 'bg-sun-500',
            tone === 'pale' && 'bg-rapid-300',
          )}
          style={{ width }}
        />
      </div>
    </div>
  );
}

function RecruitPanel() {
  const invited = Number(SAMPLE.brief.invited);
  const completed = Number(SAMPLE.brief.completed);
  return (
    <div>
      <p className="text-sm font-semibold text-rapid-700">Recruitment, with every denominator</p>
      <h3 className="mt-2 font-display text-[28px] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[34px]">
        {invited} matched testers invited. {accepted} said yes.
      </h3>
      <div className="mt-7 space-y-5">
        <Bar label="Invited by the team" value={invited} of={invited} tone="pale" />
        <Bar label="Accepted the task" value={accepted} of={invited} tone="green" />
        <Bar label="Finished checkout" value={completed} of={accepted} tone="sun" />
      </div>
      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        Each step is counted on its own. An acceptance is not a completion, and a completion is not a purchase.
      </p>
    </div>
  );
}

function EvidencePanel() {
  return (
    <div>
      <p className="text-sm font-semibold text-rapid-700">{SAMPLE.finding.label}</p>
      <h3 className="mt-2 font-display text-[28px] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[34px]">
        <span className="text-rapid-700">7 of 9 testers</span> stopped at phone verification.
      </h3>
      <DotRatio lit={stopped} of={accepted} className="mt-5" />
      <figure className="relative mt-7 rounded-2xl bg-cream-100 px-5 pb-4 pt-6">
        <Quote size={22} aria-hidden="true" className="absolute -top-3 left-5 rounded-full bg-sun-500 p-1 text-ink" />
        <blockquote className="font-serif text-[21px] italic leading-[1.35] text-ink">“{SAMPLE.finding.quote}”</blockquote>
        <figcaption className="mt-2 text-sm text-ink-faint">Anonymised tester response, shared with consent</figcaption>
      </figure>
      <p className="mt-4 text-sm text-ink-soft">{SAMPLE.brief.note}.</p>
    </div>
  );
}

function DecisionPanel() {
  const choices = ['Build', 'Iterate', 'Pivot'] as const;
  return (
    <div>
      <p className="text-sm font-semibold text-rapid-700">The founder records the call</p>
      <h3 className="mt-2 font-display text-[28px] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[34px]">
        Iterate: add an SMS fallback, then test again.
      </h3>
      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-cream-100 p-1.5">
        {choices.map((choice) => (
          <span
            key={choice}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold',
              choice === 'Iterate' ? 'bg-rapid-900 text-white shadow-elev-2' : 'text-ink-soft',
            )}
          >
            {choice === 'Iterate' && <Check size={15} aria-hidden="true" />}
            {choice}
          </span>
        ))}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        Signals help decisions; they do not guarantee success. The finding says where people stopped, not what will sell.
      </p>
    </div>
  );
}

/**
 * Tabbed walk-through of one example test. It advances on its own while in
 * view, and stops as soon as the visitor picks a step.
 */
export function ProductPreview({ className }: { className?: string }) {
  const [step, setStep] = useState<StepValue>('brief');
  const [touched, setTouched] = useState(false);
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  }, []);

  useEffect(() => {
    if (touched || !inView || reduced.current) return;
    const timer = window.setInterval(() => {
      setStep((current) => {
        const index = STEPS.findIndex((item) => item.value === current);
        return STEPS[(index + 1) % STEPS.length]!.value;
      });
    }, 5200);
    return () => window.clearInterval(timer);
  }, [touched, inView]);

  return (
    <div ref={ref} className={cn('overflow-hidden rounded-[28px] bg-white shadow-elev-3 ring-1 ring-cream-200', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-cream-200 bg-cream-50 px-5 py-3">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <i className="h-2.5 w-2.5 rounded-full bg-cream-300" />
          <i className="h-2.5 w-2.5 rounded-full bg-cream-300" />
          <i className="h-2.5 w-2.5 rounded-full bg-cream-300" />
        </span>
        <span className="truncate text-xs font-semibold text-ink-faint">RAPID · Test 04 · Checkout drop-off</span>
        <span className="rounded-full bg-sun-100 px-2.5 py-0.5 text-xs font-semibold text-sun-700">Example</span>
      </div>
      <Tabs.Root
        value={step}
        onValueChange={(value) => {
          setTouched(true);
          setStep(value as StepValue);
        }}
        className="grid md:grid-cols-[230px_minmax(0,1fr)]"
      >
        <Tabs.List
          aria-label="Example test, step by step"
          className="flex gap-1 overflow-x-auto border-b border-cream-200 p-2 md:flex-col md:border-b-0 md:border-r md:p-3"
        >
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Tabs.Trigger
                key={item.value}
                value={item.value}
                className="group relative flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-ink-soft transition-colors hover:bg-cream-50 hover:text-ink data-[state=active]:bg-rapid-900 data-[state=active]:text-white"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-soft transition-colors group-data-[state=active]:bg-sun-500 group-data-[state=active]:text-ink">
                  <Icon size={15} aria-hidden="true" />
                </span>
                <span>
                  <span className="hidden text-[11px] font-medium opacity-70 md:block">Step {index + 1}</span>
                  {item.label}
                </span>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
        <div className="min-h-[380px] p-6 sm:p-9">
          <Tabs.Content value="brief" className="rise focus-visible:outline-none">
            <BriefPanel />
          </Tabs.Content>
          <Tabs.Content value="recruit" className="rise focus-visible:outline-none">
            <RecruitPanel />
          </Tabs.Content>
          <Tabs.Content value="evidence" className="rise focus-visible:outline-none">
            <EvidencePanel />
          </Tabs.Content>
          <Tabs.Content value="decision" className="rise focus-visible:outline-none">
            <DecisionPanel />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
