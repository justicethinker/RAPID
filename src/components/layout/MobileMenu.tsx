import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS } from '@/content/copy';

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinWaitlist: () => void;
}

export function MobileMenu({ open, onOpenChange, onJoinWaitlist }: MobileMenuProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col p-6"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between mb-12">
            <Logo size={32} />
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-dark-text hover:bg-navy-800"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex-1 flex flex-col gap-6" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenChange(false);
                  requestAnimationFrame(() => {
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  });
                }}
                className="text-xl font-medium text-dark-text hover:text-brand-500 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button
            variant="primary"
            className="w-full mt-8"
            showArrow
            onClick={() => {
              onOpenChange(false);
              onJoinWaitlist();
            }}
          >
            Join waitlist
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
