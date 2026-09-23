import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PillProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function Pill({ children, className, icon, active, onClick }: PillProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
          active
            ? 'bg-brand-500 text-ink'
            : 'border border-navy-line bg-navy-800/70 text-dark-text hover:border-brand-500/50',
          className
        )}
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium',
        'border border-navy-line bg-navy-800/70 text-dark-text',
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
