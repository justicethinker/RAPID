import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'mint';
}

export function Chip({ children, className, variant = 'default' }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variant === 'default' && 'border border-navy-100 bg-navy-50 text-light-muted',
        variant === 'mint' && 'bg-brand-50 text-brand-700',
        className
      )}
    >
      {children}
    </span>
  );
}
