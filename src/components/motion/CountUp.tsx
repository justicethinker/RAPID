import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';

function prefersReducedMotion(): boolean {
  return (
    typeof window === 'undefined' ||
    !window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  );
}

/**
 * Counts a number up the first time it scrolls into view. Screen readers and
 * tests read the final value from the label; reduced motion skips straight
 * to it.
 */
export function CountUp({
  value,
  duration = 1100,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const reducedMotion = prefersReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const frame = useRef(0);
  // Never leave a number parked at zero: count anyway shortly after mount,
  // even if the value sits below the fold.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);
  const started = inView || timedOut;

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    if (!started) return;

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo: fast start, calm landing.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration, reducedMotion, started]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
