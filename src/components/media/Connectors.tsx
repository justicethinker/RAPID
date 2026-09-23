import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface ConnectorPath {
  d: string;
  delay?: number;
}

interface ConnectorsProps {
  paths: ConnectorPath[];
  className?: string;
  width?: number;
  height?: number;
}

export function Connectors({ paths, className, width = 1, height = 1 }: ConnectorsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // eslint-disable-next-line react/set-state-in-effect
      setDrawn(true);
      return;
    }

    const timer = setTimeout(() => setDrawn(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('absolute inset-0 overflow-visible pointer-events-none', className)}
      aria-hidden="true"
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke="#15E6A0"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 6px #15E6A0)',
            strokeDasharray: 1000,
            strokeDashoffset: drawn ? 0 : 1000,
            transition: `stroke-dashoffset 1.2s ease ${p.delay ?? i * 0.3}s`,
          }}
        />
      ))}
      {/* End dots */}
      {paths.map((p, i) => {
        const match = p.d.match(/([\d.]+)\s+([\d.]+)\s*$/);
        if (!match) return null;
        const cx = parseFloat(match[1]!);
        const cy = parseFloat(match[2]!);
        return (
          <circle
            key={`dot-${i}`}
            cx={cx}
            cy={cy}
            r="4"
            fill="#15E6A0"
            style={{
              filter: 'drop-shadow(0 0 4px #15E6A0)',
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.4s ease ${(p.delay ?? i * 0.3) + 1}s`,
            }}
          />
        );
      })}
    </svg>
  );
}
