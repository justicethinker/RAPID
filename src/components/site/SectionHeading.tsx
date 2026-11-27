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
        <p className={cn('kicker', tone === 'dark' && '!text-rapid-100')}>{eyebrow}</p>
      )}
      <h2
        id={id}
        className={cn(
          't-section',
          eyebrow && 'mt-4',
          tone === 'dark' ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            'lead mt-4',
            tone === 'dark' && '!text-rapid-100',
          )}
        >
          {lead}
        </p>
      )}
      {children}
    </div>
  );
}
