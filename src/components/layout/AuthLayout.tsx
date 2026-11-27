import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';
import { SkipLink } from '@/components/layout/SkipLink';

/**
 * The account pages share one calm frame: a slim header, then a content
 * column (optionally paired with a photo panel through `AuthSplit`).
 */
export function AuthLayout({
  children,
  width = 'max-w-[440px]',
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-cream-50">
      <SkipLink />
      <div aria-hidden="true" className="paper-grid pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
      <div aria-hidden="true" className="breathe pointer-events-none absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-sun-200/40 blur-3xl" />
      <header className="relative">
        <Container className="flex h-[76px] items-center justify-between gap-4">
          <Link to="/" aria-label="RAPID home" className="fade-in text-ink transition-opacity hover:opacity-80">
            <Logo size={28} />
          </Link>
          <Link
            to="/"
            className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
          >
            <ArrowLeft size={15} aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
            Back to site
          </Link>
        </Container>
      </header>

      <main id="main" className="relative flex flex-1 items-start justify-center px-5 pb-16 pt-6 sm:pt-12">
        <div className={`hero-stagger w-full ${width}`}>{children}</div>
      </main>
    </div>
  );
}
