import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'emerald' | 'gray' | 'amber';
}

export function Badge({ children, className, variant = 'emerald' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
        variant === 'emerald' && 'bg-brand-50 text-brand-700',
        variant === 'gray' && 'border border-navy-100 bg-navy-50 text-light-muted',
        variant === 'amber' && 'bg-warn-50 text-warn-900',
        className
      )}
    >
      {children}
    </span>
  );
}
