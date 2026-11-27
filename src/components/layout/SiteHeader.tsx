import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';
import { buttonStyles } from '@/components/ui/buttonStyles';
import { cn } from '@/lib/cn';

export const NAV = [
  { to: '/founders', label: 'For founders' },
  { to: '/join', label: 'For testers' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/discover', label: 'Discover' },
  { to: '/about', label: 'About' },
];

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * The public header. On pages that open with a dark photographic hero it
 * starts transparent with light type, then settles into a cream glass bar
 * once the visitor scrolls. Small screens get a full-height drawer.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const dark = overlay && !scrolled && !open;

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'top-0 z-50 w-full transition-[background-color,box-shadow,color] duration-500',
        overlay ? 'fixed' : 'sticky',
        dark
          ? 'on-dark bg-transparent text-white'
          : 'border-b border-ink/[0.06] bg-cream-50/[0.86] text-ink shadow-[0_8px_30px_-24px_rgba(22,21,15,.35)] backdrop-blur-xl',
      )}
    >
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label="RAPID home" className="shrink-0 transition-opacity hover:opacity-80">
          <Logo size={30} />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors',
                  dark ? 'text-white/85 hover:text-white' : 'text-ink-soft hover:text-ink',
                  isActive && (dark ? 'text-white' : 'text-ink'),
                  'after:absolute after:inset-x-3.5 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-sun-500 after:transition-transform after:duration-300 hover:after:scale-x-100',
                  isActive && 'after:scale-x-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/sign-in"
            className={cn(
              'hidden rounded-full px-4 py-2 text-[15px] font-medium transition-colors sm:inline-flex',
              dark ? 'text-white/90 hover:text-white' : 'text-ink-soft hover:text-ink',
            )}
          >
            Sign in
          </Link>
          <Link to="/contact" className={buttonStyles({ size: 'sm', className: 'hidden sm:inline-flex' })}>
            Test my idea
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors lg:hidden',
                dark ? 'border-white/30 text-white hover:bg-white/10' : 'border-ink/15 text-ink hover:bg-white',
              )}
            >
              <Menu size={18} aria-hidden="true" />
              Menu
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[60] bg-rapid-950/50 backdrop-blur-sm data-[state=open]:animate-[rapidFadeIn_.25s_ease]" />
              <Dialog.Content className="on-dark fixed inset-y-0 right-0 z-[70] flex w-full max-w-[420px] flex-col overflow-y-auto bg-rapid-900 px-6 pb-8 pt-5 text-white shadow-2xl focus:outline-none data-[state=open]:animate-[rapidFadeUp_.4s_cubic-bezier(.16,1,.3,1)]">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="sr-only">Menu</Dialog.Title>
                  <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
                  <Link to="/" aria-label="RAPID home" className="text-white">
                    <Logo size={28} />
                  </Link>
                  <Dialog.Close
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10"
                    aria-label="Close menu"
                  >
                    <X size={18} aria-hidden="true" />
                  </Dialog.Close>
                </div>
                <nav aria-label="Mobile navigation" className="mt-10 flex flex-col">
                  {NAV.map((item, index) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      style={{ animationDelay: `${80 + index * 50}ms` }}
                      className={({ isActive }) =>
                        cn(
                          'rise flex items-center justify-between border-b border-white/10 py-4 font-display text-[28px] font-bold tracking-[-0.025em]',
                          isActive ? 'text-sun-300' : 'text-white hover:text-sun-200',
                        )
                      }
                    >
                      {item.label}
                      <ArrowRight size={20} aria-hidden="true" className="opacity-60" />
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-auto grid gap-3 pt-10">
                  <Link to="/contact" className={buttonStyles({ size: 'lg' })}>
                    Test my idea
                  </Link>
                  <Link to="/sign-in" className={buttonStyles({ size: 'lg', variant: 'inverse' })}>
                    Sign in
                  </Link>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </Container>
    </header>
  );
}
