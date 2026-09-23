import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface IconCircleProps {
  children: ReactNode;
  className?: string;
  size?: number;
  variant?: 'mint' | 'outline' | 'light-blue';
}

export function IconCircle({
  children,
  className,
  size = 42,
  variant = 'mint',
}: IconCircleProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0',
        variant === 'mint' && 'bg-sand-100 text-brand-700',
        variant === 'outline' && 'border border-white/15 bg-white/[.04] text-brand-500',
        variant === 'light-blue' && 'bg-sand-100 text-navy-700',
        className
      )}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}
