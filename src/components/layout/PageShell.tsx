import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SkipLink } from '@/components/layout/SkipLink';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

/**
 * Public page frame. `overlayHeader` lets a page open with a full-bleed dark
 * hero that the header floats over.
 */
export function PageShell({ children, overlayHeader = false }: { children: ReactNode; overlayHeader?: boolean }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <SkipLink />
      <SiteHeader overlay={overlayHeader} />
      <main id="main" className="flex-1">
        {/* Keyed by path so every navigation gets a gentle rise. Disabled
            under reduced motion. */}
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
