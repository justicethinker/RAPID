import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface StickyCtaProps {
  onJoinWaitlist: () => void;
}

export function StickyCta({ onJoinWaitlist }: StickyCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('top');
      const finalCta = document.getElementById('final-cta');
      if (!hero) return;

      const heroRect = hero.getBoundingClientRect();
      const pastHero = heroRect.bottom < -80;

      let nearFinalCta = false;
      if (finalCta) {
        const finalRect = finalCta.getBoundingClientRect();
        nearFinalCta = finalRect.top < window.innerHeight;
      }

      setVisible(pastHero && !nearFinalCta);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 lg:hidden px-4 pb-4 transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      )}
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <Button
        variant="primary"
        className="w-full"
        showArrow
        onClick={onJoinWaitlist}
      >
        Join the waitlist
      </Button>
    </div>
  );
}
