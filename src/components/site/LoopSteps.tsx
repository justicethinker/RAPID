import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/cn';

export interface LoopStep {
  title: string;
  body: string;
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true'; className?: string }>;
}

/**
 * An animated process: a track fills from step to step while the section is
 * in view. Visitors can pick a step to pause the cycle. Reduced motion shows
 * every step at rest.
 */
export function LoopSteps({ steps, tone = 'dark' }: { steps: LoopStep[]; tone?: 'dark' | 'light' }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  }, []);

  useEffect(() => {
    if (!inView || paused || reduced.current) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % steps.length), 3200);
    return () => window.clearInterval(timer);
  }, [inView, paused, steps.length]);

  const dark = tone === 'dark';
  const progress = steps.length > 1 ? (active / (steps.length - 1)) * 100 : 100;

  return (
    <div ref={ref} className="relative">
      {/* Progress track: fills as the loop moves from step to step. */}
      <div aria-hidden="true" className="relative mb-8 h-[3px]">
        <span className={cn('absolute inset-0 rounded-full', dark ? 'bg-white/15' : 'bg-cream-200')} />
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-sun-500 transition-[width] duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="relative grid gap-4 md:gap-6" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 230px), 1fr))` }}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === active;
        const done = index < active;
        return (
          <li key={step.title} className="relative" style={{ listStyle: 'none' }}>
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                setActive(index);
              }}
              aria-pressed={isActive}
              className={cn(
                'group flex h-full w-full flex-col rounded-[24px] p-6 text-left transition-all duration-500 sm:p-7',
                dark
                  ? isActive
                    ? 'bg-white text-ink shadow-float'
                    : 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.1]'
                  : isActive
                    ? 'bg-rapid-900 text-white shadow-float'
                    : 'bg-white text-ink ring-1 ring-inset ring-cream-200 hover:ring-rapid-300',
              )}
            >
              <span className="flex items-center justify-between">
                <span
                  className={cn(
                    'relative z-10 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-500',
                    isActive || done ? 'bg-sun-500 text-ink' : dark ? 'bg-rapid-800 text-rapid-100' : 'bg-cream-100 text-ink-soft',
                  )}
                >
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'font-display text-[44px] font-extrabold leading-none tracking-[-0.05em] transition-colors duration-500',
                    isActive ? (dark ? 'text-rapid-100' : 'text-rapid-700') : dark ? 'text-white/15' : 'text-cream-300',
                  )}
                >
                  0{index + 1}
                </span>
              </span>
              <span className="mt-8 block font-display text-[24px] font-bold leading-[1.1] tracking-[-0.02em]">{step.title}</span>
              <span
                className={cn(
                  'mt-3 block text-[15px] leading-relaxed',
                  isActive ? (dark ? 'text-ink-soft' : 'text-rapid-100') : dark ? 'text-rapid-100' : 'text-ink-soft',
                )}
              >
                {step.body}
              </span>
            </button>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
