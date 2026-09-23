import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { NAV_LINKS } from '@/content/copy';
import { cn } from '@/lib/cn';

interface HeaderProps {
  onJoinWaitlist: () => void;
}

const SCROLL_SPY_IDS = ['how-it-works', 'explore-ideas', 'roles'];

export function Header({ onJoinWaitlist }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollSpy(SCROLL_SPY_IDS);

  const getHrefId = useCallback(
    (href: string) => {
      if (href === '#roles') return 'roles';
      return href.replace('#', '');
    },
    []
  );

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 h-[72px] border-b border-white/10 glass-dark"
        role="banner"
      >
        <Container className="flex h-full items-center justify-between">
          {/* Logo */}
          <a href="/" aria-label="RAPID home" className="shrink-0">
            <Logo size={32} />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const id = getHrefId(link.href);
              const isActive = activeId === id;
              return (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  className={cn(
                    'relative text-[15px] font-medium transition-colors',
                    isActive ? 'text-brand-500' : 'text-dark-text hover:text-brand-500'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <Button
            variant="primary"
            size="sm"
            showArrow
            className="hidden lg:inline-flex"
            onClick={onJoinWaitlist}
          >
            Join waitlist
          </Button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-dark-text hover:bg-navy-800"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </Container>
      </header>

      <MobileMenu
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        onJoinWaitlist={onJoinWaitlist}
      />
    </>
  );
}
