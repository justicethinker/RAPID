import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  dark?: boolean; // true = on dark bg (text-grad-dark), false = on light bg (text-grad-light)
}

export function GradientText({ children, className, dark = true }: GradientTextProps) {
  return (
    <span className={cn(dark ? 'text-grad-dark' : 'text-grad-light', className)}>
      {children}
    </span>
  );
}
