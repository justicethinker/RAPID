import type { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SampleLabelProps {
  children?: ReactNode;
  className?: string;
  icon?: boolean;
}

export function SampleLabel({ children = 'Sample data', className, icon = true }: SampleLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs tracking-wide text-dark-muted/70',
        className
      )}
    >
      {icon && <FlaskConical size={12} strokeWidth={1.5} />}
      {children}
    </span>
  );
}
