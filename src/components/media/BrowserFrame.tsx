import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BrowserFrameProps {
  children: ReactNode;
  className?: string;
  showUrl?: boolean;
}

export function BrowserFrame({ children, className, showUrl }: BrowserFrameProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL as string | undefined;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl shadow-elev-2 border border-sand-200',
        className
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 bg-navy-900 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-brand-500" />
        {showUrl && siteUrl && (
          <span className="ml-4 rounded-md bg-navy-800/60 px-3 py-1 text-xs text-dark-muted">
            {siteUrl.replace(/^https?:\/\//, '')}
          </span>
        )}
      </div>
      {/* Body */}
      <div className="bg-white">{children}</div>
    </div>
  );
}
