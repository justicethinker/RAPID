import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return (
    typeof window === 'undefined' ||
    !window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  );
}

/**
 * Counts a number up on first paint. The final value is what a screen reader
 * and any test sees once the animation settles; reduced motion skips straight
 * to it.
 */
export function CountUp({
  value,
  duration = 900,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const reducedMotion = prefersReducedMotion();
  const [display, setDisplay] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;

    const start = performance.now();
    const from = 0;
    const delta = value - from;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo: fast start, calm landing.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + delta * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration, reducedMotion]);

  return <span className={className}>{reducedMotion ? value : display}</span>;
}
