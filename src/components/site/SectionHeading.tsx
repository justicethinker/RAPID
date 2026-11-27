import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  tone = 'light',
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn('max-w-[780px]', className)}>
      {eyebrow && (
        <p
          className={cn(
            't-eyebrow',
            tone === 'dark' ? 'text-brand-500' : 'text-brand-700',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          't-section',
          eyebrow && 'mt-3',
          tone === 'dark' ? 'text-studio-25' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            'lead mt-4',
            tone === 'dark' && '!text-dark-muted',
          )}
        >
          {lead}
        </p>
      )}
      {children}
    </div>
  );
}
