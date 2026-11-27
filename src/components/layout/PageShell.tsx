import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SkipLink } from '@/components/layout/SkipLink';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export function PageShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-studio-50">
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Keyed by path so every navigation gets a gentle rise instead of a
            hard cut. The animation is disabled under reduced motion. */}
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
