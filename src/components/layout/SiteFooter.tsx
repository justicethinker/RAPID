import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';
import { supportEmail, supportEmailHref } from '@/lib/site';

const linkClass =
  'inline-flex min-h-[44px] items-center text-sm text-light-muted transition-colors hover:text-ink';

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-white" role="contentinfo">
      <Container className="flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link to="/" aria-label="RAPID home" className="text-ink">
          <Logo size={24} />
        </Link>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-1"
        >
          <Link to="/founders" className={linkClass}>
            For founders
          </Link>
          <Link to="/privacy" className={linkClass}>
            Privacy
          </Link>
          <a href={supportEmailHref} className={linkClass} aria-label="Email RAPID support">
            {supportEmail}
          </a>
        </nav>

        <p className="text-xs text-light-muted">© RAPID. Pilot website.</p>
      </Container>
    </footer>
  );
}
