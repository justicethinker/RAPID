import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  light?: boolean;
  as?: 'section' | 'div';
}

export function Section({
  id,
  children,
  className,
  dark,
  light,
  as: Tag = 'section',
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'py-[56px] lg:py-24',
        dark && 'section-dark',
        light && 'section-light on-light',
        !dark && !light && 'bg-navy-950',
        className
      )}
    >
      {children}
    </Tag>
  );
}
