import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { SITE } from '@/content/pilot';
import { trackEvent } from '@/lib/analytics';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
      <Container className="flex h-[68px] items-center justify-between gap-3">
        <Link to="/" aria-label="RAPID home" className="shrink-0 text-ink">
          <Logo size={30} />
        </Link>

        <ButtonLink
          to="/join"
          size="sm"
          showArrow
          onClick={() =>
            trackEvent('cta_click', { cta: 'request_invite', location: 'header' })
          }
          className="px-4 text-[13px] sm:px-5 sm:text-sm"
        >
          {SITE.requestInvite}
        </ButtonLink>
      </Container>
    </header>
  );
}
