import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';
import { FOOTER } from '@/content/copy';

export function Footer() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

  return (
    <footer className="surface-dark seam-hairline py-8 pb-[100px]" role="contentinfo">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size={24} />
        <nav className="flex items-center gap-6 text-sm text-dark-muted" aria-label="Footer navigation">
          <a href="/privacy" className="inline-flex min-h-[44px] items-center hover:text-brand-500 transition-colors">
            {FOOTER.privacy}
          </a>
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex min-h-[44px] items-center hover:text-brand-500 transition-colors"
            >
              {FOOTER.contact}
            </a>
          )}
          <a href="#explore-ideas" className="inline-flex min-h-[44px] items-center hover:text-brand-500 transition-colors">
            {FOOTER.exploreDemo}
          </a>
        </nav>
        <p className="text-xs text-dark-muted/70">{FOOTER.copyright}</p>
      </Container>
    </footer>
  );
}
