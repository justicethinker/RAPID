import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';

/**
 * The account pages share one calm frame: the logo, then a content column
 * (optionally paired with a portrait rail through `AuthSplit`). Public
 * marketing pages keep their own header and footer.
 */
export function AuthLayout({
  children,
  width = 'max-w-[440px]',
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="auth-studio relative flex min-h-screen flex-col overflow-hidden bg-studio-50">
      <div
        aria-hidden="true"
        className="auth-pattern pointer-events-none absolute inset-x-0 top-0 h-full"
      />
      <header className="relative border-b border-studio-200">
        <div aria-hidden="true" className="h-[3px] bg-brand-500" />
        <Container className="flex h-[72px] items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="RAPID home"
            className="fade-in text-ink transition-transform duration-300 hover:-rotate-1"
          >
            <Logo size={28} />
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-[12px] font-bold text-light-muted transition-colors hover:text-brand-700"
          >
            Back to site
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </Container>
      </header>

      <main
        id="main"
        className="relative flex flex-1 items-start justify-center px-5 pb-16 pt-8 sm:pt-12"
      >
        <div className={`hero-stagger w-full ${width}`}>{children}</div>
      </main>
    </div>
  );
}
